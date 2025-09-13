import { test, expect } from '@playwright/test'

test.describe('Simple Project Page Test', () => {
  test('navigate and check project page', async ({ page }) => {
    // Go directly to login page
    await page.goto('http://localhost:3000/auth/login')
    
    // Take a screenshot of login page
    await page.screenshot({ path: 'login-page.png' })
    
    // Check if we're on login page
    const loginTitle = await page.locator('h2').first().textContent()
    console.log('Login page title:', loginTitle)
    
    // Fill login form
    await page.fill('input[name="email"]', 'shatlin@gmail.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Take screenshot before submitting
    await page.screenshot({ path: 'login-filled.png' })
    
    // Submit login form
    await page.click('button[type="submit"]')
    
    // Wait a bit for response
    await page.waitForTimeout(2000)
    
    // Check where we are
    const afterLoginUrl = page.url()
    console.log('URL after login:', afterLoginUrl)
    
    // Take screenshot after login
    await page.screenshot({ path: 'after-login.png' })
    
    if (afterLoginUrl.includes('projects')) {
      console.log('Login successful, navigating to project 1')
      
      // Navigate to project 1
      await page.goto('http://localhost:3000/projects/1')
      await page.waitForLoadState('networkidle')
      
      // Take screenshot of project page
      await page.screenshot({ path: 'project-page.png', fullPage: true })
      
      // Check content
      const projectPageUrl = page.url()
      console.log('Project page URL:', projectPageUrl)
      
      const pageContent = await page.content()
      const hasProjectNotFound = pageContent.includes('Project not found')
      console.log('Has "Project not found":', hasProjectNotFound)
      
      if (!hasProjectNotFound) {
        const title = await page.locator('h1').first().textContent()
        console.log('Project title:', title)
      }
    } else {
      console.log('Login may have failed, still at:', afterLoginUrl)
      const errorMessage = await page.locator('.error, .text-red-500').first().textContent().catch(() => 'No error message found')
      console.log('Error message:', errorMessage)
    }
  })
})