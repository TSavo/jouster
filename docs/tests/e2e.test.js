// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Jouster Documentation Site', () => {
  test('Main page loads correctly', async ({ page }) => {
    await page.goto('https://tsavo.github.io/jouster/main.html');
    
    // Check title
    await expect(page).toHaveTitle(/Jouster Documentation/);
    
    // Check logo
    await expect(page.locator('.logo img')).toBeVisible();
    
    // Check search box
    await expect(page.locator('#search-input')).toBeVisible();
    
    // Check dark mode toggle
    await expect(page.locator('#dark-mode-toggle')).toBeVisible();
    
    // Check navigation
    await expect(page.locator('.nav-section')).toHaveCount(5);
  });
  
  test('Dark mode toggle works', async ({ page }) => {
    await page.goto('https://tsavo.github.io/jouster/main.html');
    
    // Check initial state (light mode)
    await expect(page.locator('body.dark-mode')).not.toBeVisible();
    
    // Toggle dark mode
    await page.locator('#dark-mode-toggle').click();
    
    // Check dark mode is enabled
    await expect(page.locator('body')).toHaveClass(/dark-mode/);
    
    // Toggle back to light mode
    await page.locator('#dark-mode-toggle').click();
    
    // Check dark mode is disabled
    await expect(page.locator('body')).not.toHaveClass(/dark-mode/);
  });
  
  test('Navigation links work', async ({ page }) => {
    await page.goto('https://tsavo.github.io/jouster/main.html');
    
    // Click on Test Runners link
    await page.locator('a:text("Test Runners")').first().click();
    
    // Check we're on the test runners page
    await expect(page).toHaveURL(/test-runners-enhanced.html/);
    await expect(page.locator('h1:text("Test Runners")')).toBeVisible();
  });
  
  test('Collapsible sections work', async ({ page }) => {
    await page.goto('https://tsavo.github.io/jouster/test-runners-enhanced.html');
    
    // Find a collapsible section
    const collapsibleHeader = page.locator('.collapsible-header').first();
    const collapsibleContent = collapsibleHeader.locator('+ .collapsible-content');
    
    // Check initial state (collapsed)
    await expect(collapsibleContent).toHaveCSS('max-height', '0px');
    
    // Expand the section
    await collapsibleHeader.click();
    
    // Check expanded state
    await expect(collapsibleHeader).toHaveClass(/active/);
    await expect(collapsibleContent).not.toHaveCSS('max-height', '0px');
    
    // Collapse the section again
    await collapsibleHeader.click();
    
    // Check collapsed state
    await expect(collapsibleHeader).not.toHaveClass(/active/);
    await expect(collapsibleContent).toHaveCSS('max-height', '0px');
  });
  
  test('Code highlighting works', async ({ page }) => {
    await page.goto('https://tsavo.github.io/jouster/test-runners-enhanced.html');
    
    // Expand a section with code
    await page.locator('.collapsible-header:text("Common Configuration")').click();
    
    // Check code block is visible
    await expect(page.locator('pre code')).toBeVisible();
    
    // Check language label is visible
    await expect(page.locator('.code-language')).toBeVisible();
    
    // Check copy button is visible
    await expect(page.locator('.copy-button')).toBeVisible();
  });
  
  test('Interactive demos work', async ({ page }) => {
    await page.goto('https://tsavo.github.io/jouster/test-runners-enhanced.html');
    
    // Expand a section with a demo
    await page.locator('.collapsible-header:text("Interactive Demo")').first().click();
    
    // Check demo container is visible
    await expect(page.locator('.demo-container')).toBeVisible();
    
    // Check run button is visible
    await expect(page.locator('.run-button')).toBeVisible();
    
    // Click run button
    await page.locator('.run-button').first().click();
    
    // Check result is displayed
    await expect(page.locator('.demo-result')).not.toHaveText('Click "Run" to see the result');
  });
  
  test('Search functionality works', async ({ page }) => {
    await page.goto('https://tsavo.github.io/jouster/main.html');
    
    // Enter search query
    await page.locator('#search-input').fill('jest');
    
    // Check search results appear
    await expect(page.locator('#search-results')).toHaveClass(/active/);
    
    // Check search results contain relevant items
    await expect(page.locator('.search-result-title:text("Jest")')).toBeVisible();
  });
  
  test('Enhanced test runner pages load correctly', async ({ page }) => {
    await page.goto('https://tsavo.github.io/jouster/test-runners/jest-enhanced.html');
    
    // Check title
    await expect(page).toHaveTitle(/Jest Test Runner/);
    
    // Check collapsible sections
    await expect(page.locator('.collapsible-header')).toHaveCount.greaterThan(0);
    
    // Check interactive demos
    await expect(page.locator('.demo-container')).toHaveCount.greaterThan(0);
  });
});
