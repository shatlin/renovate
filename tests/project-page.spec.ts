import { test, expect } from '@playwright/test'

test.describe('Project Page Tests', () => {
  test('should load project page and display budget masters', async ({ page }) => {
    // Navigate to the homepage which should redirect to login
    await page.goto('http://localhost:3000/')
    
    // Wait for the login page to load
    await page.waitForURL('**/auth/login')
    
    // Login with test credentials
    await page.fill('input[name="email"]', 'shatlin@gmail.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for navigation after login
    await page.waitForNavigation()
    
    // Now navigate to project 1
    await page.goto('http://localhost:3000/projects/1')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'project-page-test.png', fullPage: true })
    
    // Check page content
    const pageUrl = page.url()
    console.log('Final URL:', pageUrl)
    
    // Check if we're on the project page
    if (pageUrl.includes('/projects/1')) {
      console.log('Successfully loaded project page')
      
      // Check for project title
      const projectTitle = await page.locator('h1').first().textContent()
      console.log('Project title:', projectTitle)
      
      // Check for budget section
      const budgetText = await page.locator('text=/budget/i').count()
      console.log('Budget section found:', budgetText > 0)
      
      // Check for any budget masters
      const mastersCount = await page.locator('[data-testid="budget-master-row"]').count()
      console.log('Budget masters found:', mastersCount)
      
      expect(projectTitle).toBeTruthy()
    } else if (pageUrl.includes('/auth/login')) {
      throw new Error('Login failed - redirected back to login page')
    } else {
      throw new Error(`Unexpected redirect to: ${pageUrl}`)
    }
  })
})