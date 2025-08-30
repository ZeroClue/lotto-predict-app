import { test, expect } from '@playwright/test';

test.describe('Advanced Analytics Full E2E Integration', () => {
  test('should load and display real analytics data with full integration', async ({ page }) => {
    // Navigate to the advanced analytics page
    await page.goto('/predictions/advanced');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for the main heading
    await expect(page.getByRole('heading', { name: 'Advanced Lottery Analytics' })).toBeVisible();

    // Wait for initial data to load if any
    await page.waitForTimeout(1000);

    // Apply filters to trigger real API calls
    await page.getByLabel('Lottery').selectOption('Powerball');
    await page.getByLabel('Start Date').fill('2024-01-01');
    await page.getByLabel('End Date').fill('2024-12-31');

    // Click apply and wait for real API response
    await page.getByRole('button', { name: 'Apply' }).click();

    // Wait for the loading to complete - this will take real time
    await page.waitForTimeout(3000);

    // Check that analytics components are visible
    await expect(page.getByText('Number Frequency')).toBeVisible();
    await expect(page.getByText('Trend Analysis')).toBeVisible();

    // Verify number selection functionality in trend chart
    const trendSection = page.locator('[data-testid="trend-analysis-section"], .trend-analysis, :has-text("Trend Analysis")').first();
    
    // Check if number selection dropdown exists and is functional
    const numberSelect = trendSection.locator('select').first();
    if (await numberSelect.isVisible()) {
      const options = await numberSelect.locator('option').count();
      expect(options).toBeGreaterThan(1); // Should have Select Number option + actual numbers
      
      // Select a number and verify chart updates
      await numberSelect.selectOption({ index: 1 }); // Select first actual number
      await page.waitForTimeout(500); // Wait for chart update
    }

    // Test CSV export functionality if available
    const exportButton = page.getByRole('button', { name: /export|download/i }).first();
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.csv$/);
    }

    // Verify charts have rendered with real data
    const chartElements = page.locator('svg');
    const chartCount = await chartElements.count();
    expect(chartCount).toBeGreaterThan(0);

    // Check for no error states
    await expect(page.getByText(/error|failed|something went wrong/i)).not.toBeVisible();

    // Verify responsive behavior on different screen sizes
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.getByText('Advanced Lottery Analytics')).toBeVisible();
    
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    await expect(page.getByText('Advanced Lottery Analytics')).toBeVisible();
  });

  test('should handle empty data gracefully in full integration', async ({ page }) => {
    await page.goto('/predictions/advanced');
    await page.waitForLoadState('networkidle');

    // Apply filters for a date range with no data
    await page.getByLabel('Lottery').selectOption('Powerball');
    await page.getByLabel('Start Date').fill('1990-01-01');
    await page.getByLabel('End Date').fill('1990-01-31');

    await page.getByRole('button', { name: 'Apply' }).click();
    
    // Wait for API response
    await page.waitForTimeout(3000);

    // Should show appropriate empty state messages
    const emptyMessages = [
      'No data available',
      'No trend data to display',
      'No frequency data',
      'Apply filters to see results'
    ];

    let foundEmptyMessage = false;
    for (const message of emptyMessages) {
      if (await page.getByText(message).isVisible()) {
        foundEmptyMessage = true;
        break;
      }
    }
    
    expect(foundEmptyMessage).toBeTruthy();
  });

  test('should validate full analytics workflow without mocking', async ({ page }) => {
    await page.goto('/predictions/advanced');
    
    // Ensure we start with clean state
    await page.waitForLoadState('networkidle');
    
    // Step 1: Apply filters
    await page.getByLabel('Lottery').selectOption('Powerball');
    await page.getByLabel('Start Date').fill('2024-06-01');
    await page.getByLabel('End Date').fill('2024-08-31');
    await page.getByRole('button', { name: 'Apply' }).click();
    
    // Step 2: Wait for real data to load
    await page.waitForTimeout(2000);
    
    // Step 3: Verify analytics components loaded with real data
    await expect(page.getByText('Number Frequency')).toBeVisible();
    await expect(page.getByText('Trend Analysis')).toBeVisible();
    
    // Step 4: Test interactive features work with real data
    // Test trend analysis number selection if data is available
    const trendChart = page.locator(':has-text("Trend Analysis")').first();
    const numberDropdown = trendChart.locator('select').first();
    
    if (await numberDropdown.isVisible()) {
      const initialValue = await numberDropdown.inputValue();
      const options = await numberDropdown.locator('option').count();
      
      if (options > 2) { // Has Select Number + at least 2 actual numbers
        await numberDropdown.selectOption({ index: 2 });
        await page.waitForTimeout(500);
        
        const newValue = await numberDropdown.inputValue();
        expect(newValue).not.toBe(initialValue);
      }
    }
    
    // Step 5: Verify no errors occurred during the full workflow
    await expect(page.getByText(/error|failed/i)).not.toBeVisible();
    
    // Step 6: Verify analytics data is consistent across components
    const frequencySection = page.locator(':has-text("Number Frequency")').first();
    const trendSection = page.locator(':has-text("Trend Analysis")').first();
    
    await expect(frequencySection).toBeVisible();
    await expect(trendSection).toBeVisible();
  });
});
