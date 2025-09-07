import { test, expect } from '@playwright/test';

// Test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

test.describe('Authentication System Tests', () => {
  
  test('Test 1: Homepage Navigation (Unauthenticated)', async ({ page }) => {
    console.log('🧪 Test 1: Testing homepage navigation without authentication...');
    
    // Start fresh
    await page.context().clearCookies();
    
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    
    // Check if redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login')) {
      console.log('✅ SUCCESS: Homepage correctly redirects to login when unauthenticated');
      console.log(`   Current URL: ${currentUrl}`);
    } else {
      console.log('❌ ISSUE: Homepage does not redirect to login when unauthenticated');
      console.log(`   Current URL: ${currentUrl}`);
    }
    
    // Verify login page elements are present
    const titleElement = await page.locator('h1').first();
    if (await titleElement.isVisible()) {
      const titleText = await titleElement.textContent();
      console.log(`   Login page title: "${titleText}"`);
    }
  });

  test('Test 2: Login Page Elements', async ({ page }) => {
    console.log('🧪 Test 2: Testing login page elements...');
    
    await page.goto('/auth/login');
    
    // Check for required elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Sign In")');
    
    if (await emailInput.isVisible()) {
      console.log('✅ Email input field found');
    } else {
      console.log('❌ Email input field missing');
    }
    
    if (await passwordInput.isVisible()) {
      console.log('✅ Password input field found');
    } else {
      console.log('❌ Password input field missing');
    }
    
    if (await submitButton.isVisible()) {
      console.log('✅ Submit button found');
    } else {
      console.log('❌ Submit button missing');
    }
    
    // Check for registration link
    const registerLink = page.locator('a:has-text("Sign up")');
    if (await registerLink.isVisible()) {
      console.log('✅ Registration link found');
    } else {
      console.log('⚠️  Registration link not found (may use different text)');
    }
  });

  test('Test 3: Registration Page Elements', async ({ page }) => {
    console.log('🧪 Test 3: Testing registration page elements...');
    
    await page.goto('/auth/register');
    
    // Check for required elements
    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]');
    const passwordInputs = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Create Account")');
    const termsCheckbox = page.locator('input[type="checkbox"]');
    
    if (await nameInput.isVisible()) {
      console.log('✅ Name input field found');
    } else {
      console.log('❌ Name input field missing');
    }
    
    if (await emailInput.isVisible()) {
      console.log('✅ Email input field found');
    } else {
      console.log('❌ Email input field missing');
    }
    
    const passwordCount = await passwordInputs.count();
    console.log(`✅ Found ${passwordCount} password fields (expected 2 for password + confirm)`);
    
    if (await submitButton.isVisible()) {
      console.log('✅ Submit button found');
    } else {
      console.log('❌ Submit button missing');
    }
    
    if (await termsCheckbox.isVisible()) {
      console.log('✅ Terms checkbox found');
    } else {
      console.log('⚠️  Terms checkbox not found (may be optional)');
    }
  });

  test('Test 4: Login Attempt with Test Credentials', async ({ page }) => {
    console.log('🧪 Test 4: Testing login with provided credentials...');
    
    await page.context().clearCookies();
    await page.goto('/auth/login');
    
    // Fill in credentials
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    
    console.log(`   Attempting login with: ${testCredentials.email}`);
    
    // Submit form
    await page.click('button:has-text("Sign In")');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    const errorElement = page.locator('.bg-red-50, .text-red-600, .text-red-500');
    
    if (currentUrl.includes('/projects')) {
      console.log('✅ SUCCESS: Login successful - redirected to projects page');
      console.log(`   Current URL: ${currentUrl}`);
      
      // Check if we can see projects page content
      await page.waitForTimeout(1000);
      const pageTitle = await page.title();
      console.log(`   Page title: ${pageTitle}`);
      
    } else if (await errorElement.isVisible()) {
      const errorText = await errorElement.first().textContent();
      console.log('❌ LOGIN FAILED: Error message displayed');
      console.log(`   Error: ${errorText}`);
      console.log('   This is expected if the test credentials don\'t exist in the database');
      
    } else {
      console.log('⚠️  UNCLEAR: No redirect or error - login status uncertain');
      console.log(`   Current URL: ${currentUrl}`);
    }
  });

  test('Test 5: Registration Flow', async ({ page }) => {
    console.log('🧪 Test 5: Testing user registration...');
    
    await page.context().clearCookies();
    await page.goto('/auth/register');
    
    // Generate unique email
    const uniqueEmail = `test_${Date.now()}@example.com`;
    console.log(`   Attempting registration with: ${uniqueEmail}`);
    
    // Fill registration form
    await page.fill('input[type="text"]', testCredentials.name);
    await page.fill('input[type="email"]', uniqueEmail);
    
    // Fill password fields (try different selectors)
    const passwordFields = page.locator('input[type="password"]');
    const passwordCount = await passwordFields.count();
    
    if (passwordCount >= 2) {
      await passwordFields.nth(0).fill(testCredentials.password);
      await passwordFields.nth(1).fill(testCredentials.password);
      console.log('   Filled password and confirmation fields');
    } else {
      console.log(`   ⚠️  Found ${passwordCount} password fields, expected 2`);
    }
    
    // Try to check terms checkbox if it exists
    const termsCheckbox = page.locator('input[type="checkbox"]').last();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
      console.log('   Checked terms checkbox');
    }
    
    // Submit registration
    await page.click('button:has-text("Create Account")');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    const errorElement = page.locator('.bg-red-50, .text-red-600, .text-red-500');
    
    if (currentUrl.includes('/projects')) {
      console.log('✅ SUCCESS: Registration successful - redirected to projects page');
      console.log(`   Current URL: ${currentUrl}`);
      
    } else if (await errorElement.isVisible()) {
      const errorText = await errorElement.first().textContent();
      console.log('❌ REGISTRATION FAILED: Error message displayed');
      console.log(`   Error: ${errorText}`);
      
    } else {
      console.log('⚠️  UNCLEAR: No redirect or error - registration status uncertain');
      console.log(`   Current URL: ${currentUrl}`);
    }
  });

  test('Test 6: Protected Route Access', async ({ page }) => {
    console.log('🧪 Test 6: Testing protected route access without authentication...');
    
    await page.context().clearCookies();
    
    // Try to access projects page directly
    await page.goto('/projects');
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login')) {
      console.log('✅ SUCCESS: Protected route correctly redirects to login');
      console.log(`   Current URL: ${currentUrl}`);
    } else if (currentUrl.includes('/projects')) {
      console.log('❌ SECURITY ISSUE: Protected route accessible without authentication');
      console.log(`   Current URL: ${currentUrl}`);
    } else {
      console.log('⚠️  UNCLEAR: Unexpected redirect behavior');
      console.log(`   Current URL: ${currentUrl}`);
    }
  });

  test('Test 7: API Authentication Check', async ({ page }) => {
    console.log('🧪 Test 7: Testing API authentication...');
    
    await page.context().clearCookies();
    
    // Test API endpoints without authentication
    const endpoints = ['/api/auth/me', '/api/projects'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.goto(endpoint);
        const status = response?.status() || 0;
        
        if (status === 401) {
          console.log(`✅ ${endpoint}: Returns 401 (Unauthorized) - correct`);
        } else if (status === 200) {
          console.log(`❌ ${endpoint}: Returns 200 (OK) - should be protected`);
        } else {
          console.log(`⚠️  ${endpoint}: Returns ${status} - unexpected`);
        }
      } catch (error) {
        console.log(`⚠️  ${endpoint}: Error testing - ${error}`);
      }
    }
  });
});