const Database = require('better-sqlite3');
const db = new Database('renovation.db');

// Action plans for each timeline entry
const actionPlans = [
  {
    title: 'Project Kickoff & Final Planning',
    action: `1. Morning: Team meeting with all contractors at 9 AM
2. Review and finalize renovation timeline with all stakeholders
3. Confirm all permits are in place
4. Set up temporary living arrangements in unaffected areas
5. Establish communication protocols and emergency contacts
6. Take before photos of all rooms for documentation
7. Review safety protocols and emergency procedures`
  },
  {
    title: 'Material Ordering & Permits',
    action: `1. Submit final permit applications if any pending
2. Order all tiles, fixtures, and fittings for master bathroom
3. Order materials for master bedroom renovation
4. Confirm delivery schedules with all suppliers
5. Set up secure storage area for materials
6. Review and sign contracts with remaining vendors`
  },
  {
    title: 'Site Preparation',
    action: `1. Set up dust barriers and protective coverings
2. Install temporary lighting and power solutions
3. Create designated areas for tools and equipment
4. Set up waste disposal system and bins
5. Protect flooring in hallways and common areas
6. Brief all workers on site rules and safety requirements`
  },
  {
    title: 'Material Delivery & Organization',
    action: `1. Receive and inspect all delivered materials
2. Check items against order lists for completeness
3. Report any damages or missing items immediately
4. Organize materials by room and phase
5. Secure valuable items in locked storage
6. Create inventory checklist for tracking`
  },
  {
    title: 'Master Bathroom - Demolition',
    action: `1. Turn off water supply and electrical circuits
2. Remove all fixtures, vanity, and toilet
3. Demolish existing tiles and waterproofing
4. Remove old plumbing and electrical as needed
5. Clear all debris and clean the space
6. Inspect for any structural issues or damage`
  },
  {
    title: 'Master Bathroom - Plumbing Rough-in',
    action: `1. Install new water supply lines
2. Set up drainage and waste pipes
3. Position pipes for shower, toilet, and vanity
4. Install shut-off valves for each fixture
5. Pressure test all connections
6. Get plumbing inspection if required`
  },
  {
    title: 'Master Bathroom - Electrical Work',
    action: `1. Install new electrical circuits as per plan
2. Set up GFCI outlets near water sources
3. Install wiring for vanity lighting and exhaust fan
4. Add dedicated circuit for heated towel rail if applicable
5. Set up dimmer switches where specified
6. Schedule electrical inspection`
  },
  {
    title: 'Master Bathroom - Waterproofing',
    action: `1. Clean and prepare all surfaces
2. Apply primer to walls and floor
3. Install waterproof membrane on floor
4. Apply waterproofing to shower walls (minimum 1.8m height)
5. Seal all corners and joints with waterproof tape
6. Allow proper curing time as per manufacturer specs`
  },
  {
    title: 'Master Bathroom - Wall Tiling',
    action: `1. Mark tile layout and cut tiles as needed
2. Apply tile adhesive to walls in sections
3. Install tiles starting from bottom, ensuring level
4. Use spacers for consistent grout lines
5. Clean excess adhesive immediately
6. Allow adhesive to cure for 24 hours`
  },
  {
    title: 'Master Bathroom - Floor Tiling',
    action: `1. Dry lay tiles to confirm pattern and cuts
2. Apply adhesive to floor in manageable sections
3. Lay tiles ensuring proper slope to drain
4. Check level frequently during installation
5. Clean tiles and remove spacers before grouting
6. Allow adhesive to cure completely`
  },
  {
    title: 'Master Bathroom - Grouting & Sealing',
    action: `1. Mix grout according to specifications
2. Apply grout to all tile joints, working in sections
3. Clean excess grout with damp sponge
4. Allow grout to cure for specified time
5. Apply grout sealer to prevent staining
6. Polish tiles to remove any haze`
  },
  {
    title: 'Master Bathroom - Fixture Installation',
    action: `1. Install toilet with new wax ring and bolts
2. Mount vanity and connect plumbing
3. Install shower fixtures and test for leaks
4. Mount mirrors and medicine cabinet
5. Install towel bars and accessories
6. Test all fixtures for proper operation`
  },
  {
    title: 'Master Bathroom - Final Touches',
    action: `1. Install shower door or curtain rod
2. Apply silicone sealant around fixtures
3. Touch up paint where needed
4. Install switch plates and outlet covers
5. Deep clean entire bathroom
6. Final inspection and walkthrough`
  },
  {
    title: 'Master Bedroom - Preparation',
    action: `1. Remove all furniture and belongings
2. Remove old flooring and baseboards
3. Repair any wall damage or cracks
4. Sand and prepare walls for painting
5. Clean and vacuum thoroughly
6. Protect adjacent areas from dust`
  },
  {
    title: 'Master Bedroom - Electrical Updates',
    action: `1. Add new outlets as per plan
2. Install ceiling fan wiring and bracket
3. Update light switches to dimmers
4. Add USB outlets at bedside locations
5. Install cable/internet outlets if needed
6. Test all electrical connections`
  },
  {
    title: 'Master Bedroom - Flooring Installation',
    action: `1. Level subfloor if needed
2. Install underlayment or padding
3. Begin flooring installation from longest wall
4. Ensure proper expansion gaps at walls
5. Cut and fit flooring around obstacles
6. Install transition strips at doorways`
  },
  {
    title: 'Master Bedroom - Painting',
    action: `1. Apply primer to all walls and ceiling
2. Paint ceiling first, two coats
3. Tape and protect trim and fixtures
4. Apply first coat of wall paint
5. Apply second coat after proper drying
6. Touch up and clean paint lines`
  },
  {
    title: 'Master Bedroom - Trim & Finishing',
    action: `1. Install new baseboards
2. Install door and window trim
3. Mount ceiling fan and test operation
4. Install new switch plates and outlet covers
5. Touch up paint on trim
6. Final cleaning and inspection`
  },
  {
    title: 'Guest Bathroom - Complete Renovation',
    action: `1. Day 1-2: Demolition and debris removal
2. Day 3: Plumbing rough-in and updates
3. Day 4: Electrical work and ventilation
4. Day 5: Waterproofing application
5. Day 6-7: Tiling walls and floor
6. Day 8: Grouting and sealing
7. Day 9-10: Fixture installation and finishing`
  },
  {
    title: 'Guest Bedroom - Updates',
    action: `1. Day 1: Remove furniture and prep room
2. Day 2: Electrical updates and repairs
3. Day 3-4: Flooring installation
4. Day 5: Prime and paint ceiling
5. Day 6-7: Paint walls (two coats)
6. Day 8: Install trim and baseboards
7. Day 9: Final touches and cleanup`
  },
  {
    title: 'Kitchen - Complete Transformation Phase 1',
    action: `1. Remove all appliances and clear counters
2. Demolish old cabinets and countertops
3. Remove old flooring and backsplash
4. Update plumbing for new sink location
5. Rough-in electrical for new appliances
6. Repair and prep walls for new installations`
  },
  {
    title: 'Kitchen - Complete Transformation Phase 2',
    action: `1. Install new upper cabinets
2. Install new base cabinets
3. Set up cabinet lighting and electrical
4. Install countertop and cutouts
5. Mount backsplash tiles
6. Install new sink and faucet
7. Connect and test all appliances`
  },
  {
    title: 'Balcony - Waterproofing & Renovation',
    action: `1. Remove old flooring and clean surface
2. Repair any cracks or damage
3. Apply waterproof membrane system
4. Install new drainage if needed
5. Lay new outdoor tiles or decking
6. Install new railing if required
7. Add outdoor lighting and power outlets`
  },
  {
    title: 'Living Room - Updates & Enhancement',
    action: `1. Remove old flooring and prepare subfloor
2. Install new flooring throughout
3. Update electrical outlets and switches
4. Install new ceiling fixtures
5. Paint walls and ceiling
6. Install new baseboards and trim
7. Mount TV bracket and cable management`
  },
  {
    title: 'Common Areas - Flooring',
    action: `1. Remove old flooring in hallways
2. Level and prepare subfloor
3. Install new flooring with transitions
4. Ensure seamless connection between rooms
5. Install new baseboards
6. Touch up paint where needed`
  },
  {
    title: 'Common Areas - Painting & Touch-ups',
    action: `1. Patch and repair all wall imperfections
2. Prime all walls and ceilings
3. Paint ceilings throughout
4. Paint all walls with two coats
5. Paint all doors and trim
6. Clean and polish all surfaces`
  },
  {
    title: 'Final Electrical & Plumbing',
    action: `1. Final electrical inspection
2. Test all circuits and outlets
3. Check all plumbing connections
4. Test water pressure and drainage
5. Install any remaining fixtures
6. Address any inspection issues`
  },
  {
    title: 'Deep Cleaning',
    action: `1. Clean all windows inside and out
2. Deep clean all bathrooms
3. Clean kitchen thoroughly
4. Vacuum and mop all floors
5. Wipe down all surfaces
6. Clean all light fixtures and fans`
  },
  {
    title: 'Final Inspections',
    action: `1. Conduct detailed walkthrough with contractor
2. Create punch list of remaining items
3. Test all systems and fixtures
4. Document any issues found
5. Schedule fixes for punch list items
6. Obtain completion certificates`
  },
  {
    title: 'Touch-ups & Corrections',
    action: `1. Complete all punch list items
2. Touch up paint where needed
3. Adjust doors and windows
4. Fix any grout or caulk issues
5. Tighten any loose fixtures
6. Final quality check`
  },
  {
    title: 'Move-in Preparation',
    action: `1. Final professional cleaning
2. Install air fresheners
3. Set up basic furniture
4. Stock bathrooms with essentials
5. Test all systems one final time
6. Hand over all warranties and manuals`
  },
  {
    title: 'Project Completion',
    action: `1. Final walkthrough with owner
2. Hand over all keys and remotes
3. Provide maintenance instructions
4. Submit final invoices
5. Collect feedback and testimonials
6. Celebrate successful completion!`
  }
];

// Add action plans as notes to timeline entries
console.log('Adding action plans to timeline entries...\n');

const stmt = db.prepare(`
  INSERT INTO timeline_notes (timeline_entry_id, content, author)
  VALUES (?, ?, 'System')
`);

actionPlans.forEach(plan => {
  // Find the timeline entry by title
  const entry = db.prepare('SELECT id FROM timeline_entries WHERE title = ? AND project_id = 1').get(plan.title);
  
  if (entry) {
    try {
      stmt.run(entry.id, plan.action);
      console.log(`✓ Added action plan for: ${plan.title}`);
    } catch (error) {
      console.log(`⚠ Skipping ${plan.title} - may already have notes`);
    }
  } else {
    console.log(`✗ Timeline entry not found: ${plan.title}`);
  }
});

console.log('\nAction plans added successfully!');
db.close();