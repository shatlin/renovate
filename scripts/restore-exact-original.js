const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'renovation-budget.db'));
const backupDb = new Database('/Users/shatlin.denistan/workspace/pl/renovate/renovate copy.db');

console.log('Restoring exact original budget data from backup...');

// Begin transaction
const restore = db.transaction(() => {
  // Clear existing data
  db.exec('DELETE FROM budget_details');
  db.exec('DELETE FROM budget_items');
  db.exec('DELETE FROM timeline_entries');
  
  // Update project total budget
  db.prepare('UPDATE projects SET total_budget = ? WHERE id = 1').run(350000.0);
  
  // Get all budget items from backup
  const budgetItems = backupDb.prepare(`
    SELECT * FROM budget_items 
    WHERE project_id = 1 
    ORDER BY id
  `).all();
  
  console.log(`Found ${budgetItems.length} budget items to restore`);
  
  // Insert master budget items
  const insertMaster = db.prepare(`
    INSERT INTO budget_items (
      project_id, room_id, category_id, name, description, 
      quantity, unit_price, estimated_cost, actual_cost, vendor,
      notes, status, display_order, is_master
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  
  // Insert detail records
  const insertDetail = db.prepare(`
    INSERT INTO budget_details (
      budget_item_id, detail_type, name, description, 
      quantity, unit_price, total_amount, vendor, display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Process each budget item
  budgetItems.forEach((item, index) => {
    // Insert as master record
    const result = insertMaster.run(
      item.project_id,
      item.room_id,
      item.category_id,
      item.name,
      item.description,
      item.quantity,
      item.unit_price,
      item.estimated_cost,
      item.actual_cost,
      item.vendor,
      item.notes,
      item.status,
      index + 1
    );
    
    const masterId = result.lastInsertRowid;
    
    // Parse notes for material/labor split
    let materialAmount = 0;
    let labourAmount = 0;
    
    if (item.notes) {
      // Parse notes like "Material: R30000.00, Labour: R10000.00"
      const materialMatch = item.notes.match(/Material:\s*R?([\d,]+\.?\d*)/);
      const labourMatch = item.notes.match(/Labour:\s*R?([\d,]+\.?\d*)/);
      
      if (materialMatch) {
        materialAmount = parseFloat(materialMatch[1].replace(/,/g, ''));
      }
      if (labourMatch) {
        labourAmount = parseFloat(labourMatch[1].replace(/,/g, ''));
      }
    }
    
    // If no split in notes, use 70/30 split as default
    if (materialAmount === 0 && labourAmount === 0 && item.estimated_cost > 0) {
      materialAmount = item.estimated_cost * 0.7;
      labourAmount = item.estimated_cost * 0.3;
    }
    
    // Create detail records
    if (materialAmount > 0) {
      insertDetail.run(
        masterId,
        'material',
        `Materials for ${item.name}`,
        `Material costs`,
        1,
        materialAmount,
        materialAmount,
        item.vendor || null,
        1
      );
    }
    
    if (labourAmount > 0) {
      insertDetail.run(
        masterId,
        'labour',
        `Labour for ${item.name}`,
        `Installation and labour costs`,
        1,
        labourAmount,
        labourAmount,
        null,
        2
      );
    }
  });
  
  // Restore timeline entries
  const timelineEntries = backupDb.prepare(`
    SELECT * FROM timeline_entries 
    WHERE project_id = 1 
    ORDER BY start_day
  `).all();
  
  console.log(`Found ${timelineEntries.length} timeline entries to restore`);
  
  const insertTimeline = db.prepare(`
    INSERT INTO timeline_entries (
      project_id, start_day, end_day, start_date, end_date,
      title, description, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  timelineEntries.forEach(entry => {
    insertTimeline.run(
      entry.project_id,
      entry.start_day,
      entry.end_day,
      entry.start_date,
      entry.end_date,
      entry.title,
      entry.description,
      entry.status
    );
  });
  
  console.log('Data restoration complete!');
  
  // Show summary
  const summary = db.prepare(`
    SELECT COUNT(DISTINCT bi.id) as master_count, 
           COUNT(bd.id) as detail_count,
           SUM(bi.estimated_cost) as total_budget
    FROM budget_items bi
    LEFT JOIN budget_details bd ON bi.id = bd.budget_item_id
    WHERE bi.project_id = 1
  `).get();
  
  const timelineCount = db.prepare('SELECT COUNT(*) as count FROM timeline_entries WHERE project_id = 1').get();
  
  console.log(`\nRestoration Summary:`);
  console.log(`- Master budget items: ${summary.master_count}`);
  console.log(`- Detail records: ${summary.detail_count}`);
  console.log(`- Total budget: R${summary.total_budget?.toLocaleString() || 0}`);
  console.log(`- Timeline entries: ${timelineCount.count}`);
  console.log(`- Project budget: R350,000`);
});

// Execute restoration
try {
  restore();
  console.log('\nOriginal data restored successfully from backup!');
} catch (error) {
  console.error('Restoration failed:', error);
  process.exit(1);
} finally {
  backupDb.close();
  db.close();
}