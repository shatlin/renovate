import { test, expect } from '@playwright/test';

const testCredentials = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

test.describe('Session Management Tests', () => {
  
  test('Test 8: Session Persistence and Navigation', async ({ page }) => {
    console.log('🧪 Test 8: Testing session persistence and navigation...');
    
    await page.context().clearCookies();
    
    // First establish a session by logging in
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button:has-text("Sign In")');
    
    // Wait for potential redirect
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/projects')) {
      console.log('✅ Login successful - session established');
      
      // Test 1: Navigate to homepage - should redirect to projects
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/projects')) {
        console.log('✅ SUCCESS: Homepage redirects to projects when authenticated');
      } else {
        console.log('⚠️  Homepage behavior unclear when authenticated');
        console.log(`   Current URL: ${page.url()}`);
      }
      
      // Test 2: Try to access login page - should redirect to projects
      await page.goto('/auth/login');
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/projects')) {
        console.log('✅ SUCCESS: Login page redirects to projects when authenticated');
      } else {
        console.log('❌ SECURITY ISSUE: Can access login page when authenticated');
        console.log(`   Current URL: ${page.url()}`);
      }
      
      // Test 3: Try to access register page - should redirect to projects  
      await page.goto('/auth/register');
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/projects')) {
        console.log('✅ SUCCESS: Register page redirects to projects when authenticated');
      } else {
        console.log('❌ SECURITY ISSUE: Can access register page when authenticated');
        console.log(`   Current URL: ${page.url()}`);
      }
      
      // Test 4: Check API access with session
      try {
        const response = await page.request.get('/api/auth/me');
        if (response.status() === 200) {
          console.log('✅ SUCCESS: API accessible with valid session');
          const userData = await response.json();
          console.log(`   User data: ${JSON.stringify(userData).substring(0, 100)}...`);
        } else {
          console.log(`⚠️  API returned status: ${response.status()}`);
        }
      } catch (error) {
        console.log(`⚠️  Error accessing API: ${error}`);
      }
      
      // Test 5: Navigation persistence - refresh page
      await page.goto('/projects');
      await page.reload();
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/projects') && !page.url().includes('/auth')) {
        console.log('✅ SUCCESS: Session persists after page reload');
      } else {
        console.log('❌ SESSION ISSUE: Session not persisting after reload');
        console.log(`   Current URL: ${page.url()}`);
      }
      
    } else {
      console.log('❌ Could not establish session - login failed');
      console.log(`   Current URL: ${page.url()}`);
    }
  });

  test('Test 9: Logout Functionality', async ({ page }) => {
    console.log('🧪 Test 9: Testing logout functionality...');
    
    await page.context().clearCookies();
    
    // Establish session first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/projects')) {
      console.log('✅ Session established for logout test');
      
      // Look for logout mechanism
      const logoutSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Log out")', 
        'button:has-text("Sign out")',
        'a:has-text("Logout")',
        'a:has-text("Log out")',
        'a:has-text("Sign out")',
        '[data-testid="logout"]',
        'button[title*="logout" i]',
        'button[title*="log out" i]',
        'button[title*="sign out" i]'
      ];
      
      let logoutFound = false;
      for (const selector of logoutSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible()) {
          console.log(`✅ Found logout element: ${selector}`);
          await element.first().click();
          logoutFound = true;
          break;
        }
      }
      
      if (!logoutFound) {
        console.log('⚠️  No visible logout button found - trying API logout');
        // Try direct API logout
        await page.goto('/api/auth/logout');
        await page.waitForTimeout(2000);
      }
      
      // Wait for logout process
      await page.waitForTimeout(2000);
      
      // Test if logout was successful by trying to access protected route
      await page.goto('/projects');
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/auth/login')) {
        console.log('✅ SUCCESS: Logout successful - redirected to login when accessing protected route');
        
        // Verify session is completely cleared
        try {
          const response = await page.request.get('/api/auth/me');
          if (response.status() === 401) {
            console.log('✅ SUCCESS: Session completely cleared - API returns 401');
          } else {
            console.log(`⚠️  Session may not be fully cleared - API returns ${response.status()}`);
          }
        } catch (error) {
          console.log(`⚠️  Error testing API after logout: ${error}`);
        }
        
      } else {
        console.log('❌ LOGOUT FAILED: Still can access protected routes after logout');
        console.log(`   Current URL: ${page.url()}`);
      }
      
    } else {
      console.log('❌ Could not establish session for logout test');
    }
  });

  test('Test 10: Cookie and Session Analysis', async ({ page }) => {
    console.log('🧪 Test 10: Analyzing cookies and session mechanism...');
    
    await page.context().clearCookies();
    
    // Check cookies before authentication
    let cookies = await page.context().cookies();
    console.log(`   Cookies before auth: ${cookies.length} cookies`);
    
    // Login and check cookies
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/projects')) {
      cookies = await page.context().cookies();
      console.log(`   Cookies after auth: ${cookies.length} cookies`);
      
      // Look for session-related cookies
      const sessionCookies = cookies.filter(cookie => 
        cookie.name.toLowerCase().includes('session') || 
        cookie.name.toLowerCase().includes('token') ||
        cookie.name.toLowerCase().includes('auth')
      );
      
      if (sessionCookies.length > 0) {
        console.log('✅ Session cookies found:');
        sessionCookies.forEach(cookie => {
          console.log(`   - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
          console.log(`     Domain: ${cookie.domain}, Path: ${cookie.path}, HttpOnly: ${cookie.httpOnly}, Secure: ${cookie.secure}`);
        });
      } else {
        console.log('⚠️  No obvious session cookies found');
        console.log('   All cookies:');
        cookies.forEach(cookie => {
          console.log(`   - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
        });
      }
      
      // Test if session cookies have proper security settings
      const sessionCookie = cookies.find(c => c.name === 'session');
      if (sessionCookie) {
        console.log('✅ Session cookie analysis:');
        console.log(`   HttpOnly: ${sessionCookie.httpOnly ? '✅ Yes' : '❌ No (security risk)'}`);
        console.log(`   Secure: ${sessionCookie.secure ? '✅ Yes' : '⚠️  No (ok for localhost)'}`);
        console.log(`   SameSite: ${sessionCookie.sameSite || 'Not set'}`);
      }
      
    } else {
      console.log('❌ Could not authenticate for cookie analysis');
    }
  });
});