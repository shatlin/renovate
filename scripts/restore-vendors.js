const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'renovation-budget.db'));
const backupDb = new Database('/Users/shatlin.denistan/workspace/pl/renovate/renovate copy.db');

console.log('Restoring vendors from backup database...\n');

// Begin transaction
const restore = db.transaction(() => {
  // Clear existing vendors
  db.exec('DELETE FROM vendors WHERE project_id = 1');
  
  // Get vendors from backup
  const vendors = backupDb.prepare(`
    SELECT * FROM vendors 
    WHERE project_id = 1 
    ORDER BY id
  `).all();
  
  console.log(`Found ${vendors.length} vendors to restore`);
  
  // Insert vendors
  const insertVendor = db.prepare(`
    INSERT INTO vendors (
      project_id, name, company, phone, email, 
      specialization, rating, notes, display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  vendors.forEach((vendor, index) => {
    insertVendor.run(
      vendor.project_id,
      vendor.name,
      vendor.contact_person || vendor.company || null, // Use contact_person or company field
      vendor.phone,
      vendor.email,
      vendor.specialization,
      vendor.rating || 0,
      vendor.notes,
      vendor.display_order || index + 1
    );
    
    console.log(`✓ Restored vendor: ${vendor.name}`);
    if (vendor.contact_person) console.log(`  Contact: ${vendor.contact_person}`);
    console.log(`  Phone: ${vendor.phone}`);
    console.log(`  Email: ${vendor.email}`);
    console.log(`  Specialization: ${vendor.specialization}`);
    if (vendor.rating) console.log(`  Rating: ${vendor.rating}/5`);
    console.log();
  });
  
  console.log('Vendors restoration complete!');
});

// Execute restoration
try {
  restore();
  
  // Verify the restoration
  const count = db.prepare('SELECT COUNT(*) as count FROM vendors WHERE project_id = 1').get();
  console.log(`\n✅ Successfully restored ${count.count} vendors`);
  
  // Show restored vendors
  const restoredVendors = db.prepare(`
    SELECT name, company, phone, specialization, rating 
    FROM vendors 
    WHERE project_id = 1 
    ORDER BY display_order
  `).all();
  
  console.log('\nRestored Vendors:');
  console.log('='.repeat(60));
  restoredVendors.forEach(v => {
    console.log(`${v.name} (${v.specialization})`);
    console.log(`  Company: ${v.company || 'N/A'}`);
    console.log(`  Phone: ${v.phone}`);
    console.log(`  Rating: ${'⭐'.repeat(v.rating || 0)}`);
    console.log();
  });
  
} catch (error) {
  console.error('Restoration failed:', error);
  process.exit(1);
} finally {
  backupDb.close();
  db.close();
}