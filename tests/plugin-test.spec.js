const { test, expect } = require('@playwright/test');

test.describe('Strapi Custom API Builder Plugin', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Strapi admin panel (adjust URL as needed)
    await page.goto('http://localhost:1337/admin');
    // Add authentication steps if needed
  });

  test('Plugin loads successfully', async ({ page }) => {
    // Check if the plugin is visible in the menu
    await expect(page.locator('text=Custom Api Builder')).toBeVisible();
  });

  test('Plugin navigation works', async ({ page }) => {
    // Click on the plugin menu item
    await page.click('text=Custom Api Builder');
    
    // Verify we're on the plugin page
    await expect(page.url()).toContain('/plugins/custom-api');
  });

  test('Create custom API form loads', async ({ page }) => {
    // Navigate to plugin
    await page.click('text=Custom Api Builder');
    
    // Look for the create button or form elements
    await expect(page.locator('button:has-text("Create")')).toBeVisible();
  });

  test('API endpoints are accessible', async ({ request }) => {
    // Test the custom API endpoints
    const response = await request.get('/api/custom-api/find');
    expect(response.status()).toBe(200);
  });
});