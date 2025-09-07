const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const db = new Database('renovation.db');

// Hash password
const password = 'password123';
const hashedPassword = bcrypt.hashSync(password, 10);

// Insert test user
const stmt = db.prepare(`
  INSERT INTO users (name, email, password_hash, created_at, updated_at)
  VALUES (?, ?, ?, datetime('now'), datetime('now'))
`);

stmt.run('Test User', 'test@example.com', hashedPassword);

// Create a test project
const userStmt = db.prepare('SELECT id FROM users WHERE email = ?');
const user = userStmt.get('test@example.com');

if (user) {
  const projectStmt = db.prepare(`
    INSERT INTO projects (user_id, name, description, total_budget, start_date, target_end_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  projectStmt.run(
    user.id,
    'Home Renovation',
    'Complete home renovation project',
    50000,
    '2025-01-15',
    '2025-06-30',
    'planning'
  );
  
  console.log('Test user and project created successfully');
  console.log('Email: test@example.com');
  console.log('Password: password123');
}

db.close();