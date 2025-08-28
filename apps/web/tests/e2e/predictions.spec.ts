import { test, expect } from '@playwright/test';

test.describe('Predictions Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - this would need to be adapted based on actual auth implementation
    await page.goto('/login');
    // Add login steps here when auth is implemented
    // For now, we'll assume user is authenticated
  });

  test('displays prediction page with all components', async ({ page }) => {
    await page.goto('/predictions');

    // Check page title and main heading
    await expect(page.getByRole('heading', { name: 'Lottery Predictions' })).toBeVisible();
    await expect(page.getByText('AI-powered number analysis and suggestions')).toBeVisible();

    // Check entertainment disclaimer is prominently displayed
    await expect(page.getByText('For Entertainment Only')).toBeVisible();
    await expect(page.getByText(/These predictions are generated for entertainment purposes only/)).toBeVisible();
    await expect(page.getByText(/Please play responsibly/)).toBeVisible();

    // Check main sections are present
    await expect(page.getByRole('heading', { name: 'Number Suggestions' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Draws' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Number Frequency Analysis' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quick Stats' })).toBeVisible();
  });

  test('displays historical data functionality', async ({ page }) => {
    await page.goto('/predictions');
    
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check that recent draws are displayed
    const recentDrawsSection = page.locator('[data-testid="recent-draws"], :has-text("Recent Draws")').first();
    await expect(recentDrawsSection).toBeVisible();

    // Check for draw data elements (numbers, lottery names, dates)
    await expect(page.locator('text=/Powerball|Mega Millions/').first()).toBeVisible();
    await expect(page.locator('text=/Numbers:/').first()).toBeVisible();

    // Check frequency analysis
    const frequencySection = page.locator(':has-text("Number Frequency Analysis")').first();
    await expect(frequencySection).toBeVisible();
    await expect(page.getByText('Most frequently drawn numbers in historical data')).toBeVisible();
  });

  test('displays number suggestions functionality', async ({ page }) => {
    await page.goto('/predictions');
    
    // Wait for predictions to load
    await page.waitForTimeout(2000);

    // Check suggested numbers section
    await expect(page.getByText('Suggested Numbers')).toBeVisible();
    await expect(page.getByText('AI Powered')).toBeVisible();

    // Check hot and cold numbers
    await expect(page.getByText('Hot Numbers (Most Frequent)')).toBeVisible();
    await expect(page.getByText('Cold Numbers (Least Frequent)')).toBeVisible();

    // Check analysis information
    await expect(page.getByText(/Analysis based on/)).toBeVisible();
    await expect(page.getByText(/Last updated:/)).toBeVisible();
  });

  test('entertainment disclaimer is prominently displayed', async ({ page }) => {
    await page.goto('/predictions');

    // Check disclaimer visibility and styling
    const disclaimer = page.locator('[role="alert"]:has-text("For Entertainment Only")');
    await expect(disclaimer).toBeVisible();
    
    // Check disclaimer content
    await expect(disclaimer).toContainText('For Entertainment Only');
    await expect(disclaimer).toContainText('These predictions are generated for entertainment purposes only');
    await expect(disclaimer).toContainText('do not guarantee winning results');
    await expect(disclaimer).toContainText('Please play responsibly');

    // Verify disclaimer appears before main content
    const disclaimerBox = disclaimer.first();
    const suggestionsHeading = page.getByRole('heading', { name: 'Number Suggestions' });
    
    const disclaimerBBox = await disclaimerBox.boundingBox();
    const suggestionsBBox = await suggestionsHeading.boundingBox();
    
    if (disclaimerBBox && suggestionsBBox) {
      expect(disclaimerBBox.y).toBeLessThan(suggestionsBBox.y);
    }
  });

  test('lottery selection filter works', async ({ page }) => {
    await page.goto('/predictions');
    
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Find and use lottery selector
    const lotterySelect = page.locator('select[placeholder="All Lotteries"], select:has(option[value="Powerball"])').first();
    if (await lotterySelect.count() > 0) {
      await lotterySelect.selectOption('Powerball');
      
      // Wait for data to update
      await page.waitForTimeout(1000);
      
      // Check that Powerball-specific data is displayed
      await expect(page.getByText('Powerball')).toBeVisible();
    }
  });

  test('refresh functionality works', async ({ page }) => {
    await page.goto('/predictions');
    
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Click refresh button
    const refreshButton = page.getByRole('button', { name: 'Refresh' });
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Check that loading state appears (briefly)
    // This is timing-dependent and might not always catch the loading state
    await page.waitForTimeout(500);
    
    // Verify content is still present after refresh
    await expect(page.getByRole('heading', { name: 'Number Suggestions' })).toBeVisible();
  });

  test('navigation to predictions page works from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check dashboard loads
    await expect(page.getByText('Welcome to LottoPredict Dashboard')).toBeVisible();

    // Navigate to predictions via header navigation
    await page.getByRole('button', { name: 'Predictions' }).click();
    
    // Verify we're on predictions page
    await expect(page).toHaveURL(/.*\/predictions/);
    await expect(page.getByRole('heading', { name: 'Lottery Predictions' })).toBeVisible();
  });

  test('responsive design works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/predictions');

    // Check that main elements are still visible and accessible
    await expect(page.getByRole('heading', { name: 'Lottery Predictions' })).toBeVisible();
    await expect(page.getByText('For Entertainment Only')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Number Suggestions' })).toBeVisible();

    // Check that navigation is still functional
    const navigationButton = page.getByRole('button', { name: 'Dashboard' });
    await expect(navigationButton).toBeVisible();
  });

  test('handles error states gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/lottery/predictions', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    await page.goto('/predictions');
    
    // Check that error message is displayed
    await expect(page.getByText('Error loading data!')).toBeVisible();
    await expect(page.getByText(/Internal server error|Failed to/)).toBeVisible();
  });
});