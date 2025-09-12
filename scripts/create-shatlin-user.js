const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

async function createUser() {
  const dbPath = path.join(__dirname, '..', 'renovation-budget.db');
  const db = new Database(dbPath);
  
  const email = 'shatlin@gmail.com';
  const password = 'Renovate2024';
  const name = 'Shatlin';
  
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert user
    const stmt = db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    );
    
    const result = stmt.run(email, passwordHash, name);
    console.log('User created successfully with ID:', result.lastInsertRowid);
    
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('User already exists, updating password...');
      
      // Update existing user's password
      const passwordHash = await bcrypt.hash(password, 10);
      const updateStmt = db.prepare(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?'
      );
      updateStmt.run(passwordHash, email);
      console.log('Password updated successfully');
    } else {
      console.error('Error creating user:', error);
    }
  } finally {
    db.close();
  }
}

createUser().catch(console.error);