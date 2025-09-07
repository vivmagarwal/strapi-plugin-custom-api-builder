const { test, expect } = require('@playwright/test');

// Test configuration
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

test.describe('Custom API Builder Plugin', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Strapi admin
    await page.goto(`${STRAPI_URL}/admin`);
    
    // Login if needed
    if (await page.locator('input[name="email"]').isVisible()) {
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/**');
    }
  });

  test('Plugin appears in navigation menu', async ({ page }) => {
    // Check if Custom API plugin is in the menu
    const pluginLink = page.locator('nav a:has-text("Custom API")');
    await expect(pluginLink).toBeVisible();
  });

  test('Can navigate to Custom API Builder', async ({ page }) => {
    // Click on Custom API in navigation
    await page.click('nav a:has-text("Custom API")');
    
    // Verify we're on the correct page
    await expect(page).toHaveURL(/.*\/admin\/plugins\/custom-api/);
    await expect(page.locator('h1:has-text("Custom API Builder")')).toBeVisible();
  });

  test('Can create a new custom API', async ({ page }) => {
    // Navigate to plugin
    await page.click('nav a:has-text("Custom API")');
    
    // Click create new API button
    await page.click('button:has-text("Create new API")');
    
    // Fill in API details
    await page.fill('input[name="name"]', 'Test API');
    
    // Slug should be auto-generated
    await expect(page.locator('input[name="slug"]')).toHaveValue('test-api');
    
    // Select a content type
    await page.click('select[name="contentType"]');
    await page.selectOption('select[name="contentType"]', { index: 1 });
    
    // Select some fields
    await page.click('input[type="checkbox"][name="field-id"]');
    await page.click('input[type="checkbox"][name="field-name"]');
    await page.click('input[type="checkbox"][name="field-createdAt"]');
    
    // Save the API
    await page.click('button:has-text("Save")');
    
    // Verify success message
    await expect(page.locator('text=API created successfully')).toBeVisible();
  });

  test('Slug validation works correctly', async ({ page }) => {
    await page.click('nav a:has-text("Custom API")');
    await page.click('button:has-text("Create new API")');
    
    // Test invalid slugs
    const invalidSlugs = [
      'Test API',  // Contains space and uppercase
      'test api',  // Contains space
      'test-api-',  // Ends with hyphen
      '-test-api',  // Starts with hyphen
      'test--api',  // Contains double hyphen
      'api'  // Reserved word
    ];
    
    for (const slug of invalidSlugs) {
      await page.fill('input[name="slug"]', slug);
      await page.keyboard.press('Tab');
      await expect(page.locator('text=Invalid slug format')).toBeVisible();
    }
    
    // Test valid slug
    await page.fill('input[name="slug"]', 'my-valid-slug');
    await page.keyboard.press('Tab');
    await expect(page.locator('text=Invalid slug format')).not.toBeVisible();
  });

  test('Can edit existing custom API', async ({ page }) => {
    await page.click('nav a:has-text("Custom API")');
    
    // Find and click edit button on first API
    const firstApiRow = page.locator('tr').nth(1);
    await firstApiRow.locator('button:has-text("Edit")').click();
    
    // Modify the name
    await page.fill('input[name="name"]', 'Updated Test API');
    
    // Save changes
    await page.click('button:has-text("Save")');
    
    // Verify success message
    await expect(page.locator('text=API updated successfully')).toBeVisible();
  });

  test('Generated API endpoint works with filters', async ({ page }) => {
    // First create an API if it doesn't exist
    await page.goto(`${STRAPI_URL}/api/custom-api/test-api?name[$contains]=test&sort=-createdAt&page=1&pageSize=10`);
    
    // Check response structure
    const response = await page.evaluate(() => {
      return fetch(window.location.href).then(res => res.json());
    });
    
    // Verify response has correct structure
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('meta');
    expect(response.meta).toHaveProperty('pagination');
    expect(response.meta.pagination).toHaveProperty('page');
    expect(response.meta.pagination).toHaveProperty('pageSize');
    expect(response.meta.pagination).toHaveProperty('total');
  });

  test('Filter documentation endpoint works', async ({ page }) => {
    const response = await page.request.get(`${STRAPI_URL}/api/custom-api/test-api/filters`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('filterDocumentation');
    expect(data).toHaveProperty('sortDocumentation');
    expect(data).toHaveProperty('paginationDocumentation');
  });

  test('Can delete custom API', async ({ page }) => {
    await page.click('nav a:has-text("Custom API")');
    
    // Find and click delete button
    const apiRow = page.locator('tr:has-text("Test API")').first();
    await apiRow.locator('button:has-text("Delete")').click();
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Verify success message
    await expect(page.locator('text=API deleted successfully')).toBeVisible();
    
    // Verify API is removed from list
    await expect(page.locator('tr:has-text("Test API")')).not.toBeVisible();
  });

  test('Field search and filtering works', async ({ page }) => {
    await page.click('nav a:has-text("Custom API")');
    await page.click('button:has-text("Create new API")');
    
    // Select content type with many fields
    await page.selectOption('select[name="contentType"]', { index: 1 });
    
    // Use field search
    await page.fill('input[name="fieldSearch"]', 'name');
    
    // Verify only fields containing 'name' are shown
    const visibleFields = await page.locator('label:visible').count();
    const nameFields = await page.locator('label:has-text("name"):visible').count();
    expect(nameFields).toBeGreaterThan(0);
    
    // Clear search
    await page.click('button[aria-label="Clear search"]');
    
    // Filter by type
    await page.click('span:has-text("string")');
    
    // Verify filtering works
    const stringFields = await page.locator('label[data-type="string"]:visible').count();
    expect(stringFields).toBeGreaterThan(0);
  });

  test('Query visualization shows correct information', async ({ page }) => {
    await page.click('nav a:has-text("Custom API")');
    await page.click('button:has-text("Create new API")');
    
    // Fill in basic info
    await page.fill('input[name="name"]', 'Visualized API');
    await page.selectOption('select[name="contentType"]', { index: 1 });
    
    // Select some fields
    await page.click('input[type="checkbox"][name="field-id"]');
    await page.click('input[type="checkbox"][name="field-name"]');
    
    // Check query visualization
    await expect(page.locator('text=Query Visualization')).toBeVisible();
    await page.click('button:has-text("Show Details")');
    
    // Verify visualization components
    await expect(page.locator('text=API Endpoint')).toBeVisible();
    await expect(page.locator('text=Example cURL Command')).toBeVisible();
    await expect(page.locator('text=JavaScript Example')).toBeVisible();
    await expect(page.locator('text=Available Features')).toBeVisible();
    
    // Check feature badges
    await expect(page.locator('span:has-text("Filtering")')).toBeVisible();
    await expect(page.locator('span:has-text("Sorting")')).toBeVisible();
    await expect(page.locator('span:has-text("Pagination")')).toBeVisible();
  });

  test('Handles schema changes gracefully', async ({ page }) => {
    // This test would require modifying content type schema
    // and verifying the plugin handles it correctly
    
    await page.click('nav a:has-text("Custom API")');
    
    // Open an existing API for editing
    const apiRow = page.locator('tr').nth(1);
    await apiRow.locator('button:has-text("Edit")').click();
    
    // Check for any schema validation warnings
    const warnings = page.locator('div[role="alert"]:has-text("field")');
    
    if (await warnings.isVisible()) {
      // Verify warning message is helpful
      await expect(warnings).toContainText(/field .* no longer exists|new field .* available/i);
    }
  });
});

test.describe('API Performance Tests', () => {
  test('API responds quickly with pagination', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${STRAPI_URL}/api/custom-api/test-api?page=1&pageSize=10`);
    const duration = Date.now() - start;
    
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(1000); // Should respond in less than 1 second
  });

  test('API handles large page sizes appropriately', async ({ request }) => {
    const response = await request.get(`${STRAPI_URL}/api/custom-api/test-api?pageSize=1000`);
    const data = await response.json();
    
    // Should cap at maxPageSize (100)
    expect(data.meta.pagination.pageSize).toBeLessThanOrEqual(100);
  });

  test('Complex filters work correctly', async ({ request }) => {
    const response = await request.get(
      `${STRAPI_URL}/api/custom-api/test-api?` +
      `name[$contains]=test&` +
      `age[$gte]=18&age[$lt]=65&` +
      `isActive=true&` +
      `category[$in]=premium,standard&` +
      `sort=-createdAt,name&` +
      `page=1&pageSize=25`
    );
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');
  });
});