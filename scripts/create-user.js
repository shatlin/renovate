const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(process.cwd(), 'renovation-budget.db'));

// Create user with specified email
const email = 'shatlin@gmail.com';
const password = 'Renovate2024!';
const hashedPassword = bcrypt.hashSync(password, 10);

// Check if user already exists
const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

if (existingUser) {
  // Update existing user's password
  const updateStmt = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?');
  updateStmt.run(hashedPassword, email);
  console.log(`Password updated for user: ${email}`);
} else {
  // Create new user
  const insertStmt = db.prepare(`
    INSERT INTO users (email, password_hash, name) 
    VALUES (?, ?, ?)
  `);
  const result = insertStmt.run(email, hashedPassword, 'Shatlin');
  console.log(`User created with ID: ${result.lastInsertRowid}`);
}

console.log('\n✅ User credentials:');
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);
console.log('\nYou can now login at http://localhost:3002/auth/login');

db.close();