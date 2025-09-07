const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(process.cwd(), 'renovation-budget.db'));

// Create a test user
const hashedPassword = bcrypt.hashSync('password123', 10);
const userStmt = db.prepare(`
  INSERT INTO users (email, password_hash, name) 
  VALUES (?, ?, ?)
`);
const userResult = userStmt.run('test@example.com', hashedPassword, 'Test User');
const userId = userResult.lastInsertRowid;

console.log('Created user with ID:', userId);

// Create a test project
const projectStmt = db.prepare(`
  INSERT INTO projects (user_id, name, description, total_budget, start_date, target_end_date, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const projectResult = projectStmt.run(
  userId,
  'Home Renovation 2024',
  'Complete home renovation project',
  50000,
  '2024-01-01',
  '2024-12-31',
  'in_progress'
);
const projectId = projectResult.lastInsertRowid;

console.log('Created project with ID:', projectId);

// Create a few test rooms
const roomStmt = db.prepare(`
  INSERT INTO rooms (project_id, name, area_sqft, renovation_type, status)
  VALUES (?, ?, ?, ?, ?)
`);

const rooms = [
  { name: 'Living Room', area_sqft: 350, renovation_type: 'Full', status: 'planned' },
  { name: 'Kitchen', area_sqft: 200, renovation_type: 'Full', status: 'in_progress' },
  { name: 'Master Bedroom', area_sqft: 250, renovation_type: 'Partial', status: 'planned' },
  { name: 'Bathroom', area_sqft: 100, renovation_type: 'Full', status: 'planned' }
];

rooms.forEach(room => {
  const result = roomStmt.run(projectId, room.name, room.area_sqft, room.renovation_type, room.status);
  console.log(`Created room '${room.name}' with ID:`, result.lastInsertRowid);
});

db.close();
console.log('Database seeded successfully!');