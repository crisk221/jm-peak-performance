import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete sign-up and sign-in flow', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/.*\/sign-in/);
    
    // Go to sign-up
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/sign-up/);
    
    // Fill out sign-up form
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Submit sign-up
    await page.click('button[type="submit"]');
    
    // Should redirect to sign-in after successful sign-up
    await expect(page).toHaveURL(/.*\/sign-in/);
    
    // Sign in with the new account
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'coach@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should create, edit, and delete a client', async ({ page }) => {
    // Navigate to clients page
    await page.click('text=Clients');
    await expect(page).toHaveURL(/.*\/dashboard\/clients/);
    
    // Create new client
    await page.click('text=New Client');
    await page.fill('input[name="name"]', 'Test Client');
    await page.fill('input[name="email"]', 'testclient@example.com');
    await page.selectOption('select[name="activityLevel"]', 'moderately_active');
    await page.fill('input[name="kcalTarget"]', '2000');
    await page.fill('input[name="proteinTarget"]', '150');
    await page.fill('input[name="carbsTarget"]', '200');
    await page.fill('input[name="fatTarget"]', '67');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to client list and show success message
    await expect(page).toHaveURL(/.*\/dashboard\/clients/);
    await expect(page.locator('text=Client created successfully')).toBeVisible();
    await expect(page.locator('text=Test Client')).toBeVisible();
    
    // Edit the client
    await page.click('text=Test Client');
    await expect(page).toHaveURL(/.*\/dashboard\/clients\/[^/]+$/);
    await page.click('text=Edit');
    
    await page.fill('input[name="name"]', 'Updated Test Client');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Client updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Test Client')).toBeVisible();
    
    // Delete the client
    await page.click('text=Delete');
    await page.click('text=Delete'); // Confirm dialog
    
    await expect(page).toHaveURL(/.*\/dashboard\/clients/);
    await expect(page.locator('text=Client deleted successfully')).toBeVisible();
    await expect(page.locator('text=Updated Test Client')).not.toBeVisible();
  });
});

test.describe('Recipe Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'coach@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should create, edit, delete and export recipe PDF', async ({ page }) => {
    // Navigate to recipes page
    await page.click('text=Recipes');
    await expect(page).toHaveURL(/.*\/dashboard\/recipes/);
    
    // Create new recipe
    await page.click('text=New Recipe');
    await page.fill('input[name="title"]', 'Test Recipe');
    await page.fill('textarea[name="description"]', 'A test recipe for e2e testing');
    await page.fill('textarea[name="instructions"]', 'Mix ingredients and cook');
    await page.fill('input[name="servings"]', '4');
    await page.fill('input[name="timeMinutes"]', '30');
    
    await page.click('button[type="submit"]');
    
    // Should redirect and show success
    await expect(page).toHaveURL(/.*\/dashboard\/recipes/);
    await expect(page.locator('text=Recipe created successfully')).toBeVisible();
    
    // View the recipe
    await page.click('text=Test Recipe');
    await expect(page).toHaveURL(/.*\/dashboard\/recipes\/[^/]+$/);
    
    // Test PDF export
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export PDF');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/test-recipe.*\.pdf/);
    
    // Edit the recipe
    await page.click('text=Edit');
    await page.fill('input[name="title"]', 'Updated Test Recipe');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Recipe updated successfully')).toBeVisible();
    
    // Delete the recipe
    await page.click('text=Delete');
    await page.click('text=Delete'); // Confirm
    
    await expect(page).toHaveURL(/.*\/dashboard\/recipes/);
    await expect(page.locator('text=Recipe deleted successfully')).toBeVisible();
  });
});

test.describe('Health Check', () => {
  test('should return OK from health endpoint', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
