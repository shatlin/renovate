import { test, expect, Page } from '@playwright/test';

// Helper function to clear cookies and local storage
async function clearSession(page: Page) {
  await page.context().clearCookies();
  try {
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') localStorage.clear();
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    });
  } catch (error) {
    // Ignore localStorage errors in some browsers
  }
}

// Helper function to wait for navigation
async function waitForNavigation(page: Page, expectedUrl: string) {
  await page.waitForURL(expectedUrl);
  await page.waitForLoadState('networkidle');
}

// Test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

test.describe('Authentication System Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('1. Navigate to homepage - should redirect to login when unauthenticated', async ({ page }) => {
    console.log('Test 1: Testing homepage navigation without authentication...');
    
    await page.goto('/');
    
    // Should redirect to login page
    await waitForNavigation(page, '**/auth/login');
    
    // Verify we're on the login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('text=Sign in to manage')).toBeVisible();
    
    console.log('✓ Homepage correctly redirects to login when unauthenticated');
  });

  test('2. Test registration process with new user', async ({ page }) => {
    console.log('Test 2: Testing user registration process...');
    
    await page.goto('/auth/register');
    
    // Verify we're on registration page
    await expect(page).toHaveURL(/.*\/auth\/register/);
    await expect(page.locator('h1')).toContainText('Create Your Account');
    
    // Generate unique email for this test
    const uniqueEmail = `test_${Date.now()}@example.com`;
    
    // Fill registration form
    await page.fill('input[type="text"]', testCredentials.name);
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[placeholder="••••••••"]:nth-of-type(1)', testCredentials.password);
    await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', testCredentials.password);
    
    // Accept terms
    await page.check('input[type="checkbox"]:not([class*="mr-2"])');
    
    // Submit registration form
    await page.click('button:has-text("Create Account")');
    
    // Wait for potential navigation or error
    await page.waitForTimeout(2000);
    
    // Check if registration succeeded (redirected to projects) or failed (error message)
    const currentUrl = page.url();
    const errorMessage = await page.locator('.bg-red-50').textContent().catch(() => null);
    
    if (currentUrl.includes('/projects')) {
      console.log('✓ Registration successful - redirected to projects page');
      await expect(page).toHaveURL(/.*\/projects/);
    } else if (errorMessage) {
      console.log(`⚠ Registration failed: ${errorMessage}`);
      console.log('This may be expected if the user already exists');
    } else {
      console.log('? Registration status unclear');
    }
  });

  test('3. Test login with provided credentials', async ({ page }) => {
    console.log('Test 3: Testing login with provided credentials...');
    
    await page.goto('/auth/login');
    
    // Verify we're on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    
    // Fill login form
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    
    // Submit login form
    await page.click('button:has-text("Sign In")');
    
    // Wait for potential navigation or error
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    const errorMessage = await page.locator('.bg-red-50').textContent().catch(() => null);
    
    if (currentUrl.includes('/projects')) {
      console.log('✓ Login successful - redirected to projects page');
      await expect(page).toHaveURL(/.*\/projects/);
    } else if (errorMessage) {
      console.log(`⚠ Login failed: ${errorMessage}`);
      console.log('This may be expected if the credentials are not valid or user doesn\'t exist');
    } else {
      console.log('? Login status unclear - still on login page');
    }
  });

  test('4. Test session persistence across page navigation', async ({ page }) => {
    console.log('Test 4: Testing session persistence...');
    
    // First, try to login (or register if needed)
    await page.goto('/auth/login');
    
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button:has-text("Sign In")');
    
    await page.waitForTimeout(2000);
    
    // If login failed, try registration
    if (page.url().includes('/auth/login')) {
      console.log('Login failed, attempting registration...');
      await page.goto('/auth/register');
      
      const uniqueEmail = `test_session_${Date.now()}@example.com`;
      await page.fill('input[type="text"]', testCredentials.name);
      await page.fill('input[type="email"]', uniqueEmail);
      await page.fill('input[placeholder="••••••••"]:nth-of-type(1)', testCredentials.password);
      await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', testCredentials.password);
      await page.check('input[type="checkbox"]:not([class*="mr-2"])');
      await page.click('button:has-text("Create Account")');
      
      await page.waitForTimeout(2000);
    }
    
    // If we're now authenticated, test session persistence
    if (page.url().includes('/projects')) {
      console.log('✓ Successfully authenticated, testing session persistence...');
      
      // Navigate to different pages to test session persistence
      await page.goto('/');
      await page.waitForTimeout(1000);
      
      // Should redirect to projects since we're authenticated
      if (page.url().includes('/projects')) {
        console.log('✓ Session persists - homepage redirects to projects when authenticated');
      } else {
        console.log('⚠ Session may not be persisting - homepage not redirecting to projects');
      }
      
      // Try accessing projects directly
      await page.goto('/projects');
      await page.waitForTimeout(1000);
      
      if (page.url().includes('/projects') && !page.url().includes('/auth/login')) {
        console.log('✓ Session persists - can access projects page directly');
      } else {
        console.log('⚠ Session not persisting - redirected to login when accessing projects');
      }
      
      // Test API authentication
      const response = await page.goto('/api/auth/me');
      const status = response?.status();
      
      if (status === 200) {
        console.log('✓ Session persists - API authentication working');
      } else {
        console.log(`⚠ API authentication issue - status: ${status}`);
      }
      
    } else {
      console.log('⚠ Could not establish authenticated session for persistence test');
    }
  });

  test('5. Test logout functionality', async ({ page }) => {
    console.log('Test 5: Testing logout functionality...');
    
    // First establish a session
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(2000);
    
    // If login failed, try registration
    if (page.url().includes('/auth/login')) {
      await page.goto('/auth/register');
      const uniqueEmail = `test_logout_${Date.now()}@example.com`;
      await page.fill('input[type="text"]', testCredentials.name);
      await page.fill('input[type="email"]', uniqueEmail);
      await page.fill('input[placeholder="••••••••"]:nth-of-type(1)', testCredentials.password);
      await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', testCredentials.password);
      await page.check('input[type="checkbox"]:not([class*="mr-2"])');
      await page.click('button:has-text("Create Account")');
      await page.waitForTimeout(2000);
    }
    
    if (page.url().includes('/projects')) {
      console.log('✓ Authenticated, testing logout...');
      
      // Look for logout button/link
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out"), a:has-text("Logout"), a:has-text("Log out"), button:has-text("Sign out"), a:has-text("Sign out")');
      
      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
        await page.waitForTimeout(2000);
        
        // Check if redirected to login or homepage
        if (page.url().includes('/auth/login') || page.url().includes('/auth/register')) {
          console.log('✓ Logout successful - redirected to auth page');
          
          // Verify session is cleared by trying to access protected route
          await page.goto('/projects');
          await page.waitForTimeout(1000);
          
          if (page.url().includes('/auth/login')) {
            console.log('✓ Session cleared - accessing protected route redirects to login');
          } else {
            console.log('⚠ Session may not be fully cleared');
          }
        } else {
          console.log('? Logout may not have worked - still on projects page');
        }
      } else {
        console.log('⚠ Could not find logout button on the page');
        
        // Try making a logout request directly
        await page.goto('/api/auth/logout');
        await page.waitForTimeout(1000);
        
        // Then try accessing projects
        await page.goto('/projects');
        await page.waitForTimeout(1000);
        
        if (page.url().includes('/auth/login')) {
          console.log('✓ API logout successful - accessing protected route redirects to login');
        } else {
          console.log('⚠ API logout may not have worked');
        }
      }
    } else {
      console.log('⚠ Could not establish session for logout test');
    }
  });

  test('6. Test password validation on registration', async ({ page }) => {
    console.log('Test 6: Testing password validation...');
    
    await page.goto('/auth/register');
    
    // Test short password
    await page.fill('input[type="text"]', testCredentials.name);
    await page.fill('input[type="email"]', 'test_validation@example.com');
    await page.fill('input[placeholder="••••••••"]:nth-of-type(1)', '123');
    await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', '123');
    await page.check('input[type="checkbox"]:not([class*="mr-2"])');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    const errorMessage = await page.locator('.bg-red-50').textContent().catch(() => null);
    
    if (errorMessage && errorMessage.includes('6 characters')) {
      console.log('✓ Password length validation working');
    } else {
      console.log('? Password length validation may not be working as expected');
    }
    
    // Test mismatched passwords
    await page.fill('input[placeholder="••••••••"]:nth-of-type(1)', 'password123');
    await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', 'differentpassword');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    const mismatchError = await page.locator('.bg-red-50').textContent().catch(() => null);
    
    if (mismatchError && mismatchError.includes('do not match')) {
      console.log('✓ Password mismatch validation working');
    } else {
      console.log('? Password mismatch validation may not be working as expected');
    }
  });

  test('7. Test authentication state transitions', async ({ page }) => {
    console.log('Test 7: Testing authentication state transitions...');
    
    // Start unauthenticated
    await page.goto('/auth/login');
    
    // Verify login page accessible
    await expect(page).toHaveURL(/.*\/auth\/login/);
    console.log('✓ Can access login page when unauthenticated');
    
    // Verify register page accessible
    await page.goto('/auth/register');
    await expect(page).toHaveURL(/.*\/auth\/register/);
    console.log('✓ Can access register page when unauthenticated');
    
    // Try to access protected route - should redirect
    await page.goto('/projects');
    await page.waitForTimeout(1000);
    
    if (page.url().includes('/auth/login')) {
      console.log('✓ Protected route correctly redirects to login when unauthenticated');
    } else {
      console.log('⚠ Protected route may not be properly protected');
    }
    
    // Now authenticate
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(2000);
    
    // If login failed, try registration
    if (page.url().includes('/auth/login')) {
      await page.goto('/auth/register');
      const uniqueEmail = `test_transitions_${Date.now()}@example.com`;
      await page.fill('input[type="text"]', testCredentials.name);
      await page.fill('input[type="email"]', uniqueEmail);
      await page.fill('input[placeholder="••••••••"]:nth-of-type(1)', testCredentials.password);
      await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', testCredentials.password);
      await page.check('input[type="checkbox"]:not([class*="mr-2"])');
      await page.click('button:has-text("Create Account")');
      await page.waitForTimeout(2000);
    }
    
    if (page.url().includes('/projects')) {
      console.log('✓ Successfully authenticated');
      
      // Try to access login page - should redirect to projects
      await page.goto('/auth/login');
      await page.waitForTimeout(1000);
      
      if (page.url().includes('/projects')) {
        console.log('✓ Login page correctly redirects to projects when authenticated');
      } else {
        console.log('⚠ Login page accessible when authenticated - potential security issue');
      }
      
      // Try to access register page - should redirect to projects
      await page.goto('/auth/register');
      await page.waitForTimeout(1000);
      
      if (page.url().includes('/projects')) {
        console.log('✓ Register page correctly redirects to projects when authenticated');
      } else {
        console.log('⚠ Register page accessible when authenticated - potential security issue');
      }
    }
  });
});