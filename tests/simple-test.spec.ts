import { test, expect } from '@playwright/test'

test('Simple login and navigation test', async ({ page }) => {
  console.log('=== SIMPLE TEST STARTING ===')
  
  // Go to login page directly
  console.log('1. Going to login page...')
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000) // Wait 5 seconds for page to fully load
  
  // Take screenshot
  await page.screenshot({ path: 'simple-1-login.png', fullPage: true })
  console.log('   Screenshot taken: simple-1-login.png')
  
  // Fill login form
  console.log('2. Filling login form...')
  await page.locator('input[type="email"]').fill('shatlin@gmail.com')
  await page.locator('input[type="password"]').fill('password123')
  
  // Take screenshot
  await page.screenshot({ path: 'simple-2-filled.png', fullPage: true })
  console.log('   Screenshot taken: simple-2-filled.png')
  
  // Submit form
  console.log('3. Submitting login form...')
  await page.locator('button[type="submit"]').click()
  
  // Wait for navigation
  await page.waitForTimeout(5000)
  
  // Check result
  const url = page.url()
  await page.screenshot({ path: 'simple-3-after-login.png', fullPage: true })
  console.log('   Screenshot taken: simple-3-after-login.png')
  console.log('   Current URL:', url)
  
  if (url.includes('/projects')) {
    console.log('✅ LOGIN SUCCESSFUL - Redirected to projects')
    
    // Try to go to project 1
    console.log('4. Going to project 1...')
    await page.goto('http://localhost:3000/projects/1', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)
    
    const projectUrl = page.url()
    await page.screenshot({ path: 'simple-4-project.png', fullPage: true })
    console.log('   Screenshot taken: simple-4-project.png')
    console.log('   Project URL:', projectUrl)
    
    if (projectUrl.includes('/projects/1')) {
      console.log('✅ PROJECT PAGE LOADED')
    } else {
      console.log('❌ Failed to load project page')
    }
  } else {
    console.log('❌ LOGIN FAILED - Still on:', url)
  }
  
  console.log('=== TEST COMPLETE ===')
})