const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'renovation-budget.db'));

console.log('Recalculating all master budget totals from detail records...\n');

// Begin transaction for consistency
const recalculate = db.transaction(() => {
  // First, get all master budget items
  const masters = db.prepare(`
    SELECT id, name, estimated_cost 
    FROM budget_items 
    WHERE is_master = 1 AND project_id = 1
    ORDER BY id
  `).all();
  
  console.log(`Found ${masters.length} master budget items to recalculate\n`);
  
  // Prepare update statement
  const updateMaster = db.prepare(`
    UPDATE budget_items
    SET 
      total_material = ?,
      total_labour = ?,
      total_service = ?,
      total_other = ?,
      total_new_item = ?,
      estimated_cost = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  let grandTotal = 0;
  let updatedCount = 0;
  
  masters.forEach(master => {
    // Get all details for this master
    const details = db.prepare(`
      SELECT detail_type, SUM(total_amount) as type_total
      FROM budget_details
      WHERE budget_item_id = ?
      GROUP BY detail_type
    `).all(master.id);
    
    // Initialize totals
    let totals = {
      material: 0,
      labour: 0,
      service: 0,
      other: 0,
      new_item: 0
    };
    
    let detailTotal = 0;
    
    // Sum up by type
    details.forEach(detail => {
      const amount = detail.type_total || 0;
      if (detail.detail_type in totals) {
        totals[detail.detail_type] = amount;
      }
      detailTotal += amount;
    });
    
    // Update the master record
    updateMaster.run(
      totals.material,
      totals.labour,
      totals.service,
      totals.other,
      totals.new_item,
      detailTotal,
      master.id
    );
    
    if (detailTotal !== master.estimated_cost) {
      console.log(`✓ Updated ${master.name}:`);
      console.log(`  Old total: R${master.estimated_cost?.toLocaleString() || 0}`);
      console.log(`  New total: R${detailTotal.toLocaleString()}`);
      if (totals.material > 0) console.log(`    - Material: R${totals.material.toLocaleString()}`);
      if (totals.labour > 0) console.log(`    - Labour: R${totals.labour.toLocaleString()}`);
      if (totals.service > 0) console.log(`    - Service: R${totals.service.toLocaleString()}`);
      if (totals.other > 0) console.log(`    - Other: R${totals.other.toLocaleString()}`);
      if (totals.new_item > 0) console.log(`    - New Item: R${totals.new_item.toLocaleString()}`);
      console.log();
      updatedCount++;
    }
    
    grandTotal += detailTotal;
  });
  
  console.log('='.repeat(60));
  console.log(`\nRecalculation Summary:`);
  console.log(`- Total master items: ${masters.length}`);
  console.log(`- Items updated: ${updatedCount}`);
  console.log(`- Items unchanged: ${masters.length - updatedCount}`);
  console.log(`- Grand Total: R${grandTotal.toLocaleString()}`);
  
  // Verify the project total
  const projectBudget = db.prepare(`
    SELECT total_budget FROM projects WHERE id = 1
  `).get();
  
  console.log(`- Project Budget Limit: R${projectBudget.total_budget?.toLocaleString() || 0}`);
  
  const budgetUsage = (grandTotal / projectBudget.total_budget * 100).toFixed(1);
  console.log(`- Budget Usage: ${budgetUsage}%`);
  
  if (grandTotal > projectBudget.total_budget) {
    console.log(`\n⚠️  WARNING: Total exceeds project budget by R${(grandTotal - projectBudget.total_budget).toLocaleString()}`);
  } else {
    console.log(`\n✓ Budget within limit (R${(projectBudget.total_budget - grandTotal).toLocaleString()} remaining)`);
  }
});

// Execute the recalculation
try {
  recalculate();
  console.log('\n✅ Master totals recalculated successfully!');
  
  // Show some statistics
  const stats = db.prepare(`
    SELECT 
      COUNT(DISTINCT bi.id) as master_count,
      COUNT(bd.id) as detail_count,
      SUM(DISTINCT bi.estimated_cost) as total_estimated
    FROM budget_items bi
    LEFT JOIN budget_details bd ON bi.id = bd.budget_item_id
    WHERE bi.project_id = 1 AND bi.is_master = 1
  `).get();
  
  console.log('\nDatabase Statistics:');
  console.log(`- Master budget items: ${stats.master_count}`);
  console.log(`- Detail records: ${stats.detail_count}`);
  console.log(`- Average details per master: ${(stats.detail_count / stats.master_count).toFixed(1)}`);
  
} catch (error) {
  console.error('❌ Recalculation failed:', error);
  process.exit(1);
} finally {
  db.close();
}