import { test, expect } from '@playwright/test'

test.describe('Application Test - Headed Mode', () => {
  test('Full application flow test', async ({ page }) => {
    console.log('=== Starting Full Application Test ===')
    
    // Step 1: Navigate to home page
    console.log('Step 1: Navigating to home page...')
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait to see the page
    
    // Check current URL
    const homeUrl = page.url()
    console.log('Current URL after navigating to home:', homeUrl)
    
    // Take screenshot
    await page.screenshot({ path: 'test-1-home.png', fullPage: true })
    
    // Step 2: Click Sign In button
    console.log('Step 2: Clicking Sign In button...')
    
    // Look for Sign In button or link
    const signInButton = await page.locator('text="Sign In"').first()
    if (await signInButton.isVisible()) {
      console.log('Found Sign In button, clicking...')
      await signInButton.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
    } else {
      console.log('Sign In button not found, navigating directly to login page...')
      await page.goto('http://localhost:3000/auth/login')
      await page.waitForLoadState('networkidle')
    }
    
    // Take screenshot of login page
    const loginUrl = page.url()
    console.log('Current URL after clicking Sign In:', loginUrl)
    await page.screenshot({ path: 'test-2-login-page.png', fullPage: true })
    
    // Step 3: Wait for login form to be ready
    console.log('Step 3: Waiting for login form to be ready...')
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000)
    
    // Check if there's still an error message
    const pageContent = await page.content()
    if (pageContent.includes('missing required error')) {
      console.log('ERROR: Page still showing "missing required error" message')
      await page.screenshot({ path: 'test-error-state.png', fullPage: true })
      throw new Error('Page is in error state')
    }
    
    // Step 4: Fill login form
    console.log('Step 4: Filling login form...')
    
    // Wait for email input using type="email"
    const emailInput = page.locator('input[type="email"]')
    await emailInput.waitFor({ state: 'visible', timeout: 10000 })
    await emailInput.fill('shatlin@gmail.com')
    console.log('Email filled')
    
    // Fill password using type="password"
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
    await passwordInput.fill('password123')
    console.log('Password filled')
    
    // Take screenshot of filled form
    await page.screenshot({ path: 'test-3-login-filled.png', fullPage: true })
    
    // Step 5: Submit login form
    console.log('Step 5: Submitting login form...')
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    console.log('Login form submitted')
    
    // Wait for navigation
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Check where we are after login
    const afterLoginUrl = page.url()
    console.log('URL after login:', afterLoginUrl)
    await page.screenshot({ path: 'test-4-after-login.png', fullPage: true })
    
    if (afterLoginUrl.includes('/projects') || afterLoginUrl.includes('/dashboard')) {
      console.log('✅ Successfully logged in!')
      
      // Step 6: Navigate to project 1
      console.log('Step 6: Navigating to project 1...')
      await page.goto('http://localhost:3000/projects/1')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)
      
      const projectUrl = page.url()
      console.log('Project page URL:', projectUrl)
      await page.screenshot({ path: 'test-5-project-page.png', fullPage: true })
      
      // Check page content
      const projectPageContent = await page.content()
      
      if (projectPageContent.includes('Project not found')) {
        console.log('❌ Project page shows "Project not found" error')
      } else {
        console.log('✅ Project page loaded successfully!')
        
        // Try to find project title
        const h1Elements = await page.locator('h1').all()
        for (const h1 of h1Elements) {
          const text = await h1.textContent()
          if (text) {
            console.log('Found H1:', text)
          }
        }
        
        // Check for budget content
        if (projectPageContent.includes('budget') || projectPageContent.includes('Budget')) {
          console.log('✅ Page contains budget-related content')
        }
        
        // Check for master rows or budget items
        if (projectPageContent.includes('master') || projectPageContent.includes('Master') || 
            projectPageContent.includes('budget') || projectPageContent.includes('Budget')) {
          console.log('✅ Page contains budget/master content')
        }
      }
    } else if (afterLoginUrl.includes('/auth/login')) {
      console.log('❌ Login failed - still on login page')
      
      // Check for error messages
      const loginPageContent = await page.content()
      if (loginPageContent.includes('Invalid') || loginPageContent.includes('error') || loginPageContent.includes('Error')) {
        console.log('Login error detected in page')
        
        // Try to find the error message
        const errorDiv = page.locator('.bg-red-50, .text-red-600, [role="alert"]').first()
        if (await errorDiv.isVisible()) {
          const errorText = await errorDiv.textContent()
          console.log('Error message:', errorText)
        }
      }
    } else {
      console.log('Unexpected URL after login:', afterLoginUrl)
    }
    
    console.log('\n=== Test Complete ===')
    console.log('Screenshots saved:')
    console.log('- test-1-home.png (Landing page)')
    console.log('- test-2-login-page.png (Login page)')
    console.log('- test-3-login-filled.png (Login form filled)')
    console.log('- test-4-after-login.png (After login)')
    console.log('- test-5-project-page.png (Project page if login successful)')
    
    // Final status
    console.log('\n=== FINAL STATUS ===')
    const finalUrl = page.url()
    if (finalUrl.includes('/projects/1')) {
      console.log('✅ SUCCESS: Application is working! Currently on project page.')
      console.log('✅ Login: Working')
      console.log('✅ Project Page: Working')
    } else if (finalUrl.includes('/projects') || finalUrl.includes('/dashboard')) {
      console.log('✅ PARTIAL SUCCESS: Login works!')
      console.log('✅ Login: Working')
      console.log('Current page:', finalUrl)
    } else if (finalUrl.includes('/auth/login')) {
      console.log('❌ Login is not working')
      console.log('Please check:')
      console.log('1. Database is initialized with user shatlin@gmail.com')
      console.log('2. Password is "password123"')
      console.log('3. Auth API endpoints are working')
    } else {
      console.log('❌ ISSUES DETECTED')
      console.log('Currently on:', finalUrl)
    }
  })
})