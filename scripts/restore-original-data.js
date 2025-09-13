const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'renovation-budget.db'));

console.log('Restoring original budget data for shatlin@gmail.com...');

// Begin transaction
const restore = db.transaction(() => {
  // Clear existing budget data
  db.exec('DELETE FROM budget_details');
  db.exec('DELETE FROM budget_items');
  
  // Define the original budget items with categories
  const budgetItems = [
    // Kitchen Items
    { room_id: 1, category_id: 1, name: 'Kitchen Tiles & Materials', description: 'All tiles, cement, and installation materials for kitchen' },
    { room_id: 1, category_id: 2, name: 'Kitchen Labor', description: 'Tiling, plumbing, and electrical work' },
    { room_id: 1, category_id: 4, name: 'Kitchen Appliances', description: 'Stove, refrigerator, dishwasher, microwave' },
    { room_id: 1, category_id: 5, name: 'Kitchen Cabinets & Storage', description: 'Upper and lower cabinets, pantry storage' },
    { room_id: 1, category_id: 3, name: 'Kitchen Lighting & Fixtures', description: 'Pendant lights, under-cabinet lighting, faucets' },
    
    // Master Bathroom Items
    { room_id: 2, category_id: 1, name: 'Master Bath Tiles & Materials', description: 'Floor and wall tiles, waterproofing' },
    { room_id: 2, category_id: 2, name: 'Master Bath Labor', description: 'Complete bathroom renovation labor' },
    { room_id: 2, category_id: 3, name: 'Master Bath Fixtures', description: 'Toilet, basin, shower fixtures, taps' },
    { room_id: 2, category_id: 9, name: 'Master Bath Plumbing', description: 'All plumbing work and pipes' },
    { room_id: 2, category_id: 11, name: 'Shower Door & Windows', description: 'Glass shower enclosure and window' },
    
    // Guest Bathroom Items
    { room_id: 3, category_id: 1, name: 'Guest Bath Materials', description: 'Basic tiles and materials' },
    { room_id: 3, category_id: 2, name: 'Guest Bath Labor', description: 'Installation and renovation work' },
    { room_id: 3, category_id: 3, name: 'Guest Bath Fixtures', description: 'Basic toilet, basin, shower' },
    
    // Living Areas
    { room_id: 4, category_id: 10, name: 'Living Room Flooring', description: 'Laminate or vinyl flooring for living room' },
    { room_id: 4, category_id: 5, name: 'Living Room Built-ins', description: 'TV unit and display shelving' },
    { room_id: 4, category_id: 3, name: 'Living Room Lighting', description: 'Ceiling lights and ambient lighting' },
    
    // Bedrooms
    { room_id: 5, category_id: 10, name: 'Bedroom Flooring', description: 'Flooring for all bedrooms' },
    { room_id: 5, category_id: 5, name: 'Bedroom Wardrobes', description: 'Built-in wardrobes for bedrooms' },
    { room_id: 5, category_id: 11, name: 'Bedroom Doors', description: 'Interior doors for bedrooms' },
    
    // General/Whole House
    { room_id: null, category_id: 7, name: 'Design & Planning', description: 'Architect and interior design fees' },
    { room_id: null, category_id: 8, name: 'Electrical Work', description: 'Complete house rewiring and DB board' },
    { room_id: null, category_id: 1, name: 'Paint & Finishing', description: 'Interior and exterior painting' },
    { room_id: null, category_id: 6, name: 'Permits & Approvals', description: 'Building permits and council approvals' },
    { room_id: null, category_id: 13, name: 'Contingency', description: 'Buffer for unexpected expenses' }
  ];

  // Insert master budget items
  const insertMaster = db.prepare(`
    INSERT INTO budget_items (
      project_id, room_id, category_id, name, description, 
      is_master, status, display_order
    ) VALUES (?, ?, ?, ?, ?, 1, 'pending', ?)
  `);

  budgetItems.forEach((item, index) => {
    insertMaster.run(
      1, // project_id
      item.room_id,
      item.category_id,
      item.name,
      item.description,
      index + 1
    );
  });

  // Get inserted master IDs
  const masters = db.prepare('SELECT id, name FROM budget_items ORDER BY id').all();
  console.log(`Created ${masters.length} master budget items`);

  // Now add detailed breakdown for key items
  const insertDetail = db.prepare(`
    INSERT INTO budget_details (
      budget_item_id, detail_type, name, description, 
      quantity, unit_price, total_amount, vendor, display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Kitchen Tiles & Materials (typically first item)
  const kitchenTilesMaster = masters.find(m => m.name.includes('Kitchen Tiles')).id;
  insertDetail.run(kitchenTilesMaster, 'material', 'Floor Tiles 60x60', 'Premium porcelain floor tiles', 35, 120, 4200, 'CTM Tiles', 1);
  insertDetail.run(kitchenTilesMaster, 'material', 'Wall Tiles', 'Subway tiles for backsplash', 25, 80, 2000, 'CTM Tiles', 2);
  insertDetail.run(kitchenTilesMaster, 'material', 'Tile Adhesive & Grout', 'Premium adhesive and grout', 15, 65, 975, 'Builders Warehouse', 3);
  insertDetail.run(kitchenTilesMaster, 'material', 'Waterproofing', 'Waterproofing membrane', 5, 180, 900, 'Builders Warehouse', 4);

  // Kitchen Labor
  const kitchenLaborMaster = masters.find(m => m.name.includes('Kitchen Labor')).id;
  insertDetail.run(kitchenLaborMaster, 'labour', 'Tiling Installation', 'Professional tiling service', 1, 8500, 8500, 'Pro Tilers', 1);
  insertDetail.run(kitchenLaborMaster, 'labour', 'Plumbing Work', 'Kitchen plumbing installation', 1, 3500, 3500, 'Reliable Plumbers', 2);
  insertDetail.run(kitchenLaborMaster, 'labour', 'Electrical Work', 'Kitchen electrical points', 1, 2800, 2800, 'Spark Electricians', 3);

  // Kitchen Appliances
  const kitchenAppliancesMaster = masters.find(m => m.name.includes('Kitchen Appliances')).id;
  insertDetail.run(kitchenAppliancesMaster, 'new_item', 'Gas Stove & Oven', 'Bosch 4-burner gas stove with oven', 1, 12000, 12000, 'Hirschs', 1);
  insertDetail.run(kitchenAppliancesMaster, 'new_item', 'Refrigerator', 'Samsung double door fridge', 1, 18000, 18000, 'Hirschs', 2);
  insertDetail.run(kitchenAppliancesMaster, 'new_item', 'Dishwasher', 'Bosch dishwasher', 1, 8500, 8500, 'Hirschs', 3);
  insertDetail.run(kitchenAppliancesMaster, 'new_item', 'Microwave', 'Samsung microwave oven', 1, 3500, 3500, 'Makro', 4);
  insertDetail.run(kitchenAppliancesMaster, 'service', 'Installation', 'Appliance installation service', 1, 1500, 1500, 'Hirschs', 5);

  // Kitchen Cabinets
  const kitchenCabinetsMaster = masters.find(m => m.name.includes('Kitchen Cabinets')).id;
  insertDetail.run(kitchenCabinetsMaster, 'material', 'Upper Cabinets', 'Wall-mounted kitchen cabinets', 8, 2200, 17600, 'Kitchen Kraft', 1);
  insertDetail.run(kitchenCabinetsMaster, 'material', 'Base Cabinets', 'Floor standing cabinets with drawers', 10, 2800, 28000, 'Kitchen Kraft', 2);
  insertDetail.run(kitchenCabinetsMaster, 'material', 'Pantry Unit', 'Tall pantry storage unit', 1, 8500, 8500, 'Kitchen Kraft', 3);
  insertDetail.run(kitchenCabinetsMaster, 'material', 'Countertop', 'Caesarstone quartz countertop', 12, 1200, 14400, 'Caesarstone SA', 4);
  insertDetail.run(kitchenCabinetsMaster, 'labour', 'Installation', 'Cabinet installation and fitting', 1, 6500, 6500, 'Kitchen Kraft', 5);

  // Master Bathroom Tiles
  const masterBathTilesMaster = masters.find(m => m.name.includes('Master Bath Tiles')).id;
  insertDetail.run(masterBathTilesMaster, 'material', 'Floor Tiles', 'Anti-slip bathroom floor tiles', 15, 150, 2250, 'CTM Tiles', 1);
  insertDetail.run(masterBathTilesMaster, 'material', 'Wall Tiles', 'Large format wall tiles', 40, 120, 4800, 'CTM Tiles', 2);
  insertDetail.run(masterBathTilesMaster, 'material', 'Mosaic Feature', 'Feature wall mosaic tiles', 5, 350, 1750, 'Tile Africa', 3);
  insertDetail.run(masterBathTilesMaster, 'material', 'Waterproofing', 'Complete waterproofing system', 1, 2200, 2200, 'Builders Warehouse', 4);

  // Master Bath Fixtures
  const masterBathFixturesMaster = masters.find(m => m.name.includes('Master Bath Fixtures')).id;
  insertDetail.run(masterBathFixturesMaster, 'new_item', 'Toilet Suite', 'Wall-hung toilet with concealed cistern', 1, 6500, 6500, 'Bathroom Bizarre', 1);
  insertDetail.run(masterBathFixturesMaster, 'new_item', 'Vanity Unit', 'Double basin vanity with storage', 1, 12000, 12000, 'Bathroom Bizarre', 2);
  insertDetail.run(masterBathFixturesMaster, 'new_item', 'Shower System', 'Rain shower with hand shower', 1, 4500, 4500, 'Bathroom Bizarre', 3);
  insertDetail.run(masterBathFixturesMaster, 'new_item', 'Taps & Mixers', 'All bathroom taps and mixers', 1, 3800, 3800, 'Bathroom Bizarre', 4);
  insertDetail.run(masterBathFixturesMaster, 'new_item', 'Heated Towel Rail', 'Electric heated towel rail', 1, 2200, 2200, 'Bathroom Bizarre', 5);

  // Electrical Work
  const electricalMaster = masters.find(m => m.name.includes('Electrical Work')).id;
  insertDetail.run(electricalMaster, 'material', 'DB Board', 'New distribution board with earth leakage', 1, 8500, 8500, 'Electro Distributors', 1);
  insertDetail.run(electricalMaster, 'material', 'Wiring & Cables', 'Complete house rewiring materials', 1, 12000, 12000, 'Electro Distributors', 2);
  insertDetail.run(electricalMaster, 'material', 'Switches & Sockets', 'All light switches and plug points', 60, 85, 5100, 'Electro Distributors', 3);
  insertDetail.run(electricalMaster, 'labour', 'Installation', 'Complete electrical installation', 1, 25000, 25000, 'Certified Electricians', 4);
  insertDetail.run(electricalMaster, 'service', 'COC Certificate', 'Electrical compliance certificate', 1, 2500, 2500, 'Certified Electricians', 5);

  // Living Room Flooring
  const livingFloorMaster = masters.find(m => m.name.includes('Living Room Flooring')).id;
  insertDetail.run(livingFloorMaster, 'material', 'Laminate Flooring', 'Premium laminate flooring', 45, 220, 9900, 'Flooring Warehouse', 1);
  insertDetail.run(livingFloorMaster, 'material', 'Underlay', 'Sound dampening underlay', 45, 35, 1575, 'Flooring Warehouse', 2);
  insertDetail.run(livingFloorMaster, 'material', 'Skirting', 'Matching skirting boards', 35, 65, 2275, 'Flooring Warehouse', 3);
  insertDetail.run(livingFloorMaster, 'labour', 'Installation', 'Professional flooring installation', 1, 4500, 4500, 'Floor Specialists', 4);

  // Bedroom Wardrobes
  const bedroomWardrobeMaster = masters.find(m => m.name.includes('Bedroom Wardrobes')).id;
  insertDetail.run(bedroomWardrobeMaster, 'material', 'Master Bedroom Wardrobe', 'Built-in wardrobe with sliding doors', 1, 18000, 18000, 'Space Savers', 1);
  insertDetail.run(bedroomWardrobeMaster, 'material', 'Bedroom 2 Wardrobe', 'Standard built-in wardrobe', 1, 12000, 12000, 'Space Savers', 2);
  insertDetail.run(bedroomWardrobeMaster, 'material', 'Bedroom 3 Wardrobe', 'Standard built-in wardrobe', 1, 12000, 12000, 'Space Savers', 3);
  insertDetail.run(bedroomWardrobeMaster, 'labour', 'Installation', 'Wardrobe installation all bedrooms', 1, 4500, 4500, 'Space Savers', 4);

  // Paint & Finishing
  const paintMaster = masters.find(m => m.name.includes('Paint & Finishing')).id;
  insertDetail.run(paintMaster, 'material', 'Interior Paint', 'Premium interior paint all rooms', 25, 450, 11250, 'Dulux', 1);
  insertDetail.run(paintMaster, 'material', 'Exterior Paint', 'Weather-resistant exterior paint', 15, 550, 8250, 'Dulux', 2);
  insertDetail.run(paintMaster, 'material', 'Primer & Prep', 'Primer and preparation materials', 10, 280, 2800, 'Builders Warehouse', 3);
  insertDetail.run(paintMaster, 'labour', 'Painting Service', 'Complete house painting labor', 1, 18000, 18000, 'Pro Painters', 4);

  console.log('Budget details added successfully');
  
  // Show summary
  const summary = db.prepare(`
    SELECT COUNT(DISTINCT bi.id) as master_count, 
           COUNT(bd.id) as detail_count,
           SUM(bi.estimated_cost) as total_budget
    FROM budget_items bi
    LEFT JOIN budget_details bd ON bi.id = bd.budget_item_id
    WHERE bi.project_id = 1
  `).get();
  
  console.log(`\nRestoration Summary:`);
  console.log(`- Master budget items: ${summary.master_count}`);
  console.log(`- Detail items: ${summary.detail_count}`);
  console.log(`- Total budget: R${summary.total_budget?.toLocaleString() || 0}`);
});

// Execute restoration
try {
  restore();
  console.log('\nOriginal budget data restored successfully!');
} catch (error) {
  console.error('Restoration failed:', error);
  process.exit(1);
}

db.close();