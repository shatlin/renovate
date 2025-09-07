const baseUrl = 'http://localhost:3002';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  // Test 1: Register a new user
  console.log('1️⃣ Testing Registration...');
  const timestamp = Date.now();
  const registerData = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123'
  };
  
  const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerData)
  });
  
  if (!registerResponse.ok) {
    const error = await registerResponse.text();
    console.error('❌ Registration failed:', error);
    return;
  }
  
  const registerResult = await registerResponse.json();
  const cookies = registerResponse.headers.get('set-cookie');
  console.log('✅ Registration successful:', registerResult);
  console.log('🍪 Cookie set:', cookies ? 'Yes' : 'No');
  
  // Extract session cookie
  const sessionCookie = cookies ? cookies.split(';')[0] : '';
  
  // Test 2: Access protected route with session
  console.log('\n2️⃣ Testing Protected Route Access...');
  const projectsResponse = await fetch(`${baseUrl}/api/projects`, {
    headers: { 
      'Cookie': sessionCookie
    }
  });
  
  if (!projectsResponse.ok) {
    console.error('❌ Failed to access projects:', projectsResponse.status);
    return;
  }
  
  const projects = await projectsResponse.json();
  console.log('✅ Projects fetched successfully:', projects);
  
  // Test 3: Get user info
  console.log('\n3️⃣ Testing User Info Endpoint...');
  const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { 
      'Cookie': sessionCookie
    }
  });
  
  if (!meResponse.ok) {
    console.error('❌ Failed to get user info:', meResponse.status);
    return;
  }
  
  const userInfo = await meResponse.json();
  console.log('✅ User info fetched:', userInfo);
  
  // Test 4: Logout
  console.log('\n4️⃣ Testing Logout...');
  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { 
      'Cookie': sessionCookie
    }
  });
  
  if (!logoutResponse.ok) {
    console.error('❌ Logout failed:', logoutResponse.status);
    return;
  }
  
  console.log('✅ Logout successful');
  
  // Test 5: Login with credentials
  console.log('\n5️⃣ Testing Login...');
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: registerData.email,
      password: registerData.password
    })
  });
  
  if (!loginResponse.ok) {
    console.error('❌ Login failed:', loginResponse.status);
    return;
  }
  
  const loginResult = await loginResponse.json();
  console.log('✅ Login successful:', loginResult);
  
  console.log('\n✨ All tests passed! Authentication system is working correctly.');
  console.log('\n📝 Test Credentials:');
  console.log(`   Email: ${registerData.email}`);
  console.log(`   Password: ${registerData.password}`);
  console.log('\nYou can now login at http://localhost:3002/auth/login');
}

testAuthFlow().catch(console.error);