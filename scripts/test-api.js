const fetch = require('node-fetch');

async function testAPI() {
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
  console.log('Login successful, got session cookie');
  
  // Test various API endpoints
  const endpoints = [
    '/api/projects/1',
    '/api/projects/1/rooms',
    '/api/projects/1/vendors',
    '/api/projects/1/timeline',
    '/api/projects/1/budget-items',
    '/api/projects/1/summary'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n2. Testing ${endpoint}...`);
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: {
        'Cookie': setCookie
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        console.log(`   ✓ Success: ${data.length} items`);
      } else {
        console.log(`   ✓ Success:`, Object.keys(data).slice(0, 5).join(', '), '...');
      }
    } else {
      console.log(`   ✗ Failed: ${response.status} ${response.statusText}`);
      console.log(`   Response:`, await response.text());
    }
  }
}

testAPI().catch(console.error);