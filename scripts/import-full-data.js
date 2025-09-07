const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database(path.join(process.cwd(), 'renovation-budget.db'));

// Get the user ID for shatlin@gmail.com
const user = db.prepare('SELECT id FROM users WHERE email = ?').get('shatlin@gmail.com');
if (!user) {
  console.error('User shatlin@gmail.com not found. Please create the user first.');
  process.exit(1);
}

const userId = user.id;
console.log('Found user with ID:', userId);

// Create main project
const projectStmt = db.prepare(`
  INSERT INTO projects (user_id, name, description, total_budget, start_date, target_end_date, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const projectResult = projectStmt.run(
  userId,
  'Home Renovation 2024',
  'Complete home renovation including kitchen, bathrooms, bedrooms, and living areas',
  350000, // Estimated from CSV data
  '2024-01-15',
  '2024-04-30',
  'in_progress'
);
const projectId = projectResult.lastInsertRowid;
console.log('Created project with ID:', projectId);

// Create rooms based on CSV data
const roomStmt = db.prepare(`
  INSERT INTO rooms (project_id, name, area_sqft, renovation_type, status, display_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const rooms = [
  { name: 'Kitchen', area_sqft: 150, renovation_type: 'Full', status: 'planned', display_order: 1 },
  { name: 'Master Bathroom', area_sqft: 80, renovation_type: 'Full', status: 'planned', display_order: 2 },
  { name: 'Guest Bathroom', area_sqft: 60, renovation_type: 'Full', status: 'planned', display_order: 3 },
  { name: 'Master Bedroom', area_sqft: 200, renovation_type: 'Full', status: 'planned', display_order: 4 },
  { name: 'Other Bedroom', area_sqft: 150, renovation_type: 'Full', status: 'planned', display_order: 5 },
  { name: 'Living Room', area_sqft: 300, renovation_type: 'Partial', status: 'planned', display_order: 6 },
  { name: 'Balcony', area_sqft: 50, renovation_type: 'Partial', status: 'planned', display_order: 7 },
  { name: 'Walking Area', area_sqft: 100, renovation_type: 'Partial', status: 'planned', display_order: 8 },
  { name: 'Whole House', area_sqft: 1120, renovation_type: 'Full', status: 'planned', display_order: 9 }
];

const roomIds = {};
rooms.forEach(room => {
  const result = roomStmt.run(projectId, room.name, room.area_sqft, room.renovation_type, room.status, room.display_order);
  roomIds[room.name] = result.lastInsertRowid;
  console.log(`Created room '${room.name}' with ID:`, result.lastInsertRowid);
});

// Create vendors
const vendorStmt = db.prepare(`
  INSERT INTO vendors (project_id, name, company, phone, email, specialization, rating, notes, display_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const vendors = [
  {
    name: 'John Smith',
    company: 'Smith Construction Ltd',
    phone: '+27 11 123 4567',
    email: 'john@smithconstruction.co.za',
    specialization: 'General Contractor',
    rating: 5,
    notes: 'Excellent work on previous projects. Specializes in kitchen and bathroom renovations.',
    display_order: 1
  },
  {
    name: 'Sarah Johnson',
    company: 'Premium Tiles & Flooring',
    phone: '+27 21 987 6543',
    email: 'sarah@premiumtiles.co.za',
    specialization: 'Tiling and Flooring',
    rating: 4,
    notes: 'Competitive pricing, good quality materials. Handles all tiling work.',
    display_order: 2
  }
];

vendors.forEach(vendor => {
  const result = vendorStmt.run(projectId, vendor.name, vendor.company, vendor.phone, vendor.email, 
    vendor.specialization, vendor.rating, vendor.notes, vendor.display_order);
  console.log(`Created vendor '${vendor.name}' with ID:`, result.lastInsertRowid);
});

// Create timeline entries (daily plan for 106 days - from Jan 15 to April 30, 2024)
const timelineStmt = db.prepare(`
  INSERT INTO timeline_entries (project_id, start_day, end_day, start_date, end_date, title, description, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const timeline = [
  // Week 1-2: Planning and Preparation
  { start_day: 1, end_day: 7, title: 'Project Planning & Permits', description: 'Finalize designs, obtain permits, order materials', status: 'completed' },
  { start_day: 8, end_day: 14, title: 'Site Preparation', description: 'Clear areas, protect furniture, set up work zones', status: 'completed' },
  
  // Week 3-4: Demolition
  { start_day: 15, end_day: 21, title: 'Kitchen Demolition', description: 'Remove old kitchen fixtures, cabinets, tiles', status: 'completed' },
  { start_day: 22, end_day: 28, title: 'Bathroom Demolition', description: 'Remove fixtures from both bathrooms', status: 'in_progress' },
  
  // Week 5-7: Plumbing and Electrical
  { start_day: 29, end_day: 35, title: 'Plumbing Rough-in', description: 'Install new plumbing for kitchen and bathrooms', status: 'planned' },
  { start_day: 36, end_day: 42, title: 'Electrical Work', description: 'Install new electrical points, lighting circuits', status: 'planned' },
  { start_day: 43, end_day: 49, title: 'Inspection & Adjustments', description: 'Municipal inspections, fix any issues', status: 'planned' },
  
  // Week 8-10: Flooring
  { start_day: 50, end_day: 56, title: 'Floor Preparation', description: 'Level floors, prepare for tiling', status: 'planned' },
  { start_day: 57, end_day: 63, title: 'Floor Tiling - Living Areas', description: 'Install tiles in living room, bedrooms, walking areas', status: 'planned' },
  { start_day: 64, end_day: 70, title: 'Floor Tiling - Wet Areas', description: 'Install tiles in kitchen and bathrooms', status: 'planned' },
  
  // Week 11-12: Kitchen Installation
  { start_day: 71, end_day: 77, title: 'Kitchen Cabinets', description: 'Install kitchen cabinets and countertops', status: 'planned' },
  { start_day: 78, end_day: 84, title: 'Kitchen Appliances', description: 'Install stove, oven, chimney, sink', status: 'planned' },
  
  // Week 13-14: Bathroom Installation
  { start_day: 85, end_day: 91, title: 'Master Bathroom Fixtures', description: 'Install shower, toilet, basin, cabinets', status: 'planned' },
  { start_day: 92, end_day: 98, title: 'Guest Bathroom Fixtures', description: 'Install all guest bathroom fixtures', status: 'planned' },
  
  // Week 15: Final Touches
  { start_day: 99, end_day: 105, title: 'Painting & Final Touches', description: 'Paint all rooms, install blinds, mirrors', status: 'planned' },
  { start_day: 106, end_day: 106, title: 'Final Inspection', description: 'Final walkthrough and handover', status: 'planned' }
];

timeline.forEach(entry => {
  const startDate = new Date('2024-01-15');
  startDate.setDate(startDate.getDate() + entry.start_day - 1);
  const endDate = new Date('2024-01-15');
  endDate.setDate(endDate.getDate() + entry.end_day - 1);
  
  const result = timelineStmt.run(
    projectId,
    entry.start_day,
    entry.end_day,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
    entry.title,
    entry.description,
    entry.status
  );
  console.log(`Created timeline entry '${entry.title}' for days ${entry.start_day}-${entry.end_day}`);
});

// Read and parse CSV file
const csvPath = path.join(process.cwd(), 'Renovation_95 - Renovation.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').slice(1); // Skip header

// Get categories
const categories = db.prepare('SELECT id, name FROM categories').all();
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.name.toLowerCase()] = cat.id;
});

// Create budget items from CSV
const budgetStmt = db.prepare(`
  INSERT INTO budget_items (
    project_id, room_id, category_id, name, description, 
    quantity, unit_price, estimated_cost, actual_cost, vendor, notes, status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let totalBudget = 0;
let itemCount = 0;
lines.forEach((line, index) => {
  if (!line.trim()) return;
  
  // Simple CSV parsing - split by comma
  const parts = line.split(',');
  if (parts.length < 7) return;
  
  const room = parts[0].trim();
  const item = parts[1].trim();
  const type = parts[2].trim();
  const materialCost = parseFloat(parts[3]) || 0;
  const labourCost = parseFloat(parts[4]) || 0;
  const total = parseFloat(parts[5]) || 0;
  const status = parts[6].trim();
  
  if (!roomIds[room]) {
    console.log(`Warning: Room '${room}' not found, skipping item`);
    return;
  }
  
  // Determine category based on item type
  let categoryId = categoryMap['other'];
  if (item.toLowerCase().includes('cabinet') || item.toLowerCase().includes('cupboard')) {
    categoryId = categoryMap['furniture'];
  } else if (item.toLowerCase().includes('light') || item.toLowerCase().includes('electrical')) {
    categoryId = categoryMap['electrical'];
  } else if (item.toLowerCase().includes('plumb') || item.toLowerCase().includes('sink') || 
             item.toLowerCase().includes('toilet') || item.toLowerCase().includes('shower')) {
    categoryId = categoryMap['plumbing'];
  } else if (item.toLowerCase().includes('til')) {
    categoryId = categoryMap['flooring'];
  } else if (item.toLowerCase().includes('door') || item.toLowerCase().includes('blind')) {
    categoryId = categoryMap['windows & doors'];
  } else if (item.toLowerCase().includes('paint')) {
    categoryId = categoryMap['design'];
  } else if (item.toLowerCase().includes('stove') || item.toLowerCase().includes('oven') || 
             item.toLowerCase().includes('fridge')) {
    categoryId = categoryMap['appliances'];
  }
  
  // Map status
  let dbStatus = 'pending';
  if (status.toLowerCase() === 'included') dbStatus = 'approved';
  if (status.toLowerCase() === 'planning') dbStatus = 'pending';
  
  const result = budgetStmt.run(
    projectId,
    roomIds[room],
    categoryId,
    item,
    type || null,
    1, // quantity
    materialCost + labourCost, // unit price
    total, // estimated cost
    null, // actual cost
    materialCost > 0 ? 'Material Supplier' : 'Labour Contractor',
    `Material: R${materialCost}, Labour: R${labourCost}`,
    dbStatus
  );
  
  itemCount++;
  totalBudget += total;
});

console.log(`\nTotal budget items created from CSV: ${itemCount}`);
console.log(`Total estimated budget: R${totalBudget}`);

// Update project total budget
db.prepare('UPDATE projects SET total_budget = ? WHERE id = ?').run(totalBudget, projectId);

db.close();
console.log('\n✅ Full data import completed successfully!');
console.log(`Project ID: ${projectId}`);
console.log(`Total Rooms: ${Object.keys(roomIds).length}`);
console.log(`Total Vendors: ${vendors.length}`);
console.log(`Timeline Entries: ${timeline.length}`);
console.log(`Total Budget: R${totalBudget.toFixed(2)}`);