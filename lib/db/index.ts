import { SQLiteAdapter } from './adapters/sqlite.adapter';

export function getDb() {
  return new SQLiteAdapter();
}

export class SQLiteAdapter {
  private db: any;

  constructor(dbPath?: string) {
    const Database = require('better-sqlite3');
    const path = require('path');
    const DB_PATH = dbPath || path.join(process.cwd(), 'renovation-budget.db');
    this.db = new Database(DB_PATH);
  }

  // User methods
  getUser(email: string) {
    return this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  getUserById(id: number) {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  createUser(email: string, hashedPassword: string, name: string) {
    const stmt = this.db.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    );
    const result = stmt.run(email, hashedPassword, name);
    return this.getUserById(result.lastInsertRowid);
  }

  updateUser(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`UPDATE users SET ${fields} WHERE id = @id`);
    stmt.run({ ...data, id });
    return this.getUserById(id);
  }

  // Session methods
  createSession(userId: number, token: string, expiresAt: Date) {
    const stmt = this.db.prepare(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
    );
    stmt.run(userId, token, expiresAt.toISOString());
  }

  getSession(token: string) {
    return this.db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  }

  deleteSession(token: string) {
    return this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  cleanExpiredSessions() {
    return this.db.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run();
  }

  // Project methods
  getProjects(userId: number) {
    return this.db.prepare(`
      SELECT p.*, u.name as owner_name 
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).all(userId);
  }

  getProject(id: number) {
    return this.db.prepare(`
      SELECT p.*, u.name as owner_name 
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(id);
  }

  createProject(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (user_id, name, description, total_budget, start_date, target_end_date, status)
      VALUES (@user_id, @name, @description, @total_budget, @start_date, @target_end_date, @status)
    `);
    const result = stmt.run(data);
    return this.getProject(result.lastInsertRowid as number);
  }

  updateProject(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`UPDATE projects SET ${fields} WHERE id = @id`);
    stmt.run({ ...data, id });
    return this.getProject(id);
  }

  deleteProject(id: number) {
    return this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }

  // Room methods
  getRoomsByProject(projectId: number) {
    return this.db.prepare(`
      SELECT * FROM rooms 
      WHERE project_id = ? 
      ORDER BY created_at DESC
    `).all(projectId);
  }

  getRoom(id: number) {
    return this.db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  }

  createRoom(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO rooms (project_id, name, description, allocated_budget)
      VALUES (@project_id, @name, @description, @allocated_budget)
    `);
    const result = stmt.run(data);
    return this.getRoom(result.lastInsertRowid as number);
  }

  updateRoom(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`UPDATE rooms SET ${fields} WHERE id = @id`);
    stmt.run({ ...data, id });
    return this.getRoom(id);
  }

  deleteRoom(id: number) {
    return this.db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
  }


  // Project Summary methods
  getProjectSummary(projectId: number) {
    const summary = this.db.prepare(`
      SELECT 
        COUNT(DISTINCT bi.id) as total_items,
        COUNT(DISTINCT bi.room_id) as rooms_count,
        COALESCE(SUM(bi.estimated_cost), 0) as total_estimated,
        COALESCE(SUM(bi.actual_cost), 0) as total_actual
      FROM budget_items bi
      WHERE bi.project_id = ?
    `).get(projectId);

    const byRoom = this.db.prepare(`
      SELECT 
        r.id, 
        r.name as room,
        r.name as room_name, 
        COALESCE(r.allocated_budget, 0) as allocated_budget,
        COUNT(bi.id) as item_count,
        COALESCE(SUM(bi.estimated_cost), 0) as estimated_total,
        COALESCE(SUM(bi.actual_cost), 0) as actual_total
      FROM rooms r
      LEFT JOIN budget_items bi ON r.id = bi.room_id AND bi.project_id = ?
      WHERE r.project_id = ?
      GROUP BY r.id, r.name, r.allocated_budget
      ORDER BY r.name
    `).all(projectId, projectId);

    const byCategory = this.db.prepare(`
      SELECT 
        COALESCE(c.id, 0) as id,
        COALESCE(c.name, 'Uncategorized') as category,
        COALESCE(c.icon, 'MoreHorizontal') as icon,
        COALESCE(c.color, '#6B7280') as color,
        COUNT(bi.id) as item_count,
        COALESCE(SUM(bi.estimated_cost), 0) as estimated_total,
        COALESCE(SUM(bi.actual_cost), 0) as actual_total
      FROM budget_items bi
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE bi.project_id = ?
      GROUP BY c.id, c.name, c.icon, c.color
      HAVING item_count > 0
      ORDER BY estimated_total DESC
    `).all(projectId);

    const byType = this.db.prepare(`
      SELECT 
        bd.detail_type as type,
        COUNT(bd.id) as items_count,
        COALESCE(SUM(bd.total_amount), 0) as estimated,
        0 as actual
      FROM budget_details bd
      JOIN budget_items bi ON bd.budget_item_id = bi.id
      WHERE bi.project_id = ?
      GROUP BY bd.detail_type
      ORDER BY estimated DESC
    `).all(projectId);

    return { summary, byRoom, byCategory, byType };
  }

