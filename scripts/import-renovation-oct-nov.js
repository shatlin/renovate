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

// Delete existing project data for this user
console.log('Cleaning up existing project data...');
const existingProjects = db.prepare('SELECT id FROM projects WHERE user_id = ?').all(userId);
existingProjects.forEach(project => {
  db.prepare('DELETE FROM budget_items WHERE project_id = ?').run(project.id);
  db.prepare('DELETE FROM timeline_entries WHERE project_id = ?').run(project.id);
  db.prepare('DELETE FROM vendors WHERE project_id = ?').run(project.id);
  db.prepare('DELETE FROM rooms WHERE project_id = ?').run(project.id);
});
db.prepare('DELETE FROM projects WHERE user_id = ?').run(userId);

// Create main project with Oct-Nov 2025 dates
const projectStmt = db.prepare(`
  INSERT INTO projects (user_id, name, description, total_budget, start_date, target_end_date, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const projectResult = projectStmt.run(
  userId,
  'Home Renovation Oct-Nov 2025',
  'Complete home renovation including kitchen, bathrooms, bedrooms, and living areas',
  350000,
  '2025-10-01',
  '2025-11-30',
  'planning'
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

// Create daily timeline entries (Oct 1 - Nov 30, 2025, excluding Fridays and Saturdays)
const timelineStmt = db.prepare(`
  INSERT INTO timeline_entries (project_id, start_day, end_day, start_date, end_date, title, description, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// Define work schedule for each working day
const workSchedule = [
  // Week 1: Oct 1-2 (Wed-Thu)
  { date: '2025-10-01', title: 'Project Kickoff & Planning', description: 'Meet contractors, finalize plans, obtain permits', room: 'Whole House' },
  { date: '2025-10-02', title: 'Site Preparation', description: 'Protect furniture, set up work areas, deliver materials', room: 'Whole House' },
  
  // Week 2: Oct 5-9 (Sun-Thu, no Fri)
  { date: '2025-10-05', title: 'Kitchen Demo - Cabinets', description: 'Remove old kitchen cabinets and countertops', room: 'Kitchen' },
  { date: '2025-10-06', title: 'Kitchen Demo - Tiles', description: 'Break and remove kitchen wall tiles', room: 'Kitchen' },
  { date: '2025-10-07', title: 'Kitchen Demo - Cleanup', description: 'Clear debris, prepare for new installation', room: 'Kitchen' },
  { date: '2025-10-08', title: 'Master Bath Demo', description: 'Remove fixtures and tiles from master bathroom', room: 'Master Bathroom' },
  { date: '2025-10-09', title: 'Guest Bath Demo', description: 'Remove fixtures and tiles from guest bathroom', room: 'Guest Bathroom' },
  
  // Week 3: Oct 12-16 (Sun-Thu)
  { date: '2025-10-12', title: 'Plumbing - Kitchen', description: 'Install new water lines for sink, dishwasher', room: 'Kitchen' },
  { date: '2025-10-13', title: 'Plumbing - Master Bath', description: 'Install shower, toilet, basin plumbing', room: 'Master Bathroom' },
  { date: '2025-10-14', title: 'Plumbing - Guest Bath', description: 'Install shower, toilet, basin plumbing', room: 'Guest Bathroom' },
  { date: '2025-10-15', title: 'Electrical - Kitchen', description: 'Install new electrical points, lighting circuits', room: 'Kitchen' },
  { date: '2025-10-16', title: 'Electrical - Bedrooms', description: 'Update electrical outlets and light fixtures', room: 'Master Bedroom' },
  
  // Week 4: Oct 19-23 (Sun-Thu)
  { date: '2025-10-19', title: 'Floor Prep - Living Areas', description: 'Level and prepare floors for tiling', room: 'Living Room' },
  { date: '2025-10-20', title: 'Floor Tiling - Living Room', description: 'Install floor tiles in living room', room: 'Living Room' },
  { date: '2025-10-21', title: 'Floor Tiling - Master Bedroom', description: 'Install floor tiles in master bedroom', room: 'Master Bedroom' },
  { date: '2025-10-22', title: 'Floor Tiling - Other Bedroom', description: 'Install floor tiles in second bedroom', room: 'Other Bedroom' },
  { date: '2025-10-23', title: 'Floor Tiling - Walking Areas', description: 'Complete hallway and passage tiling', room: 'Walking Area' },
  
  // Week 5: Oct 26-30 (Sun-Thu)
  { date: '2025-10-26', title: 'Kitchen Cabinets - Lower', description: 'Install lower kitchen cabinets', room: 'Kitchen' },
  { date: '2025-10-27', title: 'Kitchen Cabinets - Upper', description: 'Install upper cabinets and glass display', room: 'Kitchen' },
  { date: '2025-10-28', title: 'Kitchen Countertop', description: 'Install granite countertop', room: 'Kitchen' },
  { date: '2025-10-29', title: 'Kitchen Sink & Plumbing', description: 'Install sink and connect plumbing', room: 'Kitchen' },
  { date: '2025-10-30', title: 'Kitchen Appliances', description: 'Install stove, oven, and chimney', room: 'Kitchen' },
  
  // Week 6: Nov 2-6 (Sun-Thu)
  { date: '2025-11-02', title: 'Master Bath Tiling', description: 'Complete wall and floor tiling', room: 'Master Bathroom' },
  { date: '2025-11-03', title: 'Master Bath Shower', description: 'Install shower doors and fixtures', room: 'Master Bathroom' },
  { date: '2025-11-04', title: 'Master Bath Fixtures', description: 'Install toilet, basin, cabinet, mirror', room: 'Master Bathroom' },
  { date: '2025-11-05', title: 'Guest Bath Tiling', description: 'Complete wall and floor tiling', room: 'Guest Bathroom' },
  { date: '2025-11-06', title: 'Guest Bath Fixtures', description: 'Install all bathroom fixtures', room: 'Guest Bathroom' },
  
  // Week 7: Nov 9-13 (Sun-Thu)
  { date: '2025-11-09', title: 'Bedroom Cupboards', description: 'Install built-in cupboards in master bedroom', room: 'Master Bedroom' },
  { date: '2025-11-10', title: 'Other Bedroom Cupboards', description: 'Install built-in cupboards in second bedroom', room: 'Other Bedroom' },
  { date: '2025-11-11', title: 'Wall Tiling - Kitchen', description: 'Install kitchen backsplash tiles', room: 'Kitchen' },
  { date: '2025-11-12', title: 'Wall Tiling - Living Areas', description: 'Complete accent wall tiling', room: 'Living Room' },
  { date: '2025-11-13', title: 'Balcony Work', description: 'Tile balcony floor and walls', room: 'Balcony' },
  
  // Week 8: Nov 16-20 (Sun-Thu)
  { date: '2025-11-16', title: 'Painting - Bedrooms', description: 'Paint master and other bedrooms', room: 'Master Bedroom' },
  { date: '2025-11-17', title: 'Painting - Living Areas', description: 'Paint living room and passages', room: 'Living Room' },
  { date: '2025-11-18', title: 'Painting - Kitchen & Baths', description: 'Complete painting in wet areas', room: 'Kitchen' },
  { date: '2025-11-19', title: 'Doors Installation', description: 'Replace all interior doors', room: 'Whole House' },
  { date: '2025-11-20', title: 'Blinds & Curtains', description: 'Install window treatments throughout', room: 'Whole House' },
  
  // Week 9: Nov 23-27 (Sun-Thu)
  { date: '2025-11-23', title: 'Final Electrical', description: 'Install light fixtures, test all circuits', room: 'Whole House' },
  { date: '2025-11-24', title: 'Final Plumbing', description: 'Test all plumbing, fix any leaks', room: 'Whole House' },
  { date: '2025-11-25', title: 'Touch-ups', description: 'Paint touch-ups, grout cleaning', room: 'Whole House' },
  { date: '2025-11-26', title: 'Deep Cleaning', description: 'Professional cleaning of all areas', room: 'Whole House' },
  { date: '2025-11-27', title: 'Final Inspection', description: 'Walk-through with contractor, create snag list', room: 'Whole House' },
  
  // Final days: Nov 30 (Sun)
  { date: '2025-11-30', title: 'Project Handover', description: 'Final sign-off and project completion', room: 'Whole House' }
];

// Insert timeline entries
let dayCounter = 1;
workSchedule.forEach(entry => {
  const result = timelineStmt.run(
    projectId,
    dayCounter,
    dayCounter,
    entry.date,
    entry.date,
    entry.title,
    entry.description,
    'planned'
  );
  console.log(`Day ${dayCounter} (${entry.date}): ${entry.title}`);
  dayCounter++;
});

console.log(`Created ${workSchedule.length} daily timeline entries`);

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
let skippedCount = 0;

lines.forEach((line, index) => {
  if (!line.trim()) return;
  
  // Parse CSV - handle empty fields
  const parts = line.split(',').map(p => p.trim());
  if (parts.length < 7) return;
  
  const room = parts[0];
  const item = parts[1];
  const type = parts[2] || '';
  const materialCost = parseFloat(parts[3]) || 0;
  const labourCost = parseFloat(parts[4]) || 0;
  const total = parseFloat(parts[5]) || 0;
  const status = parts[6] || 'Pending';
  
  if (!roomIds[room]) {
    console.log(`Warning: Room '${room}' not found, skipping item: ${item}`);
    skippedCount++;
    return;
  }
  
  // Determine category based on item name
  let categoryId = categoryMap['other'] || 13;
  const itemLower = item.toLowerCase();
  
  if (itemLower.includes('cabinet') || itemLower.includes('cupboard')) {
    categoryId = categoryMap['furniture'] || 5;
  } else if (itemLower.includes('light') || itemLower.includes('electrical') || itemLower.includes('plug')) {
    categoryId = categoryMap['electrical'] || 8;
  } else if (itemLower.includes('plumb') || itemLower.includes('sink') || 
             itemLower.includes('toilet') || itemLower.includes('shower') || 
             itemLower.includes('basin') || itemLower.includes('tap') || itemLower.includes('bidet')) {
    categoryId = categoryMap['plumbing'] || 9;
  } else if (itemLower.includes('til')) {
    categoryId = categoryMap['flooring'] || 10;
  } else if (itemLower.includes('door') || itemLower.includes('blind')) {
    categoryId = categoryMap['windows & doors'] || 11;
  } else if (itemLower.includes('paint')) {
    categoryId = categoryMap['design'] || 7;
  } else if (itemLower.includes('stove') || itemLower.includes('oven') || 
             itemLower.includes('chimney') || itemLower.includes('heater')) {
    categoryId = categoryMap['appliances'] || 4;
  } else if (itemLower.includes('mirror') || itemLower.includes('rack') || 
             itemLower.includes('organizer')) {
    categoryId = categoryMap['fixtures'] || 3;
  }
  
  // Map status
  let dbStatus = 'pending';
  if (status.toLowerCase().includes('included')) {
    dbStatus = 'approved';
    if (total === 0) return; // Skip items that are included elsewhere
  }
  if (status.toLowerCase().includes('planning')) {
    dbStatus = 'pending';
  }
  
  try {
    const result = budgetStmt.run(
      projectId,
      roomIds[room],
      categoryId,
      item,
      type || null,
      1, // quantity
      total, // unit price (total for 1 unit)
      total, // estimated cost
      null, // actual cost
      null, // vendor (will be assigned later)
      `Material: R${materialCost.toFixed(2)}, Labour: R${labourCost.toFixed(2)}`,
      dbStatus
    );
    
    itemCount++;
    totalBudget += total;
  } catch (error) {
    console.error(`Error inserting item: ${item}`, error.message);
  }
});

console.log(`\nBudget Import Summary:`);
console.log(`- Items created: ${itemCount}`);
console.log(`- Items skipped: ${skippedCount}`);
console.log(`- Total estimated budget: R${totalBudget.toFixed(2)}`);

// Update project total budget
db.prepare('UPDATE projects SET total_budget = ? WHERE id = ?').run(totalBudget, projectId);

// Verify the data
const counts = {
  rooms: db.prepare('SELECT COUNT(*) as count FROM rooms WHERE project_id = ?').get(projectId).count,
  vendors: db.prepare('SELECT COUNT(*) as count FROM vendors WHERE project_id = ?').get(projectId).count,
  timeline: db.prepare('SELECT COUNT(*) as count FROM timeline_entries WHERE project_id = ?').get(projectId).count,
  budget: db.prepare('SELECT COUNT(*) as count FROM budget_items WHERE project_id = ?').get(projectId).count
};

db.close();

console.log('\n✅ Full data import completed successfully!');
console.log('=====================================');
console.log(`Project: Home Renovation Oct-Nov 2025`);
console.log(`Project ID: ${projectId}`);
console.log(`Date Range: Oct 1 - Nov 30, 2025`);
console.log(`Working Days: ${workSchedule.length} (excluding Fri/Sat)`);
console.log(`Total Rooms: ${counts.rooms}`);
console.log(`Total Vendors: ${counts.vendors}`);
console.log(`Timeline Entries: ${counts.timeline}`);
console.log(`Budget Items: ${counts.budget}`);
console.log(`Total Budget: R${totalBudget.toFixed(2)}`);