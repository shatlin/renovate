const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'renovate.db'));

console.log('Starting migration to master-detail budget structure...');

try {
  // Begin transaction
  db.exec('BEGIN TRANSACTION');

  // 1. Rename existing budget_items table to preserve data
  console.log('1. Renaming existing budget_items table...');
  db.exec(`
    ALTER TABLE budget_items RENAME TO budget_items_old;
  `);

  // 2. Create new master budget items table
  console.log('2. Creating master budget items table...');
  db.exec(`
    CREATE TABLE budget_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      room_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      total_estimated REAL DEFAULT 0,
      total_actual REAL DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
    );
  `);

  // 3. Create detail budget items table
  console.log('3. Creating detail budget items table...');
  db.exec(`
    CREATE TABLE budget_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL,
      category_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('material', 'labour', 'service', 'other', 'new_item')),
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER DEFAULT 1,
      unit_price REAL DEFAULT 0,
      estimated_cost REAL DEFAULT 0,
      actual_cost REAL,
      vendor TEXT,
      notes TEXT,
      long_notes TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'ordered', 'delivered', 'installed', 'completed')),
      purchase_date DATE,
      invoice_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (master_id) REFERENCES budget_master(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // 4. Create indexes for performance
  console.log('4. Creating indexes...');
  db.exec(`
    CREATE INDEX idx_budget_master_project ON budget_master(project_id);
    CREATE INDEX idx_budget_master_room ON budget_master(room_id);
    CREATE INDEX idx_budget_details_master ON budget_details(master_id);
    CREATE INDEX idx_budget_details_category ON budget_details(category_id);
  `);

  // 5. Migrate existing data to new structure
  console.log('5. Migrating existing budget items to master-detail structure...');
  
  // Get all existing budget items
  const existingItems = db.prepare('SELECT * FROM budget_items_old').all();
  
  console.log(`Found ${existingItems.length} existing budget items to migrate...`);
  
  // Prepare statements for insertion
  const insertMaster = db.prepare(`
    INSERT INTO budget_master (
      project_id, room_id, name, description, 
      total_estimated, total_actual, status, 
      created_at, updated_at, display_order
    ) VALUES (
      @project_id, @room_id, @name, @description,
      @total_estimated, @total_actual, @status,
      @created_at, @updated_at, @display_order
    )
  `);
  
  const insertDetail = db.prepare(`
    INSERT INTO budget_details (
      master_id, category_id, type, name, description,
      quantity, unit_price, estimated_cost, actual_cost,
      vendor, notes, long_notes, status, purchase_date, invoice_number,
      created_at, updated_at
    ) VALUES (
      @master_id, @category_id, @type, @name, @description,
      @quantity, @unit_price, @estimated_cost, @actual_cost,
      @vendor, @notes, @long_notes, @status, @purchase_date, @invoice_number,
      @created_at, @updated_at
    )
  `);
  
  // Migrate each item
  for (const item of existingItems) {
    // Create master record
    const masterResult = insertMaster.run({
      project_id: item.project_id,
      room_id: item.room_id,
      name: item.name,
      description: item.description,
      total_estimated: item.estimated_cost || 0,
      total_actual: item.actual_cost || 0,
      status: item.status || 'pending',
      created_at: item.created_at,
      updated_at: item.updated_at,
      display_order: item.display_order || 0
    });
    
    // Create detail record with the same data
    insertDetail.run({
      master_id: masterResult.lastInsertRowid,
      category_id: item.category_id,
      type: item.type || 'material',
      name: item.name,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      estimated_cost: item.estimated_cost || 0,
      actual_cost: item.actual_cost,
      vendor: item.vendor,
      notes: item.notes,
      long_notes: item.long_notes,
      status: item.status || 'pending',
      purchase_date: item.purchase_date,
      invoice_number: item.invoice_number,
      created_at: item.created_at,
      updated_at: item.updated_at
    });
  }
  
  console.log('6. Migrating timeline budget item relationships...');
  
  // Create new table for timeline relationships with master items
  db.exec(`
    CREATE TABLE timeline_budget_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timeline_entry_id INTEGER NOT NULL,
      budget_master_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (timeline_entry_id) REFERENCES timeline_entries(id) ON DELETE CASCADE,
      FOREIGN KEY (budget_master_id) REFERENCES budget_master(id) ON DELETE CASCADE,
      UNIQUE(timeline_entry_id, budget_master_id)
    );
  `);
  
  // Migrate timeline relationships (map old budget_item_id to new master_id)
  const timelineRelations = db.prepare('SELECT * FROM timeline_budget_items').all();
  const oldToNewMapping = {};
  
  // Build mapping of old IDs to new master IDs
  const oldItems = db.prepare('SELECT id, name, project_id FROM budget_items_old').all();
  const newMasters = db.prepare('SELECT id, name, project_id FROM budget_master').all();
  
  oldItems.forEach(oldItem => {
    const newMaster = newMasters.find(m => 
      m.name === oldItem.name && m.project_id === oldItem.project_id
    );
    if (newMaster) {
      oldToNewMapping[oldItem.id] = newMaster.id;
    }
  });
  
  // Insert new timeline relationships
  const insertTimelineRelation = db.prepare(`
    INSERT OR IGNORE INTO timeline_budget_master (timeline_entry_id, budget_master_id, created_at)
    VALUES (?, ?, ?)
  `);
  
  timelineRelations.forEach(rel => {
    if (oldToNewMapping[rel.budget_item_id]) {
      insertTimelineRelation.run(
        rel.timeline_entry_id,
        oldToNewMapping[rel.budget_item_id],
        rel.created_at
      );
    }
  });
  
  // 7. Create triggers to update master totals when details change
  console.log('7. Creating triggers for automatic total updates...');
  db.exec(`
    CREATE TRIGGER update_master_totals_on_detail_insert
    AFTER INSERT ON budget_details
    BEGIN
      UPDATE budget_master
      SET 
        total_estimated = (
          SELECT COALESCE(SUM(estimated_cost), 0)
          FROM budget_details
          WHERE master_id = NEW.master_id
        ),
        total_actual = (
          SELECT COALESCE(SUM(actual_cost), 0)
          FROM budget_details
          WHERE master_id = NEW.master_id
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.master_id;
    END;
    
    CREATE TRIGGER update_master_totals_on_detail_update
    AFTER UPDATE ON budget_details
    BEGIN
      UPDATE budget_master
      SET 
        total_estimated = (
          SELECT COALESCE(SUM(estimated_cost), 0)
          FROM budget_details
          WHERE master_id = NEW.master_id
        ),
        total_actual = (
          SELECT COALESCE(SUM(actual_cost), 0)
          FROM budget_details
          WHERE master_id = NEW.master_id
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.master_id;
    END;
    
    CREATE TRIGGER update_master_totals_on_detail_delete
    AFTER DELETE ON budget_details
    BEGIN
      UPDATE budget_master
      SET 
        total_estimated = (
          SELECT COALESCE(SUM(estimated_cost), 0)
          FROM budget_details
          WHERE master_id = OLD.master_id
        ),
        total_actual = (
          SELECT COALESCE(SUM(actual_cost), 0)
          FROM budget_details
          WHERE master_id = OLD.master_id
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = OLD.master_id;
    END;
  `);
  
  // 8. Migrate budget item notes
  console.log('8. Migrating budget item notes...');
  
  // Create new notes table for master items
  db.exec(`
    CREATE TABLE budget_master_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_master_id INTEGER NOT NULL,
      note TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (budget_master_id) REFERENCES budget_master(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  
  // Migrate existing notes
  const existingNotes = db.prepare('SELECT * FROM budget_item_notes').all();
  const insertNote = db.prepare(`
    INSERT INTO budget_master_notes (budget_master_id, note, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  existingNotes.forEach(note => {
    if (oldToNewMapping[note.budget_item_id]) {
      insertNote.run(
        oldToNewMapping[note.budget_item_id],
        note.note,
        note.created_by,
        note.created_at,
        note.updated_at
      );
    }
  });
  
  // Commit transaction
  db.exec('COMMIT');
  
  console.log('✅ Migration completed successfully!');
  console.log(`Migrated ${existingItems.length} budget items to master-detail structure`);
  console.log('Original data preserved in budget_items_old table');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
}

db.close();