  // Category methods
  getCategories() {
    return this.db.prepare('SELECT * FROM categories ORDER BY name').all();
  }

  // Vendor methods
  getVendorsByProject(projectId: number) {
    return this.db.prepare(`
      SELECT * FROM vendors 
      WHERE project_id = ? 
      ORDER BY created_at DESC
    `).all(projectId);
  }

  getVendor(id: number) {
    return this.db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
  }

  createVendor(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO vendors (project_id, name, contact_person, phone, email, address, specialization, rating, notes)
      VALUES (@project_id, @name, @contact_person, @phone, @email, @address, @specialization, @rating, @notes)
    `);
    const result = stmt.run(data);
    return this.getVendor(result.lastInsertRowid as number);
  }

  updateVendor(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`UPDATE vendors SET ${fields} WHERE id = @id`);
    stmt.run({ ...data, id });
    return this.getVendor(id);
  }

  deleteVendor(id: number) {
    return this.db.prepare('DELETE FROM vendors WHERE id = ?').run(id);
  }

  // Timeline methods
  getTimelineByProject(projectId: number) {
    const entries = this.db.prepare(`
      SELECT * FROM timeline_entries 
      WHERE project_id = ? 
      ORDER BY start_date, created_at
    `).all(projectId);

    // Get budget items for each timeline entry
    return entries.map((entry: any) => {
      const budgetItems = this.db.prepare(`
        SELECT bi.*, r.name as room_name
        FROM timeline_budget_items tbi
        JOIN budget_items bi ON tbi.budget_item_id = bi.id
        LEFT JOIN rooms r ON bi.room_id = r.id
        WHERE tbi.timeline_entry_id = ?
      `).all(entry.id);

      return { ...entry, budgetItems };
    });
  }

  getTimelineEntry(id: number) {
    return this.db.prepare('SELECT * FROM timeline_entries WHERE id = ?').get(id);
  }

  createTimelineEntry(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO timeline_entries (
        project_id, title, description, start_date, end_date, 
        status, milestone, dependencies, assigned_to, progress_percentage
      )
      VALUES (
        @project_id, @title, @description, @start_date, @end_date,
        @status, @milestone, @dependencies, @assigned_to, @progress_percentage
      )
    `);
    const result = stmt.run({
      ...data,
      milestone: data.milestone ? 1 : 0,
      progress_percentage: data.progress_percentage || 0
    });
    return this.getTimelineEntry(result.lastInsertRowid as number);
  }

  updateTimelineEntry(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`
      UPDATE timeline_entries SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id
    `);
    stmt.run({ ...data, id });
    return this.getTimelineEntry(id);
  }

  deleteTimelineEntry(id: number) {
    return this.db.prepare('DELETE FROM timeline_entries WHERE id = ?').run(id);
  }

  // Timeline-Budget linking methods
  linkBudgetToTimeline(timelineEntryId: number, budgetItemIds: number[]) {
    // First, remove existing links
    this.db.prepare('DELETE FROM timeline_budget_items WHERE timeline_entry_id = ?').run(timelineEntryId);
    
    // Then add new links
    const stmt = this.db.prepare(`
      INSERT INTO timeline_budget_items (timeline_entry_id, budget_item_id)
      VALUES (?, ?)
    `);
    
    for (const budgetItemId of budgetItemIds) {
      stmt.run(timelineEntryId, budgetItemId);
    }
  }

  getTimelineBudgetItems(timelineEntryId: number) {
    return this.db.prepare(`
      SELECT bi.*, r.name as room_name
      FROM timeline_budget_items tbi
      JOIN budget_items bi ON tbi.budget_item_id = bi.id
      LEFT JOIN rooms r ON bi.room_id = r.id
      WHERE tbi.timeline_entry_id = ?
    `).all(timelineEntryId);
  }

  // Timeline Notes methods
  getTimelineNotes(timelineEntryId: number) {
    return this.db.prepare(`
      SELECT tn.*
      FROM timeline_notes tn
      WHERE tn.timeline_entry_id = ?
      ORDER BY tn.created_at DESC
    `).all(timelineEntryId);
  }

  createTimelineNote(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO timeline_notes (timeline_entry_id, content, author)
      VALUES (@timeline_entry_id, @content, @author)
    `);
    const result = stmt.run({
      timeline_entry_id: data.timeline_entry_id,
      content: data.note || data.content,
      author: data.author || null
    });
    return this.db.prepare(`
      SELECT * FROM timeline_notes WHERE id = ?
    `).get(result.lastInsertRowid);
  }

  deleteTimelineNote(id: number) {
    return this.db.prepare('DELETE FROM timeline_notes WHERE id = ?').run(id);
  }

  // Budget Items methods (now master records)
  getBudgetItems(projectId: number) {
    return this.db.prepare(`
      SELECT 
        bi.*,
        r.name as room_name,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(bi.total_material, 0) as total_material,
        COALESCE(bi.total_labour, 0) as total_labour,
        COALESCE(bi.total_service, 0) as total_service,
        COALESCE(bi.total_other, 0) as total_other,
        COALESCE(bi.total_new_item, 0) as total_new_item,
        (SELECT COUNT(*) FROM budget_details WHERE budget_item_id = bi.id) as detail_count
      FROM budget_items bi
      LEFT JOIN rooms r ON bi.room_id = r.id
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE bi.project_id = ?
      ORDER BY bi.display_order, bi.created_at DESC
    `).all(projectId);
  }

  getBudgetItem(id: number) {
    return this.db.prepare(`
      SELECT 
        bi.*,
        r.name as room_name,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM budget_items bi
      LEFT JOIN rooms r ON bi.room_id = r.id
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE bi.id = ?
    `).get(id);
  }

  createBudgetItem(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO budget_items (
        project_id, room_id, category_id, name, description,
        is_master, status, display_order
      ) VALUES (
        @project_id, @room_id, @category_id, @name, @description,
        1, @status, @display_order
      )
    `);
    const result = stmt.run({
      ...data,
      status: data.status || 'pending',
      display_order: data.display_order || 0
    });
    return this.getBudgetItem(result.lastInsertRowid as number);
  }

  updateBudgetItem(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`UPDATE budget_items SET ${fields} WHERE id = @id`);
    stmt.run({ ...data, id });
    return this.getBudgetItem(id);
  }

  deleteBudgetItem(id: number) {
    return this.db.prepare('DELETE FROM budget_items WHERE id = ?').run(id);
  }

  // Budget Details methods
  getBudgetDetails(budgetItemId: number) {
    return this.db.prepare(`
      SELECT * FROM budget_details 
      WHERE budget_item_id = ? 
      ORDER BY display_order, created_at
    `).all(budgetItemId);
  }

  getBudgetDetail(id: number) {
    return this.db.prepare('SELECT * FROM budget_details WHERE id = ?').get(id);
  }

  createBudgetDetail(budgetItemId: number, detail: any) {
    const result = this.db.prepare(`
      INSERT INTO budget_details (
        budget_item_id, detail_type, name, description, 
        quantity, unit_price, total_amount, vendor, 
        purchase_date, invoice_number, notes, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      budgetItemId,
      detail.detail_type,
      detail.name,
      detail.description,
      detail.quantity || 1,
      detail.unit_price || 0,
      detail.total_amount || (detail.quantity || 1) * (detail.unit_price || 0),
      detail.vendor,
      detail.purchase_date,
      detail.invoice_number,
      detail.notes,
      detail.display_order || 0
    );
    
    return this.getBudgetDetail(result.lastInsertRowid as number);
  }

  updateBudgetDetail(detailId: number, updates: any) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'budget_item_id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    // Recalculate total_amount if quantity or unit_price changed
    if (updates.quantity !== undefined || updates.unit_price !== undefined) {
      const current = this.db.prepare('SELECT quantity, unit_price FROM budget_details WHERE id = ?').get(detailId) as any;
      const quantity = updates.quantity ?? current.quantity;
      const unitPrice = updates.unit_price ?? current.unit_price;
      fields.push('total_amount = ?');
      values.push(quantity * unitPrice);
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(detailId);
    
    this.db.prepare(`
      UPDATE budget_details 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `).run(...values);
    
    return this.getBudgetDetail(detailId);
  }

  deleteBudgetDetail(detailId: number) {
    const result = this.db.prepare('DELETE FROM budget_details WHERE id = ?').run(detailId);
    return result.changes > 0;
  }

  // User Settings methods
  getUserSettings(userId: number) {
    let settings = this.db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    
    if (!settings) {
      // Create default settings
      this.db.prepare(`
        INSERT INTO user_settings (user_id) VALUES (?)
      `).run(userId);
      settings = this.db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    }
    
    return settings;
  }

  updateUserSettings(userId: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`
      UPDATE user_settings SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = @user_id
    `);
    stmt.run({ ...data, user_id: userId });
    return this.getUserSettings(userId);
  }

  close() {
    this.db.close();
  }
}