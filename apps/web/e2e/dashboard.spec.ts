import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    
    // Wait for redirect to sign in
    await page.waitForURL('/auth/signin');
    
    // Sign in with demo credentials
    await page.fill('input[type="email"]', 'demo@celerentis.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/');
  });

  test('should display dashboard with KPI cards', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Total Projects')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('Processing')).toBeVisible();
    await expect(page.getByText('Total Spend')).toBeVisible();
  });

  test('should navigate to new project page', async ({ page }) => {
    await page.click('text=New IM');
    await expect(page).toHaveURL('/projects/new');
    await expect(page.getByText('Create New IM')).toBeVisible();
  });

  test('should search projects', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search projects...');
    await searchInput.fill('TechCorp');
    await expect(page.getByText('TechCorp Acquisition')).toBeVisible();
  });

  test('should filter projects by status', async ({ page }) => {
    await page.click('text=Complete');
    // Should show only completed projects
    await expect(page.getByText('TechCorp Acquisition')).toBeVisible();
  });

  test('should open command palette', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    await expect(page.getByText('Command Palette')).toBeVisible();
    await expect(page.getByText('Create New Project')).toBeVisible();
  });
});
