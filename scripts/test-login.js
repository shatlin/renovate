const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

async function testLogin() {
  const dbPath = path.join(__dirname, '..', 'renovation-budget.db');
  const db = new Database(dbPath);
  
  const email = 'shatlin@gmail.com';
  const password = 'Renovate2024';
  
  try {
    // Get user from database
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', { email: user.email, name: user.name });
    
    // Validate password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (isValid) {
      console.log('✅ Password is correct - Login successful!');
    } else {
      console.log('❌ Invalid password');
    }
    
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    db.close();
  }
}

testLogin().catch(console.error);