const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'renovation-budget.db'));
const backupDb = new Database('/Users/shatlin.denistan/workspace/pl/renovate/renovate copy.db');

console.log('Restoring exact budget amounts from backup...');

// Begin transaction
const restore = db.transaction(() => {
  // Get all budget items from backup
  const backupItems = backupDb.prepare(`
    SELECT * FROM budget_items 
    WHERE project_id = 1 
    ORDER BY id
  `).all();
  
  console.log(`Found ${backupItems.length} budget items in backup`);
  
  // Update each master item with exact amounts from backup
  const updateMaster = db.prepare(`
    UPDATE budget_items 
    SET estimated_cost = ?, actual_cost = ?
    WHERE project_id = 1 AND name = ?
  `);
  
  let totalEstimated = 0;
  let totalActual = 0;
  
  backupItems.forEach(item => {
    const result = updateMaster.run(
      item.estimated_cost || 0,
      item.actual_cost,
      item.name
    );
    
    if (result.changes > 0) {
      totalEstimated += (item.estimated_cost || 0);
      totalActual += (item.actual_cost || 0);
      console.log(`Updated ${item.name}: R${item.estimated_cost || 0}`);
    }
  });
  
  // Now update the detail records to match the master totals
  const masters = db.prepare(`
    SELECT id, name, estimated_cost 
    FROM budget_items 
    WHERE project_id = 1 AND is_master = 1
  `).all();
  
  masters.forEach(master => {
    // Get current detail total
    const detailTotal = db.prepare(`
      SELECT SUM(total_amount) as total 
      FROM budget_details 
      WHERE budget_item_id = ?
    `).get(master.id).total || 0;
    
    if (detailTotal !== master.estimated_cost && master.estimated_cost > 0) {
      // Adjust the material amount to match
      const materials = db.prepare(`
        SELECT id, total_amount 
        FROM budget_details 
        WHERE budget_item_id = ? AND detail_type = 'material'
        LIMIT 1
      `).get(master.id);
      
      if (materials) {
        const difference = master.estimated_cost - detailTotal;
        const newAmount = materials.total_amount + difference;
        
        db.prepare(`
          UPDATE budget_details 
          SET total_amount = ?, unit_price = ?
          WHERE id = ?
        `).run(newAmount, newAmount, materials.id);
        
        console.log(`Adjusted details for ${master.name} to match R${master.estimated_cost}`);
      }
    }
  });
  
  // Update project total budget
  db.prepare('UPDATE projects SET total_budget = ? WHERE id = 1').run(350000.0);
  
  console.log(`\nTotal Estimated: R${totalEstimated.toLocaleString()}`);
  console.log(`Total Actual: R${totalActual.toLocaleString()}`);
});

// Execute restoration
try {
  restore();
  
  // Show final summary
  const summary = db.prepare(`
    SELECT 
      COUNT(*) as count,
      SUM(estimated_cost) as total_estimated,
      SUM(actual_cost) as total_actual
    FROM budget_items 
    WHERE project_id = 1 AND is_master = 1
  `).get();
  
  console.log('\n=== Final Summary ===');
  console.log(`Master budget items: ${summary.count}`);
  console.log(`Total Estimated: R${summary.total_estimated?.toLocaleString() || 0}`);
  console.log(`Total Actual: R${summary.total_actual?.toLocaleString() || 0}`);
  console.log('Project Budget: R350,000');
  
  console.log('\nBudget amounts restored successfully!');
} catch (error) {
  console.error('Restoration failed:', error);
  process.exit(1);
} finally {
  backupDb.close();
  db.close();
}