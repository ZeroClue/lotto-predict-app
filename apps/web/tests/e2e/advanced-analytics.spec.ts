import { test, expect } from '@playwright/test';

test.describe('Advanced Analytics Page', () => {
  test('should load and display analytics data after applying filters', async ({ page }) => {
    // Navigate to the advanced analytics page
    await page.goto('/predictions/advanced');

    // Check for the main heading
    await expect(page.getByRole('heading', { name: 'Advanced Lottery Analytics' })).toBeVisible();

    // Interact with filters
    await page.getByLabel('Lottery').selectOption('Powerball');
    await page.getByLabel('Start Date').fill('2023-01-01');
    await page.getByLabel('End Date').fill('2023-12-31');

    // Mock the API response
    await page.route('**/api/lottery/analytics**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          frequencyAnalysis: [{ number: 10, frequency: 5, percentage: 0.1 }],
          hotColdAnalysis: { hotNumbers: [10], coldNumbers: [1], threshold: { hot: 5, cold: 1 } },
          trendAnalysis: [{ number: 10, trends: [{ period: '2023-01-01', frequency: 5, movingAverage: 5 }], overallTrend: 'stable', trendStrength: 0.5 }],
          statisticalSummary: { totalDraws: 100, dateRange: { startDate: '2023-01-01', endDate: '2023-12-31' }, avgNumbersPerDraw: 5, uniqueNumbersDrawn: 50 },
          analysisDate: new Date().toISOString(),
        }),
      });
    });

    // Click the apply button
    await page.getByRole('button', { name: 'Apply' }).click();

    // Wait for the loading spinner to disappear and charts to be visible
    await expect(page.getByText('Number Frequency')).toBeVisible();
    await expect(page.getByText('Trend Analysis for Number 10')).toBeVisible();

    // Check if the charts have rendered something (very basic check)
    // This could be improved by checking for specific chart elements
    const chart1 = await page.locator('text=Number Frequency').locator('..').locator('svg');
    await expect(chart1).toBeVisible();

    const chart2 = await page.locator('text=Trend Analysis for Number 10').locator('..').locator('svg');
    await expect(chart2).toBeVisible();
  });
});
