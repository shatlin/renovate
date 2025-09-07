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

// Clear existing timeline entries for project 1
console.log('Clearing existing timeline entries...');
db.prepare('DELETE FROM timeline_entries WHERE project_id = 1').run();
db.prepare('DELETE FROM timeline_budget_items WHERE timeline_entry_id NOT IN (SELECT id FROM timeline_entries)').run();

// Get project ID (should be 1 for shatlin)
const project = db.prepare('SELECT id FROM projects WHERE user_id = (SELECT id FROM users WHERE email = ?)').get('shatlin@gmail.com');

if (!project) {
  console.error('Project not found for shatlin@gmail.com');
  process.exit(1);
}

const projectId = project.id;
console.log(`Working with project ID: ${projectId}`);

// Create detailed 61-day timeline (Oct 1 - Nov 30, 2025)
console.log('Creating detailed day-by-day renovation plan...');
const timelineStmt = db.prepare(`
  INSERT INTO timeline_entries (
    project_id, start_day, end_day, start_date, end_date,
    title, description, status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

// Detailed day-by-day renovation plan
const detailedPlan = [
  // Week 1: Oct 1-7 (Days 1-7) - Planning & Preparation
  { start: 1, end: 1, date: '2025-10-01', title: 'Project Kickoff & Final Planning', 
    desc: 'Meet with all contractors, finalize designs, confirm measurements', 
    action: '1. Morning: Team meeting with all contractors\n2. Review and finalize all room designs\n3. Confirm material specifications\n4. Create work schedule\n5. Set up site safety protocols' },
  
  { start: 2, end: 2, date: '2025-10-02', title: 'Material Ordering & Permits', 
    desc: 'Order all materials, apply for necessary permits', 
    action: '1. Submit permit applications\n2. Order tiles (112sqm flooring + wall tiles)\n3. Order bathroom fixtures\n4. Order kitchen cabinets\n5. Schedule material deliveries' },
  
  { start: 3, end: 4, date: '2025-10-03', endDate: '2025-10-04', title: 'Site Preparation', 
    desc: 'Protect floors, set up work areas, prepare tools', 
    action: '1. Lay protective covering on floors\n2. Set up material storage areas\n3. Install temporary lighting\n4. Set up dust barriers\n5. Prepare demolition tools' },
  
  { start: 5, end: 7, date: '2025-10-05', endDate: '2025-10-07', title: 'Material Delivery & Organization', 
    desc: 'Receive and organize materials, quality checks', 
    action: '1. Receive tile deliveries\n2. Check material quality\n3. Organize by room\n4. Store fixtures safely\n5. Inventory all items' },

  // Week 2: Oct 8-14 (Days 8-14) - Master Bathroom Demolition & Rough-in
  { start: 8, end: 9, date: '2025-10-08', endDate: '2025-10-09', title: 'Master Bathroom - Demolition', 
    desc: 'Remove existing tiles, fixtures, and prepare surfaces', 
    action: '1. Remove toilet and store\n2. Remove basin and cabinet\n3. Break existing wall tiles\n4. Break floor tiles\n5. Clear all debris\n6. Clean surfaces' },
  
  { start: 10, end: 11, date: '2025-10-10', endDate: '2025-10-11', title: 'Master Bathroom - Plumbing Rough-in', 
    desc: 'Install new plumbing lines for shower, basin, toilet', 
    action: '1. Install shower plumbing\n2. Set up basin water lines\n3. Position toilet drainage\n4. Install bidet plumbing\n5. Pressure test all lines\n6. Install shutoff valves' },
  
  { start: 12, end: 13, date: '2025-10-12', endDate: '2025-10-13', title: 'Master Bathroom - Electrical Work', 
    desc: 'Install electrical points, lights, heater wiring', 
    action: '1. Install light fixtures wiring\n2. Add power outlets\n3. Wire bathroom heater\n4. Install exhaust fan wiring\n5. Add GFCI protection\n6. Test all circuits' },
  
  { start: 14, end: 14, date: '2025-10-14', title: 'Master Bathroom - Waterproofing', 
    desc: 'Apply waterproofing membrane to wet areas', 
    action: '1. Clean all surfaces\n2. Apply primer\n3. Install waterproof membrane\n4. Seal corners and joints\n5. Apply second coat\n6. 24-hour curing' },

  // Week 3: Oct 15-21 (Days 15-21) - Master Bathroom Tiling & Master Bedroom Start
  { start: 15, end: 17, date: '2025-10-15', endDate: '2025-10-17', title: 'Master Bathroom - Wall Tiling', 
    desc: 'Install wall tiles in shower area and around bathroom', 
    action: '1. Mark tile layout\n2. Apply adhesive\n3. Install wall tiles\n4. Check levels continuously\n5. Clean excess adhesive\n6. Allow to set' },
  
  { start: 18, end: 19, date: '2025-10-18', endDate: '2025-10-19', title: 'Master Bathroom - Floor Tiling', 
    desc: 'Install floor tiles with proper slope to drain', 
    action: '1. Check floor levels\n2. Mark drain slopes\n3. Apply adhesive\n4. Lay floor tiles\n5. Ensure proper drainage\n6. Clean and let cure' },
  
  { start: 20, end: 21, date: '2025-10-20', endDate: '2025-10-21', title: 'Master Bedroom - Demolition', 
    desc: 'Remove old fixtures, prepare for renovation', 
    action: '1. Remove existing door\n2. Remove old cupboards\n3. Break existing tiles\n4. Remove electrical fixtures\n5. Clear debris\n6. Clean room thoroughly' },

  // Week 4: Oct 22-28 (Days 22-28) - Master Bedroom & Guest Bathroom Start
  { start: 22, end: 23, date: '2025-10-22', endDate: '2025-10-23', title: 'Master Bedroom - Electrical & Wall Prep', 
    desc: 'Install electrical points and prepare walls', 
    action: '1. Install new electrical points\n2. Add light fixture wiring\n3. Prepare walls for tiling\n4. Level wall surfaces\n5. Apply primer' },
  
  { start: 24, end: 25, date: '2025-10-24', endDate: '2025-10-25', title: 'Master Bedroom - Wall Tiling', 
    desc: 'Install decorative wall tiles', 
    action: '1. Mark tile pattern\n2. Apply adhesive\n3. Install wall tiles\n4. Ensure straight lines\n5. Clean excess adhesive\n6. Apply grout' },
  
  { start: 26, end: 27, date: '2025-10-26', endDate: '2025-10-27', title: 'Guest Bathroom - Demolition', 
    desc: 'Remove existing fixtures and tiles', 
    action: '1. Remove all fixtures\n2. Break wall tiles\n3. Break floor tiles\n4. Clear debris\n5. Check plumbing condition\n6. Clean surfaces' },
  
  { start: 28, end: 28, date: '2025-10-28', title: 'Guest Bathroom - Plumbing Rough-in', 
    desc: 'Install plumbing for guest bathroom', 
    action: '1. Install shower plumbing\n2. Set basin lines\n3. Install toilet drainage\n4. Add bidet plumbing\n5. Test water pressure\n6. Check for leaks' },

  // Week 5: Oct 29 - Nov 4 (Days 29-35) - Guest Bathroom Completion & Guest Bedroom
  { start: 29, end: 30, date: '2025-10-29', endDate: '2025-10-30', title: 'Guest Bathroom - Electrical & Waterproofing', 
    desc: 'Complete electrical work and waterproofing', 
    action: '1. Install electrical wiring\n2. Add light points\n3. Wire heater connection\n4. Apply waterproofing\n5. Seal all joints\n6. Curing time' },
  
  { start: 31, end: 32, date: '2025-10-31', endDate: '2025-11-01', title: 'Guest Bathroom - Wall Tiling', 
    desc: 'Install wall tiles throughout guest bathroom', 
    action: '1. Layout tile pattern\n2. Apply tile adhesive\n3. Install wall tiles\n4. Check alignment\n5. Clean as you go\n6. Let adhesive cure' },
  
  { start: 33, end: 34, date: '2025-11-02', endDate: '2025-11-03', title: 'Guest Bathroom - Floor Tiling', 
    desc: 'Complete floor tiling with proper drainage', 
    action: '1. Prepare floor surface\n2. Mark drain slopes\n3. Apply adhesive\n4. Lay floor tiles\n5. Check drainage flow\n6. Grout application' },
  
  { start: 35, end: 35, date: '2025-11-04', title: 'Guest Bedroom - Preparation', 
    desc: 'Prepare guest bedroom for renovation', 
    action: '1. Remove old door\n2. Remove cupboards\n3. Remove old tiles\n4. Clean room\n5. Check electrical\n6. Plan layout' },

  // Week 6: Nov 5-11 (Days 36-42) - Guest Bedroom & Kitchen Start
  { start: 36, end: 37, date: '2025-11-05', endDate: '2025-11-06', title: 'Guest Bedroom - Electrical & Tiling', 
    desc: 'Complete electrical and wall tiling', 
    action: '1. Install electrical points\n2. Add lighting wiring\n3. Prepare walls\n4. Install wall tiles\n5. Apply grout\n6. Clean surfaces' },
  
  { start: 38, end: 39, date: '2025-11-07', endDate: '2025-11-08', title: 'Kitchen - Demolition', 
    desc: 'Remove old kitchen completely', 
    action: '1. Disconnect appliances\n2. Remove old cabinets\n3. Remove sink and plumbing\n4. Break wall tiles\n5. Remove floor tiles\n6. Clear all debris' },
  
  { start: 40, end: 41, date: '2025-11-09', endDate: '2025-11-10', title: 'Kitchen - Plumbing & Electrical Rough-in', 
    desc: 'Install new plumbing and electrical for kitchen', 
    action: '1. Install sink plumbing\n2. Add washing machine lines\n3. Install electrical for appliances\n4. Add lighting circuits\n5. Install exhaust wiring\n6. Test all connections' },
  
  { start: 42, end: 42, date: '2025-11-11', title: 'Kitchen - Wall Preparation', 
    desc: 'Prepare kitchen walls for tiling', 
    action: '1. Level wall surfaces\n2. Fill any gaps\n3. Apply primer\n4. Mark tile layout\n5. Plan cabinet positions\n6. Check measurements' },

  // Week 7: Nov 12-18 (Days 43-49) - Kitchen Tiling & Fixtures
  { start: 43, end: 45, date: '2025-11-12', endDate: '2025-11-14', title: 'Kitchen - Wall Tiling', 
    desc: 'Install kitchen wall tiles', 
    action: '1. Start with backsplash area\n2. Apply adhesive evenly\n3. Install wall tiles\n4. Ensure straight lines\n5. Clean excess adhesive\n6. Apply grout when ready' },
  
  { start: 46, end: 47, date: '2025-11-15', endDate: '2025-11-16', title: 'Whole House - Floor Tiling Phase 1', 
    desc: 'Begin installation of 112sqm floor tiles', 
    action: '1. Start with living areas\n2. Check floor levels\n3. Apply adhesive\n4. Lay tiles with spacers\n5. Check alignment\n6. Clean as you go' },
  
  { start: 48, end: 49, date: '2025-11-17', endDate: '2025-11-18', title: 'Whole House - Floor Tiling Phase 2', 
    desc: 'Continue floor tiling in bedrooms', 
    action: '1. Complete bedroom floors\n2. Ensure level transitions\n3. Cut tiles for edges\n4. Maintain pattern\n5. Clean excess adhesive\n6. Prepare for grouting' },

  // Week 8: Nov 19-25 (Days 50-56) - Installations & Living Areas
  { start: 50, end: 51, date: '2025-11-19', endDate: '2025-11-20', title: 'Bathroom Fixtures Installation', 
    desc: 'Install all bathroom fixtures and fittings', 
    action: '1. Install toilets\n2. Mount basins\n3. Install shower sets\n4. Add bidets\n5. Mount mirrors\n6. Install towel racks\n7. Test all plumbing' },
  
  { start: 52, end: 53, date: '2025-11-21', endDate: '2025-11-22', title: 'Kitchen Cabinet Installation', 
    desc: 'Install kitchen cabinets and countertop', 
    action: '1. Install base cabinets\n2. Mount wall cabinets\n3. Install countertop\n4. Mount sink\n5. Install tap\n6. Check alignments\n7. Adjust doors' },
  
  { start: 54, end: 55, date: '2025-11-23', endDate: '2025-11-24', title: 'Bedroom Cupboards & Doors', 
    desc: 'Install cupboards and new doors', 
    action: '1. Install master bedroom cupboards\n2. Install guest bedroom cupboards\n3. Hang new doors\n4. Install door hardware\n5. Adjust alignments\n6. Test all doors' },
  
  { start: 56, end: 56, date: '2025-11-25', title: 'Balcony & Living Room Tiling', 
    desc: 'Complete balcony and living room areas', 
    action: '1. Tile balcony floor\n2. Apply waterproofing\n3. Complete living room walls\n4. Install skirting\n5. Clean all areas\n6. Apply sealants' },

  // Final Week: Nov 26-30 (Days 57-61) - Finishing Touches
  { start: 57, end: 58, date: '2025-11-26', endDate: '2025-11-27', title: 'Painting - All Rooms', 
    desc: 'Paint all rooms and touch-ups', 
    action: '1. Prep all surfaces\n2. Apply primer\n3. Paint ceilings\n4. Paint walls\n5. Paint doors and frames\n6. Touch-up work' },
  
  { start: 59, end: 59, date: '2025-11-28', title: 'Final Installations', 
    desc: 'Install blinds, final fixtures, appliances', 
    action: '1. Install all blinds\n2. Mount light fixtures\n3. Install kitchen appliances\n4. Add switch plates\n5. Install accessories\n6. Final adjustments' },
  
  { start: 60, end: 60, date: '2025-11-29', title: 'Deep Cleaning', 
    desc: 'Complete deep cleaning of all areas', 
    action: '1. Clean all tiles\n2. Polish fixtures\n3. Clean windows\n4. Vacuum all areas\n5. Mop floors\n6. Remove all debris' },
  
  { start: 61, end: 61, date: '2025-11-30', title: 'Final Inspection & Handover', 
    desc: 'Quality check and project completion', 
    action: '1. Inspect all work\n2. Test all fixtures\n3. Check all electrical\n4. Test plumbing\n5. Create snag list\n6. Final touch-ups\n7. Project handover' }
];

// Insert all timeline entries
detailedPlan.forEach(entry => {
  try {
    const endDate = entry.endDate || entry.date;
    timelineStmt.run(
      projectId,
      entry.start,
      entry.end || entry.start,
      entry.date,
      endDate,
      entry.title,
      entry.desc,
      'planned'
    );
    
    // Add the action plan as the first note for each entry
    if (entry.action) {
      const entryId = db.prepare('SELECT last_insert_rowid() as id').get().id;
      db.prepare(`
        INSERT INTO timeline_notes (timeline_entry_id, content, author, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `).run(entryId, `ACTION PLAN:\n${entry.action}`, 'System');
    }
  } catch (error) {
    console.log(`Error creating timeline entry: ${entry.title}`, error.message);
  }
});

console.log('Detailed renovation plan created successfully!');

// Get room IDs
const rooms = db.prepare('SELECT id, name FROM rooms WHERE project_id = ?').all(projectId);
const roomMap = {};
rooms.forEach(room => {
  roomMap[room.name] = room.id;
});

// Get timeline entries and link budget items
console.log('Linking budget items to timeline...');
const timelineEntries = db.prepare('SELECT * FROM timeline_entries WHERE project_id = ?').all(projectId);
const budgetItems = db.prepare('SELECT * FROM budget_items WHERE project_id = ?').all(projectId);

const linkStmt = db.prepare(`
  INSERT INTO timeline_budget_items (timeline_entry_id, budget_item_id, allocated_amount, actual_amount, notes)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(timeline_entry_id, budget_item_id) DO NOTHING
`);

// Link items to appropriate timeline entries based on room and task
timelineEntries.forEach(entry => {
  const title = entry.title.toLowerCase();
  
  budgetItems.forEach(item => {
    const itemName = item.name.toLowerCase();
    const roomName = rooms.find(r => r.id === item.room_id)?.name.toLowerCase() || '';
    let shouldLink = false;
    
    // Match items to timeline phases based on room and task
    if (title.includes('master bathroom')) {
      if (roomName.includes('master bathroom')) {
        if (title.includes('demolition') && itemName.includes('breaking')) shouldLink = true;
        if (title.includes('plumbing') && (itemName.includes('plumbing') || itemName.includes('shower') || itemName.includes('basin') || itemName.includes('toilet') || itemName.includes('bidet'))) shouldLink = true;
        if (title.includes('electrical') && (itemName.includes('electrical') || itemName.includes('lights') || itemName.includes('heater'))) shouldLink = true;
        if (title.includes('wall tiling') && itemName.includes('wall')) shouldLink = true;
        if (title.includes('floor tiling') && itemName.includes('floor')) shouldLink = true;
      }
    } else if (title.includes('master bedroom')) {
      if (roomName.includes('master bedroom')) {
        if (title.includes('electrical') && (itemName.includes('lights') || itemName.includes('plugs'))) shouldLink = true;
        if (title.includes('wall tiling') && itemName.includes('wall')) shouldLink = true;
        if (title.includes('cupboards') && itemName.includes('cupboard')) shouldLink = true;
        if (title.includes('doors') && itemName.includes('door')) shouldLink = true;
      }
    } else if (title.includes('guest bathroom')) {
      if (roomName.includes('guest bathroom')) {
        if (title.includes('demolition') && itemName.includes('breaking')) shouldLink = true;
        if (title.includes('plumbing') && (itemName.includes('plumbing') || itemName.includes('shower') || itemName.includes('basin') || itemName.includes('toilet') || itemName.includes('bidet'))) shouldLink = true;
        if (title.includes('electrical') && (itemName.includes('electrical') || itemName.includes('lights') || itemName.includes('heater'))) shouldLink = true;
        if (title.includes('wall tiling') && itemName.includes('wall')) shouldLink = true;
        if (title.includes('floor tiling') && itemName.includes('floor')) shouldLink = true;
      }
    } else if (title.includes('guest bedroom')) {
      if (roomName.includes('other bedroom')) {
        if (title.includes('electrical') && (itemName.includes('lights') || itemName.includes('plugs'))) shouldLink = true;
        if (title.includes('tiling') && itemName.includes('wall')) shouldLink = true;
        if (title.includes('cupboards') && itemName.includes('cupboard')) shouldLink = true;
        if (title.includes('doors') && itemName.includes('door')) shouldLink = true;
      }
    } else if (title.includes('kitchen')) {
      if (roomName.includes('kitchen')) {
        if (title.includes('demolition') && itemName.includes('breaking')) shouldLink = true;
        if (title.includes('plumbing') && (itemName.includes('plumbing') || itemName.includes('sink'))) shouldLink = true;
        if (title.includes('electrical') && (itemName.includes('electrical') || itemName.includes('lights') || itemName.includes('points'))) shouldLink = true;
        if (title.includes('wall tiling') && itemName.includes('wall')) shouldLink = true;
        if (title.includes('cabinet') && (itemName.includes('cabinet') || itemName.includes('counter') || itemName.includes('granite'))) shouldLink = true;
      }
    } else if (title.includes('bathroom fixtures')) {
      if ((roomName.includes('bathroom')) && (itemName.includes('toilet') || itemName.includes('basin') || itemName.includes('shower') || itemName.includes('bidet') || itemName.includes('mirror') || itemName.includes('cabinet'))) {
        shouldLink = true;
      }
    } else if (title.includes('whole house - floor')) {
      if (itemName.includes('floor tiling') && roomName.includes('whole house')) {
        shouldLink = true;
      }
    } else if (title.includes('painting')) {
      if (itemName.includes('paint')) shouldLink = true;
    } else if (title.includes('final installations')) {
      if (itemName.includes('blind')) shouldLink = true;
    } else if (title.includes('balcony')) {
      if (roomName.includes('balcony')) shouldLink = true;
    } else if (title.includes('living room')) {
      if (roomName.includes('living')) shouldLink = true;
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
console.log('Detailed renovation plan completed!');
console.log('=================================');
console.log(`Total timeline entries: ${timelineEntries.length}`);
console.log('Coverage: Oct 1 - Nov 30, 2025 (61 days)');
console.log('Each entry includes detailed action plans');
console.log('=================================\n');

db.close();