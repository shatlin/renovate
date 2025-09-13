const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'renovation-budget.db'));

console.log('Adding budget actuals table...\n');

try {
  // Create budget_actuals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS budget_actuals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      detail_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      vendor TEXT,
      invoice_number TEXT,
      purchase_date DATE,
      payment_method TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (detail_id) REFERENCES budget_details(id) ON DELETE CASCADE
    )
  `);
  
  console.log('✓ Created budget_actuals table');
  
  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_budget_actuals_detail_id 
    ON budget_actuals(detail_id);
    
    CREATE INDEX IF NOT EXISTS idx_budget_actuals_purchase_date 
    ON budget_actuals(purchase_date);
  `);
  
  console.log('✓ Created indexes');
  
  // Add trigger to update budget_details actual_cost when actuals are added/updated/deleted
  db.exec(`
    DROP TRIGGER IF EXISTS update_detail_actual_on_actual_insert;
    DROP TRIGGER IF EXISTS update_detail_actual_on_actual_update;
    DROP TRIGGER IF EXISTS update_detail_actual_on_actual_delete;
    
    CREATE TRIGGER update_detail_actual_on_actual_insert
    AFTER INSERT ON budget_actuals
    BEGIN
      UPDATE budget_details 
      SET total_amount = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM budget_actuals 
        WHERE detail_id = NEW.detail_id
      )
      WHERE id = NEW.detail_id;
    END;
    
    CREATE TRIGGER update_detail_actual_on_actual_update
    AFTER UPDATE ON budget_actuals
    BEGIN
      UPDATE budget_details 
      SET total_amount = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM budget_actuals 
        WHERE detail_id = NEW.detail_id
      )
      WHERE id = NEW.detail_id;
    END;
    
    CREATE TRIGGER update_detail_actual_on_actual_delete
    AFTER DELETE ON budget_actuals
    BEGIN
      UPDATE budget_details 
      SET total_amount = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM budget_actuals 
        WHERE detail_id = OLD.detail_id
      )
      WHERE id = OLD.detail_id;
    END;
  `);
  
  console.log('✓ Created triggers for automatic actual cost updates');
  
  // Add actual_status column to budget_details if it doesn't exist
  const columns = db.prepare("PRAGMA table_info(budget_details)").all();
  const hasActualStatus = columns.some(col => col.name === 'actual_status');
  
  if (!hasActualStatus) {
    db.exec(`
      ALTER TABLE budget_details 
      ADD COLUMN actual_status TEXT DEFAULT 'pending'
    `);
    console.log('✓ Added actual_status column to budget_details');
  }
  
  // Update the budget_details trigger to handle actual_status
  db.exec(`
    DROP TRIGGER IF EXISTS update_detail_status_on_actuals;
    
    CREATE TRIGGER update_detail_status_on_actuals
    AFTER INSERT ON budget_actuals
    BEGIN
      UPDATE budget_details 
      SET actual_status = CASE
        WHEN (
          SELECT COALESCE(SUM(quantity), 0) 
          FROM budget_actuals 
          WHERE detail_id = NEW.detail_id
        ) >= quantity THEN 'completed'
        WHEN (
          SELECT COUNT(*) 
          FROM budget_actuals 
          WHERE detail_id = NEW.detail_id
        ) > 0 THEN 'partial'
        ELSE 'pending'
      END
      WHERE id = NEW.detail_id;
    END;
  `);
  
  console.log('✓ Created trigger for status updates');
  
  // Verify the table structure
  const tableInfo = db.prepare("PRAGMA table_info(budget_actuals)").all();
  console.log('\n✅ Budget actuals table structure:');
  tableInfo.forEach(col => {
    console.log(`   ${col.name} (${col.type})`);
  });
  
  // Get count of existing budget details
  const detailCount = db.prepare('SELECT COUNT(*) as count FROM budget_details').get();
  console.log(`\n📊 Found ${detailCount.count} budget detail records`);
  
  console.log('\n✅ Database migration completed successfully!');
  console.log('   Budget actuals functionality is ready to use.');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}