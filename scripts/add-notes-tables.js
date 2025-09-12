const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'renovate.db'));

try {
  // Add long_notes column to budget_items if it doesn't exist
  const columns = db.prepare("PRAGMA table_info(budget_items)").all();
  const hasLongNotes = columns.some(col => col.name === 'long_notes');
  
  if (!hasLongNotes) {
    console.log('Adding long_notes column to budget_items table...');
    db.prepare(`
      ALTER TABLE budget_items 
      ADD COLUMN long_notes TEXT
    `).run();
    console.log('✅ Added long_notes column');
  } else {
    console.log('✅ long_notes column already exists');
  }

  // Create budget_item_notes table for date-tagged individual notes
  console.log('Creating budget_item_notes table...');
  db.prepare(`
    CREATE TABLE IF NOT EXISTS budget_item_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_item_id INTEGER NOT NULL,
      note TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (budget_item_id) REFERENCES budget_items(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `).run();
  console.log('✅ Created budget_item_notes table');

  // Create index for better performance
  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_budget_item_notes_item 
    ON budget_item_notes(budget_item_id)
  `).run();
  console.log('✅ Created index on budget_item_notes');

  console.log('\n✅ Database updated successfully!');
  
} catch (error) {
  console.error('Error updating database:', error);
} finally {
  db.close();
}