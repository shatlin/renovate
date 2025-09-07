import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'renovate.db');
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'db', 'schema.sql');

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.db.pragma('foreign_keys = ON');
    this.initializeDatabase();
  }

  private initializeDatabase() {
    try {
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
      this.db.exec(schema);
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Project methods
  getAllProjects() {
    return this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  }

  getProject(id: number) {
    return this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  }

  createProject(data: {
    name: string;
    description?: string;
    total_budget?: number;
    start_date?: string;
    target_end_date?: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (name, description, total_budget, start_date, target_end_date)
      VALUES (@name, @description, @total_budget, @start_date, @target_end_date)
    `);
    const result = stmt.run(data);
    return this.getProject(result.lastInsertRowid as number);
  }

  updateProject(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`
      UPDATE projects SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id
    `);
    stmt.run({ ...data, id });
    return this.getProject(id);
  }

  deleteProject(id: number) {
    return this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }

  // Room methods
  getRoomsByProject(projectId: number) {
    const rooms = this.db.prepare(`
      SELECT 
        r.*,
        COALESCE(SUM(CASE WHEN bi.estimated_cost IS NOT NULL THEN bi.estimated_cost ELSE 0 END), 0) as estimated_budget,
        COALESCE(SUM(CASE WHEN bi.actual_cost IS NOT NULL THEN bi.actual_cost ELSE 0 END), 0) as actual_cost,
        COUNT(bi.id) as item_count
      FROM rooms r
      LEFT JOIN budget_items bi ON r.id = bi.room_id
      WHERE r.project_id = ?
      GROUP BY r.id
      ORDER BY r.display_order, r.name
    `).all(projectId);
    
    // Add _count property for compatibility
    return rooms.map(room => ({
      ...room,
      _count: { items: room.item_count }
    }));
  }

  getRoom(id: number) {
    return this.db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  }

  createRoom(data: {
    project_id: number;
    name: string;
    area_sqft?: number;
    renovation_type?: string;
    status?: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO rooms (project_id, name, area_sqft, renovation_type, status)
      VALUES (@project_id, @name, @area_sqft, @renovation_type, @status)
    `);
    const result = stmt.run(data);
    return this.getRoom(result.lastInsertRowid as number);
  }

  updateRoom(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`
      UPDATE rooms SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id
    `);
    stmt.run({ ...data, id });
    return this.getRoom(id);
  }

  deleteRoom(id: number) {
    return this.db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
  }

  // Budget item methods
  getBudgetItemsByProject(projectId: number) {
    const items = this.db.prepare(`
      SELECT bi.*, r.name as room_name, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM budget_items bi
      LEFT JOIN rooms r ON bi.room_id = r.id
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE bi.project_id = ?
      ORDER BY bi.created_at DESC
    `).all(projectId);
    
    // Get timeline references for each item
    return items.map((item: any) => {
      const timelineRefs = this.db.prepare(`
        SELECT te.id, te.title, te.start_date, te.end_date
        FROM timeline_budget_items tbi
        JOIN timeline_entries te ON tbi.timeline_entry_id = te.id
        WHERE tbi.budget_item_id = ?
        ORDER BY te.start_date
      `).all(item.id);
      
      return { ...item, timeline_refs: timelineRefs };
    });
  }

  getBudgetItemsByRoom(roomId: number) {
    return this.db.prepare(`
      SELECT bi.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM budget_items bi
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE bi.room_id = ?
      ORDER BY bi.created_at DESC
    `).all(roomId);
  }

  getBudgetItem(id: number) {
    return this.db.prepare(`
      SELECT bi.*, r.name as room_name, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM budget_items bi
      LEFT JOIN rooms r ON bi.room_id = r.id
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE bi.id = ?
    `).get(id);
  }

  createBudgetItem(data: {
    project_id: number;
    room_id?: number;
    category_id?: number;
    name: string;
    description?: string;
    quantity?: number;
    unit_price?: number;
    estimated_cost?: number;
    vendor?: string;
    notes?: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO budget_items (
        project_id, room_id, category_id, name, description, 
        quantity, unit_price, estimated_cost, vendor, notes
      )
      VALUES (
        @project_id, @room_id, @category_id, @name, @description,
        @quantity, @unit_price, @estimated_cost, @vendor, @notes
      )
    `);
    const result = stmt.run(data);
    return this.getBudgetItem(result.lastInsertRowid as number);
  }

  updateBudgetItem(id: number, data: any) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`
      UPDATE budget_items SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id
    `);
    stmt.run({ ...data, id });
    return this.getBudgetItem(id);
  }

  deleteBudgetItem(id: number) {
    return this.db.prepare('DELETE FROM budget_items WHERE id = ?').run(id);
  }

  // Category methods
  getAllCategories() {
    return this.db.prepare('SELECT * FROM categories ORDER BY name').all();
  }

  // Summary methods
  getProjectSummary(projectId: number) {
    const summary = this.db.prepare(`
      SELECT 
        COUNT(DISTINCT bi.id) as total_items,
        COUNT(DISTINCT bi.room_id) as total_rooms,
        SUM(bi.estimated_cost) as total_estimated,
        SUM(bi.actual_cost) as total_actual,
        SUM(CASE WHEN bi.status = 'purchased' THEN bi.actual_cost ELSE 0 END) as total_purchased
      FROM budget_items bi
      WHERE bi.project_id = ?
    `).get(projectId);

    const byCategory = this.db.prepare(`
      SELECT 
        c.name as category,
        c.icon,
        c.color,
        COUNT(bi.id) as item_count,
        SUM(bi.estimated_cost) as estimated_total,
        SUM(bi.actual_cost) as actual_total
      FROM budget_items bi
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE bi.project_id = ?
      GROUP BY bi.category_id
      ORDER BY estimated_total DESC
    `).all(projectId);

    const byRoom = this.db.prepare(`
      SELECT 
        r.name as room,
        r.allocated_budget,
        COUNT(bi.id) as item_count,
        SUM(bi.estimated_cost) as estimated_total,
        SUM(bi.actual_cost) as actual_total
      FROM rooms r
      LEFT JOIN budget_items bi ON r.id = bi.room_id
      WHERE r.project_id = ?
      GROUP BY r.id
      ORDER BY r.name
    `).all(projectId);

    return { summary, byCategory, byRoom };
  }

  // Vendor methods
  getVendorsByProject(projectId: number) {
    return this.db.prepare('SELECT * FROM vendors WHERE project_id = ? ORDER BY display_order, name').all(projectId);
  }

  createVendor(data: any) {
    // Get the max display_order for this project
    const maxOrder = this.db.prepare(
      'SELECT MAX(display_order) as max_order FROM vendors WHERE project_id = ?'
    ).get(data.project_id) as any;
    
    const display_order = (maxOrder?.max_order ?? -1) + 1;
    
    const stmt = this.db.prepare(`
      INSERT INTO vendors (project_id, name, company, phone, email, specialization, rating, notes, display_order)
      VALUES (@project_id, @name, @company, @phone, @email, @specialization, @rating, @notes, @display_order)
    `);
    const result = stmt.run({ ...data, display_order });
    return this.db.prepare('SELECT * FROM vendors WHERE id = ?').get(result.lastInsertRowid);
  }
  
  updateVendor(vendorId: number, data: any) {
    const stmt = this.db.prepare(`
      UPDATE vendors 
      SET name = @name, 
          company = @company, 
          phone = @phone, 
          email = @email, 
          specialization = @specialization, 
          rating = @rating, 
          notes = @notes
      WHERE id = @id
    `);
    const result = stmt.run({ ...data, id: vendorId });
    if (result.changes === 0) {
      return null;
    }
    return this.db.prepare('SELECT * FROM vendors WHERE id = ?').get(vendorId);
  }
  
  deleteVendor(vendorId: number) {
    const stmt = this.db.prepare('DELETE FROM vendors WHERE id = ?');
    const result = stmt.run(vendorId);
    return result.changes > 0;
  }

  // Payment methods
  getPaymentsByProject(projectId: number) {
    return this.db.prepare(`
      SELECT p.*, c.name as contractor_name
      FROM payments p
      LEFT JOIN contractors c ON p.contractor_id = c.id
      WHERE p.project_id = ?
      ORDER BY p.payment_date DESC
    `).all(projectId);
  }

  createPayment(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO payments (project_id, contractor_id, amount, payment_date, payment_method, reference_number, notes)
      VALUES (@project_id, @contractor_id, @amount, @payment_date, @payment_method, @reference_number, @notes)
    `);
    const result = stmt.run(data);
    return this.db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
  }

  // Notes methods
  getNotesByProject(projectId: number) {
    return this.db.prepare('SELECT * FROM project_notes WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
  }

  createNote(data: { project_id: number; title?: string; content: string }) {
    const stmt = this.db.prepare(`
      INSERT INTO project_notes (project_id, title, content)
      VALUES (@project_id, @title, @content)
    `);
    const result = stmt.run(data);
    return this.db.prepare('SELECT * FROM project_notes WHERE id = ?').get(result.lastInsertRowid);
  }

  // Timeline methods
  getTimelineEntries(projectId: number) {
    return this.db.prepare(`
      SELECT te.*, 
        (SELECT COUNT(*) FROM timeline_notes WHERE timeline_entry_id = te.id) as notes_count,
        (SELECT COALESCE(SUM(allocated_amount), 0) FROM timeline_budget_items WHERE timeline_entry_id = te.id) as planned_cost,
        (SELECT COALESCE(SUM(actual_amount), 0) FROM timeline_budget_items WHERE timeline_entry_id = te.id) as actual_cost,
        (end_day - start_day + 1) as duration
      FROM timeline_entries te 
      WHERE project_id = ? 
      ORDER BY start_day
    `).all(projectId);
  }

  createTimelineEntry(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO timeline_entries (project_id, start_day, end_day, start_date, end_date, title, description, status)
      VALUES (@project_id, @start_day, @end_day, @start_date, @end_date, @title, @description, @status)
    `);
    const entryData = {
      ...data,
      end_day: data.end_day || data.start_day,
      end_date: data.end_date || data.start_date || null
    };
    const result = stmt.run(entryData);
    return this.db.prepare('SELECT * FROM timeline_entries WHERE id = ?').get(result.lastInsertRowid);
  }

  updateTimelineEntry(entryId: number, data: any) {
    const stmt = this.db.prepare(`
      UPDATE timeline_entries 
      SET start_day = @start_day, 
          end_day = @end_day,
          start_date = @start_date, 
          end_date = @end_date,
          title = @title, 
          description = @description, 
          status = @status,
          updated_at = datetime('now')
      WHERE id = @id
    `);
    const entryData = {
      ...data,
      end_day: data.end_day || data.start_day,
      end_date: data.end_date || data.start_date || null,
      id: entryId
    };
    const result = stmt.run(entryData);
    if (result.changes === 0) {
      return null;
    }
    return this.db.prepare('SELECT * FROM timeline_entries WHERE id = ?').get(entryId);
  }

  deleteTimelineEntry(entryId: number) {
    const stmt = this.db.prepare('DELETE FROM timeline_entries WHERE id = ?');
    const result = stmt.run(entryId);
    return result.changes > 0;
  }

  // Timeline notes methods
  getTimelineNotes(entryId: number) {
    return this.db.prepare('SELECT * FROM timeline_notes WHERE timeline_entry_id = ? ORDER BY created_at DESC').all(entryId);
  }

  addTimelineNote(data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO timeline_notes (timeline_entry_id, content, author)
      VALUES (@timeline_entry_id, @content, @author)
    `);
    const result = stmt.run(data);
    return this.db.prepare('SELECT * FROM timeline_notes WHERE id = ?').get(result.lastInsertRowid);
  }

  deleteTimelineNote(noteId: number) {
    const stmt = this.db.prepare('DELETE FROM timeline_notes WHERE id = ?');
    const result = stmt.run(noteId);
    return result.changes > 0;
  }

  // Timeline-Budget linking methods
  linkBudgetToTimeline(timelineEntryId: number, budgetItemId: number, allocatedAmount: number, actualAmount: number = 0, notes?: string) {
    const stmt = this.db.prepare(`
      INSERT INTO timeline_budget_items (timeline_entry_id, budget_item_id, allocated_amount, actual_amount, notes)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(timeline_entry_id, budget_item_id) 
      DO UPDATE SET 
        allocated_amount = excluded.allocated_amount,
        actual_amount = excluded.actual_amount,
        notes = excluded.notes
    `);
    return stmt.run(timelineEntryId, budgetItemId, allocatedAmount, actualAmount, notes || null);
  }

  getTimelineBudgetItems(timelineEntryId: number) {
    return this.db.prepare(`
      SELECT tbi.*, bi.name as item_name, bi.description, 
             r.name as room_name, c.name as category_name
      FROM timeline_budget_items tbi
      JOIN budget_items bi ON tbi.budget_item_id = bi.id
      LEFT JOIN rooms r ON bi.room_id = r.id
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE tbi.timeline_entry_id = ?
    `).all(timelineEntryId);
  }

  unlinkBudgetFromTimeline(timelineEntryId: number, budgetItemId: number) {
    return this.db.prepare(`
      DELETE FROM timeline_budget_items 
      WHERE timeline_entry_id = ? AND budget_item_id = ?
    `).run(timelineEntryId, budgetItemId);
  }

  updateTimelineEntry(id: number, data: any) {
    const stmt = this.db.prepare(`
      UPDATE timeline_entries 
      SET start_day = ?, end_day = ?, start_date = ?, end_date = ?, title = ?, description = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    return stmt.run(
      data.start_day, 
      data.end_day || data.start_day, 
      data.start_date || null, 
      data.end_date || data.start_date || null, 
      data.title, 
      data.description, 
      data.status, 
      id
    );
  }

  updateBudgetItem(itemId: number, data: any) {
    const stmt = this.db.prepare(`
      UPDATE budget_items 
      SET name = ?, description = ?, quantity = ?, unit_price = ?, 
          estimated_cost = ?, actual_cost = ?, vendor = ?, status = ?,
          room_id = ?, category_id = ?
      WHERE id = ?
    `);
    const result = stmt.run(
      data.name, data.description, data.quantity, data.unit_price,
      data.estimated_cost, data.actual_cost, data.vendor, data.status,
      data.room_id, data.category_id, itemId
    );
    if (result.changes === 0) {
      return null;
    }
    return this.db.prepare('SELECT * FROM budget_items WHERE id = ?').get(itemId);
  }

  deleteBudgetItem(itemId: number) {
    const stmt = this.db.prepare('DELETE FROM budget_items WHERE id = ?');
    const result = stmt.run(itemId);
    return result.changes > 0;
  }

  // User methods
  getUser(userId: number) {
    return this.db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId);
  }

  updateUser(userId: number, data: { name?: string; currency?: string }) {
    const fields = Object.keys(data).map(key => `${key} = @${key}`).join(', ');
    const stmt = this.db.prepare(`
      UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id
    `);
    stmt.run({ ...data, id: userId });
    return this.getUser(userId);
  }

  close() {
    this.db.close();
  }
}

let dbInstance: DatabaseManager | null = null;

export function getDb(): DatabaseManager {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
  }
  return dbInstance;
}

export default DatabaseManager;