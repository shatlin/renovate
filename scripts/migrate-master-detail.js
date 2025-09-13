const Database = require('better-sqlite3');
const path = require('path');

// Connect to database
const db = new Database(path.join(__dirname, '..', 'renovation-budget.db'));

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

console.log('Starting master-detail migration...');

// Begin transaction
const migration = db.transaction(() => {
  // 1. Create budget_details table for detail records
  db.exec(`
    CREATE TABLE IF NOT EXISTS budget_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_item_id INTEGER NOT NULL,
      detail_type TEXT NOT NULL CHECK(detail_type IN ('material', 'labour', 'service', 'other', 'new_item')),
      name TEXT NOT NULL,
      description TEXT,
      quantity REAL DEFAULT 1,
      unit_price REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      vendor TEXT,
      purchase_date DATE,
      invoice_number TEXT,
      notes TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (budget_item_id) REFERENCES budget_items(id) ON DELETE CASCADE
    )
  `);

  // 2. Create index for better performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_budget_details_item ON budget_details(budget_item_id)');

  // 3. Migrate existing budget_items data to budget_details
  // Each existing budget item becomes a master with one detail record
  const existingItems = db.prepare(`
    SELECT id, name, description, quantity, unit_price, estimated_cost, 
           vendor, purchase_date, invoice_number, notes
    FROM budget_items
    WHERE estimated_cost > 0 OR actual_cost > 0
  `).all();

  const insertDetail = db.prepare(`
    INSERT INTO budget_details (
      budget_item_id, detail_type, name, description, quantity, 
      unit_price, total_amount, vendor, purchase_date, invoice_number, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of existingItems) {
    // Determine detail type based on existing data
    let detailType = 'material'; // default
    if (item.name && item.name.toLowerCase().includes('labour')) {
      detailType = 'labour';
    } else if (item.name && item.name.toLowerCase().includes('service')) {
      detailType = 'service';
    }

    insertDetail.run(
      item.id,
      detailType,
      `${item.name} - Initial`,
      item.description,
      item.quantity || 1,
      item.unit_price || 0,
      item.estimated_cost || 0,
      item.vendor,
      item.purchase_date,
      item.invoice_number,
      item.notes
    );
  }

  // 4. Add is_master column to budget_items to distinguish master records
  db.exec(`
    ALTER TABLE budget_items ADD COLUMN is_master BOOLEAN DEFAULT 1
  `);

  // 5. Add computed total columns for master records
  db.exec(`
    ALTER TABLE budget_items ADD COLUMN total_material REAL DEFAULT 0
  `);
  db.exec(`
    ALTER TABLE budget_items ADD COLUMN total_labour REAL DEFAULT 0
  `);
  db.exec(`
    ALTER TABLE budget_items ADD COLUMN total_service REAL DEFAULT 0
  `);
  db.exec(`
    ALTER TABLE budget_items ADD COLUMN total_other REAL DEFAULT 0
  `);
  db.exec(`
    ALTER TABLE budget_items ADD COLUMN total_new_item REAL DEFAULT 0
  `);

  // 6. Create trigger to update master totals when details change
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_master_totals_on_insert
    AFTER INSERT ON budget_details
    BEGIN
      UPDATE budget_items
      SET 
        total_material = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'material'
        ),
        total_labour = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'labour'
        ),
        total_service = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'service'
        ),
        total_other = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'other'
        ),
        total_new_item = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'new_item'
        ),
        estimated_cost = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.budget_item_id;
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_master_totals_on_update
    AFTER UPDATE ON budget_details
    BEGIN
      UPDATE budget_items
      SET 
        total_material = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'material'
        ),
        total_labour = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'labour'
        ),
        total_service = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'service'
        ),
        total_other = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'other'
        ),
        total_new_item = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id AND detail_type = 'new_item'
        ),
        estimated_cost = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = NEW.budget_item_id
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.budget_item_id;
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_master_totals_on_delete
    AFTER DELETE ON budget_details
    BEGIN
      UPDATE budget_items
      SET 
        total_material = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = OLD.budget_item_id AND detail_type = 'material'
        ),
        total_labour = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = OLD.budget_item_id AND detail_type = 'labour'
        ),
        total_service = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = OLD.budget_item_id AND detail_type = 'service'
        ),
        total_other = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = OLD.budget_item_id AND detail_type = 'other'
        ),
        total_new_item = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = OLD.budget_item_id AND detail_type = 'new_item'
        ),
        estimated_cost = (
          SELECT COALESCE(SUM(total_amount), 0) 
          FROM budget_details 
          WHERE budget_item_id = OLD.budget_item_id
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = OLD.budget_item_id;
    END;
  `);

  // 7. Update all master totals based on existing details
  db.exec(`
    UPDATE budget_items
    SET 
      total_material = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM budget_details 
        WHERE budget_item_id = budget_items.id AND detail_type = 'material'
      ),
      total_labour = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM budget_details 
        WHERE budget_item_id = budget_items.id AND detail_type = 'labour'
      ),
      total_service = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM budget_details 
        WHERE budget_item_id = budget_items.id AND detail_type = 'service'
      ),
      total_other = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM budget_details 
        WHERE budget_item_id = budget_items.id AND detail_type = 'other'
      ),
      total_new_item = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM budget_details 
        WHERE budget_item_id = budget_items.id AND detail_type = 'new_item'
      )
  `);

  console.log('Migration completed successfully!');
  
  // Show summary
  const masterCount = db.prepare('SELECT COUNT(*) as count FROM budget_items WHERE is_master = 1').get();
  const detailCount = db.prepare('SELECT COUNT(*) as count FROM budget_details').get();
  
  console.log(`Created ${detailCount.count} detail records from ${masterCount.count} master records`);
});

// Execute migration
try {
  migration();
  console.log('Database migration successful!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

db.close();