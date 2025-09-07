const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('renovation.db');

// Helper function to parse CSV values
function parseValue(value) {
  if (!value || value === '' || value === 'Planning') return 0;
  return parseFloat(value) || 0;
}

// Helper function to determine status
function getStatus(statusStr) {
  if (statusStr === 'Planning') return 'pending';
  if (statusStr === 'Included') return 'approved';
  return 'pending';
}

// Create user shatlin
const password = 'password123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Creating user shatlin...');
const userStmt = db.prepare(`
  INSERT INTO users (name, email, password_hash, created_at, updated_at)
  VALUES (?, ?, ?, datetime('now'), datetime('now'))
`);

try {
  userStmt.run('Shatlin Denistan', 'shatlin@gmail.com', hashedPassword);
} catch (error) {
  console.log('User already exists, continuing...');
}

// Get user ID
const user = db.prepare('SELECT id FROM users WHERE email = ?').get('shatlin@gmail.com');

if (user) {
  console.log('Creating renovation project...');
  
  // Create project
  const projectStmt = db.prepare(`
    INSERT INTO projects (user_id, name, description, total_budget, start_date, target_end_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  const projectResult = projectStmt.run(
    user.id,
    'Home Renovation 2025',
    'Complete home renovation including kitchen, bathrooms, bedrooms, and living areas',
    300000, // Estimated total budget
    '2025-10-01',
    '2025-11-30',
    'planning'
  );
  
  const projectId = projectResult.lastInsertRowid;
  console.log(`Project created with ID: ${projectId}`);
  
  // Create rooms
  console.log('Creating rooms...');
  const roomStmt = db.prepare(`
    INSERT INTO rooms (project_id, name, description, allocated_budget, actual_spent, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  const rooms = [
    { name: 'Kitchen', description: 'Complete kitchen renovation with cabinets and appliances', budget: 95000 },
    { name: 'Master Bathroom', description: 'Full bathroom renovation with modern fixtures', budget: 45000 },
    { name: 'Guest Bathroom', description: 'Guest bathroom upgrade', budget: 40000 },
    { name: 'Master Bedroom', description: 'Master bedroom with cupboards and finishes', budget: 20000 },
    { name: 'Other Bedroom', description: 'Second bedroom renovation', budget: 20000 },
    { name: 'Living Room', description: 'Living room upgrades', budget: 10000 },
    { name: 'Balcony', description: 'Balcony tiling and painting', budget: 4000 },
    { name: 'Walking Area', description: 'Corridor and walkway improvements', budget: 2000 },
    { name: 'Whole House', description: 'House-wide improvements like flooring', budget: 42000 }
  ];
  
  const roomMap = {};
  rooms.forEach(room => {
    const result = roomStmt.run(
      projectId,
      room.name,
      room.description,
      room.budget,
      0,
      'planning'
    );
    roomMap[room.name] = result.lastInsertRowid;
  });
  
  // Get categories
  const categories = db.prepare('SELECT * FROM categories').all();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name.toLowerCase()] = cat.id;
  });
  
  // Create vendors
  console.log('Creating vendors...');
  const vendorStmt = db.prepare(`
    INSERT INTO vendors (project_id, name, company, phone, email, specialization, rating, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const vendors = [
    { name: 'John Smith', company: 'Premium Tiles Co', phone: '555-0101', email: 'john@tiles.com', specialization: 'Tiling & Flooring', rating: 5 },
    { name: 'Mike Johnson', company: 'Expert Plumbing', phone: '555-0102', email: 'mike@plumbing.com', specialization: 'Plumbing', rating: 4 },
    { name: 'David Lee', company: 'Spark Electrical', phone: '555-0103', email: 'david@electrical.com', specialization: 'Electrical', rating: 5 },
    { name: 'Robert Chen', company: 'Master Carpentry', phone: '555-0104', email: 'robert@carpentry.com', specialization: 'Carpentry', rating: 4 },
    { name: 'Sarah Wilson', company: 'Perfect Paint', phone: '555-0105', email: 'sarah@painting.com', specialization: 'Painting', rating: 5 }
  ];
  
  vendors.forEach(vendor => {
    try {
      vendorStmt.run(
        projectId,
        vendor.name,
        vendor.company,
        vendor.phone,
        vendor.email,
        vendor.specialization,
        vendor.rating,
        'Recommended contractor'
      );
    } catch (error) {
      console.log(`Vendor ${vendor.name} might already exist, continuing...`);
    }
  });
  
  // Parse CSV and create budget items
  console.log('Creating budget items from CSV...');
  const csvData = fs.readFileSync(path.join(__dirname, '../Renovation_95 - Renovation.csv'), 'utf-8');
  const lines = csvData.split('\n').filter(line => line.trim());
  
  const itemStmt = db.prepare(`
    INSERT INTO budget_items (
      project_id, room_id, category_id, name, description, 
      quantity, unit_price, estimated_cost, actual_cost, 
      vendor, status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  // Map item types to categories and vendors
  function getCategoryAndVendor(itemName, roomName) {
    const name = itemName.toLowerCase();
    const room = roomName.toLowerCase();
    
    if (name.includes('tiling') || name.includes('tiles') || name.includes('floor')) {
      return { category: categoryMap['flooring'] || categoryMap['materials'], vendor: 'Premium Tiles Co' };
    }
    if (name.includes('plumbing') || name.includes('sink') || name.includes('toilet') || name.includes('shower') || name.includes('basin') || name.includes('bidet')) {
      return { category: categoryMap['plumbing'] || categoryMap['materials'], vendor: 'Expert Plumbing' };
    }
    if (name.includes('electrical') || name.includes('lights') || name.includes('plugs') || name.includes('heater')) {
      return { category: categoryMap['electrical'] || categoryMap['materials'], vendor: 'Spark Electrical' };
    }
    if (name.includes('cabinet') || name.includes('cupboard') || name.includes('door')) {
      return { category: categoryMap['furniture'] || categoryMap['materials'], vendor: 'Master Carpentry' };
    }
    if (name.includes('painting') || name.includes('paint')) {
      return { category: categoryMap['design'] || categoryMap['materials'], vendor: 'Perfect Paint' };
    }
    if (room.includes('kitchen') && (name.includes('stove') || name.includes('oven') || name.includes('chimney'))) {
      return { category: categoryMap['appliances'] || categoryMap['materials'], vendor: null };
    }
    
    return { category: categoryMap['materials'], vendor: null };
  }
  
  // Skip header and process items
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length < 7) continue;
    
    const room = parts[0];
    const itemName = parts[1];
    const type = parts[2];
    const materialCost = parseValue(parts[3]);
    const labourCost = parseValue(parts[4]);
    const total = parseValue(parts[5]);
    const status = parts[6];
    
    if (!roomMap[room]) {
      console.log(`Room not found: ${room}, skipping item...`);
      continue;
    }
    
    const estimatedCost = total || (materialCost + labourCost);
    if (estimatedCost === 0 && status !== 'Included' && status !== 'Planning') {
      continue; // Skip items with no cost unless they're included or planning items
    }
    
    const { category, vendor } = getCategoryAndVendor(itemName, room);
    
    try {
      itemStmt.run(
        projectId,
        roomMap[room],
        category,
        itemName,
        type || '',
        1, // quantity
        estimatedCost, // unit price
        estimatedCost, // estimated cost
        null, // actual cost
        vendor,
        getStatus(status),
        `Material: ${materialCost || 0}, Labour: ${labourCost || 0}`
      );
    } catch (error) {
      console.log(`Error inserting item: ${itemName}`, error.message);
    }
  }
  
  console.log('Budget items created successfully!');
  
  // Create realistic timeline (Oct 1 - Nov 30, 2025)
  console.log('Creating project timeline...');
  const timelineStmt = db.prepare(`
    INSERT INTO timeline_entries (
      project_id, start_day, end_day, start_date, end_date,
      title, description, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  const timeline = [
    // Week 1-2: Planning & Preparation (Oct 1-14)
    { start: 1, end: 7, startDate: '2025-10-01', endDate: '2025-10-07', 
      title: 'Planning & Design Finalization', 
      desc: 'Finalize all designs, measurements, and material selections. Order materials.', 
      status: 'planned' },
    { start: 8, end: 14, startDate: '2025-10-08', endDate: '2025-10-14', 
      title: 'Permits & Material Delivery', 
      desc: 'Obtain necessary permits, receive and organize materials', 
      status: 'planned' },
    
    // Week 3-4: Demolition & Prep (Oct 15-28)
    { start: 15, end: 18, startDate: '2025-10-15', endDate: '2025-10-18', 
      title: 'Demolition Phase', 
      desc: 'Remove old tiles, fixtures, and prepare surfaces in all areas', 
      status: 'planned' },
    { start: 19, end: 21, startDate: '2025-10-19', endDate: '2025-10-21', 
      title: 'Rubble Removal & Surface Prep', 
      desc: 'Clear debris, level floors, prepare walls for work', 
      status: 'planned' },
    
    // Week 5: Plumbing & Electrical Rough-in (Oct 22-28)
    { start: 22, end: 25, startDate: '2025-10-22', endDate: '2025-10-25', 
      title: 'Plumbing Rough-in', 
      desc: 'Install new plumbing lines for kitchen and bathrooms', 
      status: 'planned' },
    { start: 26, end: 28, startDate: '2025-10-26', endDate: '2025-10-28', 
      title: 'Electrical Rough-in', 
      desc: 'Install electrical wiring, outlets, and switch boxes', 
      status: 'planned' },
    
    // Week 6-7: Tiling (Oct 29 - Nov 11)
    { start: 29, end: 35, startDate: '2025-10-29', endDate: '2025-11-04', 
      title: 'Floor Tiling - Whole House', 
      desc: 'Install floor tiles throughout 112sqm including skirting', 
      status: 'planned' },
    { start: 36, end: 42, startDate: '2025-11-05', endDate: '2025-11-11', 
      title: 'Wall Tiling - All Areas', 
      desc: 'Complete wall tiling in bathrooms, kitchen, and bedrooms', 
      status: 'planned' },
    
    // Week 8: Bathrooms (Nov 12-18)
    { start: 43, end: 46, startDate: '2025-11-12', endDate: '2025-11-15', 
      title: 'Bathroom Fixtures Installation', 
      desc: 'Install toilets, basins, showers, and bathroom cabinets', 
      status: 'planned' },
    { start: 47, end: 49, startDate: '2025-11-16', endDate: '2025-11-18', 
      title: 'Bathroom Finishing', 
      desc: 'Install mirrors, accessories, heaters, and towel racks', 
      status: 'planned' },
    
    // Week 9: Kitchen & Carpentry (Nov 19-25)
    { start: 50, end: 53, startDate: '2025-11-19', endDate: '2025-11-22', 
      title: 'Kitchen Cabinet Installation', 
      desc: 'Install kitchen cabinets, countertops, and sink', 
      status: 'planned' },
    { start: 54, end: 56, startDate: '2025-11-23', endDate: '2025-11-25', 
      title: 'Carpentry - Cupboards & Doors', 
      desc: 'Install bedroom cupboards and replace all doors', 
      status: 'planned' },
    
    // Final Week: Finishing (Nov 26-30)
    { start: 57, end: 59, startDate: '2025-11-26', endDate: '2025-11-28', 
      title: 'Painting & Final Touches', 
      desc: 'Complete all painting work in all rooms', 
      status: 'planned' },
    { start: 60, end: 61, startDate: '2025-11-29', endDate: '2025-11-30', 
      title: 'Final Inspection & Cleanup', 
      desc: 'Install blinds, final fixtures, cleanup, and quality check', 
      status: 'planned' }
  ];
  
  timeline.forEach(entry => {
    try {
      timelineStmt.run(
        projectId,
        entry.start,
        entry.end,
        entry.startDate,
        entry.endDate,
        entry.title,
        entry.desc,
        entry.status
      );
    } catch (error) {
      console.log(`Error creating timeline entry: ${entry.title}`, error.message);
    }
  });
  
  console.log('Timeline created successfully!');
  
  // Get timeline entries and link budget items
  console.log('Linking budget items to timeline...');
  const timelineEntries = db.prepare('SELECT * FROM timeline_entries WHERE project_id = ?').all(projectId);
  const budgetItems = db.prepare('SELECT * FROM budget_items WHERE project_id = ?').all(projectId);
  
  const linkStmt = db.prepare(`
    INSERT INTO timeline_budget_items (timeline_entry_id, budget_item_id, allocated_amount, actual_amount, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  // Map items to timeline phases
  timelineEntries.forEach(entry => {
    const title = entry.title.toLowerCase();
    
    budgetItems.forEach(item => {
      const itemName = item.name.toLowerCase();
      let shouldLink = false;
      
      // Match items to timeline phases
      if (title.includes('demolition') && itemName.includes('breaking')) {
        shouldLink = true;
      } else if (title.includes('plumbing') && (itemName.includes('plumbing') || itemName.includes('sink') || itemName.includes('toilet') || itemName.includes('shower') || itemName.includes('basin'))) {
        shouldLink = true;
      } else if (title.includes('electrical') && (itemName.includes('electrical') || itemName.includes('lights') || itemName.includes('plugs'))) {
        shouldLink = true;
      } else if (title.includes('floor tiling') && itemName.includes('floor')) {
        shouldLink = true;
      } else if (title.includes('wall tiling') && itemName.includes('wall')) {
        shouldLink = true;
      } else if (title.includes('bathroom fixtures') && item.room_id === roomMap['Master Bathroom'] || item.room_id === roomMap['Guest Bathroom']) {
        shouldLink = true;
      } else if (title.includes('kitchen cabinet') && item.room_id === roomMap['Kitchen']) {
        shouldLink = true;
      } else if (title.includes('carpentry') && (itemName.includes('cupboard') || itemName.includes('door'))) {
        shouldLink = true;
      } else if (title.includes('painting') && itemName.includes('paint')) {
        shouldLink = true;
      }
      
      if (shouldLink) {
        try {
          linkStmt.run(
            entry.id,
            item.id,
            item.estimated_cost,
            0,
            'Allocated to ' + entry.title
          );
        } catch (error) {
          // Ignore duplicate links
        }
      }
    });
  });
  
  console.log('Budget items linked to timeline!');
  console.log('\n=================================');
  console.log('Seeding completed successfully!');
  console.log('=================================');
  console.log('User created:');
  console.log('  Email: shatlin@gmail.com');
  console.log('  Password: password123');
  console.log(`  Project: Home Renovation 2025`);
  console.log(`  Rooms: ${Object.keys(roomMap).length}`);
  console.log(`  Budget Items: ${budgetItems.length}`);
  console.log(`  Timeline Entries: ${timelineEntries.length}`);
  console.log('=================================\n');
}

db.close();