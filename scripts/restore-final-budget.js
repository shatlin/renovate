const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'renovation-budget.db'));
const backupDb = new Database('/Users/shatlin.denistan/workspace/pl/renovate/renovate copy.db');

console.log('Performing final budget restoration from backup...');

// Begin transaction
const restore = db.transaction(() => {
  // Clear existing data
  db.exec('DELETE FROM budget_details');
  db.exec('DELETE FROM budget_items');
  db.exec('DELETE FROM timeline_budget_items');
  db.exec('DELETE FROM timeline_notes');
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
  
  // Insert master budget items with exact values from backup
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
  
  let totalEstimated = 0;
  let totalActual = 0;
  
  // Process each budget item
  budgetItems.forEach((item, index) => {
    // Insert as master record with exact values from backup
    const result = insertMaster.run(
      item.project_id,
      item.room_id,
      item.category_id,
      item.name,
      item.description,
      item.quantity || 1,
      item.unit_price || 0,
      item.estimated_cost || 0,  // Use exact value from backup
      item.actual_cost,
      item.vendor,
      item.notes,
      item.status || 'pending',
      index + 1
    );
    
    const masterId = result.lastInsertRowid;
    totalEstimated += (item.estimated_cost || 0);
    totalActual += (item.actual_cost || 0);
    
    // Create detail records that sum to the exact master amount
    if (item.estimated_cost > 0) {
      // Use 70/30 split for material/labour
      const materialAmount = Math.round(item.estimated_cost * 0.7);
      const labourAmount = item.estimated_cost - materialAmount; // Ensure exact total
      
      // Create material detail
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
      
      // Create labour detail
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
      entry.status || 'planned'
    );
  });
  
  console.log(`\nRestoration Complete:`);
  console.log(`- Total Estimated: R${totalEstimated.toLocaleString()}`);
  console.log(`- Total Actual: R${totalActual.toLocaleString()}`);
});

// Execute restoration
try {
  restore();
  
  // Verify the restoration
  const verify = db.prepare(`
    SELECT 
      COUNT(*) as count,
      SUM(estimated_cost) as total_estimated,
      SUM(actual_cost) as total_actual
    FROM budget_items 
    WHERE project_id = 1 AND is_master = 1
  `).get();
  
  const details = db.prepare(`
    SELECT COUNT(*) as count FROM budget_details
  `).get();
  
  const timeline = db.prepare(`
    SELECT COUNT(*) as count FROM timeline_entries WHERE project_id = 1
  `).get();
  
  console.log('\n=== Verification ===');
  console.log(`Master budget items: ${verify.count}`);
  console.log(`Detail records: ${details.count}`);
  console.log(`Timeline entries: ${timeline.count}`);
  console.log(`Total Budget (Estimated): R${verify.total_estimated?.toLocaleString() || 0}`);
  console.log(`Total Budget (Actual): R${verify.total_actual?.toLocaleString() || 0}`);
  console.log('Project Budget Limit: R350,000');
  
  // Check if total matches backup
  const backupTotal = backupDb.prepare(`
    SELECT SUM(estimated_cost) as total FROM budget_items WHERE project_id = 1
  `).get().total;
  
  if (Math.abs(verify.total_estimated - backupTotal) < 1) {
    console.log(`\n✓ Budget totals match backup exactly: R${backupTotal.toLocaleString()}`);
  } else {
    console.log(`\n⚠ Warning: Budget total (R${verify.total_estimated}) differs from backup (R${backupTotal})`);
  }
  
  console.log('\nFinal budget restoration successful!');
} catch (error) {
  console.error('Restoration failed:', error);
  process.exit(1);
} finally {
  backupDb.close();
  db.close();
}