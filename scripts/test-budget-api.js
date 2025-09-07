const fetch = require('node-fetch');

async function testBudgetAPI() {
  const baseURL = 'http://localhost:3002';
  
  // First, login to get session
  console.log('1. Logging in...');
  const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'shatlin@gmail.com',
      password: 'Renovate2024!'
    })
  });
  
  if (!loginResponse.ok) {
    console.error('Login failed:', await loginResponse.text());
    return;
  }
  
  const setCookie = loginResponse.headers.get('set-cookie');
  console.log('Login successful\n');
  
  // Test budget items endpoint
  console.log('2. Testing /api/projects/1/budget-items...');
  const response = await fetch(`${baseURL}/api/projects/1/budget-items`, {
    headers: {
      'Cookie': setCookie
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log(`   ✓ Total items: ${data.length}`);
    
    // Show first 3 items as sample
    console.log('\n   Sample items:');
    data.slice(0, 3).forEach((item, i) => {
      console.log(`   ${i+1}. ${item.name}`);
      console.log(`      - Room: ${item.room_name || 'N/A'}`);
      console.log(`      - Category: ${item.category_name || 'N/A'}`);
      console.log(`      - Estimated: R${item.estimated_cost}`);
      console.log(`      - Status: ${item.status}`);
    });
    
    // Group by room
    const byRoom = {};
    data.forEach(item => {
      const room = item.room_name || 'Unknown';
      byRoom[room] = (byRoom[room] || 0) + 1;
    });
    
    console.log('\n   Items by room:');
    Object.entries(byRoom).forEach(([room, count]) => {
      console.log(`   - ${room}: ${count} items`);
    });
    
  } else {
    console.log(`   ✗ Failed: ${response.status} ${response.statusText}`);
    console.log(`   Response:`, await response.text());
  }
}

testBudgetAPI().catch(console.error);