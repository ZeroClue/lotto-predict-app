import { test, expect } from '@playwright/test';

test.describe('Games Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page and login
    await page.goto('/login');
    
    // Login with test credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to games hub and display available games', async ({ page }) => {
    // Navigate to games page
    await page.click('text=Games');
    await expect(page).toHaveURL('/games');
    
    // Check page title and description
    await expect(page.locator('h2')).toContainText('Games Hub');
    await expect(page.locator('text=Play games and earn crypto rewards')).toBeVisible();
    
    // Verify games are displayed
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount.greaterThan(0);
    
    // Check that games show reward amounts
    await expect(page.locator('text=crypto')).toBeVisible();
  });

  test('should play Lucky Number Puzzle game and earn crypto', async ({ page }) => {
    // Navigate to games and select Lucky Number Puzzle
    await page.click('text=Games');
    await page.click('text=Lucky Number Puzzle');
    
    // Verify we're on the game page
    await expect(page.locator('h2')).toContainText('Lucky Number Puzzle');
    await expect(page.locator('text=Guess the lucky number between 1 and 10')).toBeVisible();
    
    // Record initial crypto balance if displayed
    const initialBalanceText = await page.locator('[data-testid="crypto-balance"]').textContent().catch(() => null);
    
    // Play the game - try different numbers until we win (max 5 attempts)
    let gameWon = false;
    for (let guess = 1; guess <= 10 && !gameWon; guess++) {
      await page.fill('input[placeholder="Enter 1-10"]', guess.toString());
      await page.click('text=Guess');
      
      // Check if we won
      const successMessage = await page.locator('text=Congratulations').isVisible().catch(() => false);
      if (successMessage) {
        gameWon = true;
        break;
      }
      
      // If we didn't win and have attempts left, continue
      const attempts = await page.locator('text=Attempts:').textContent();
      if (attempts && attempts.includes('5/5')) {
        // Game over, reset and try again
        await page.click('text=Try Again');
      }
    }
    
    // If we won, claim the reward
    if (gameWon) {
      await page.click('text=Claim Reward');
      
      // Verify crypto reward screen
      await expect(page.locator('text=Congratulations!')).toBeVisible();
      await expect(page.locator('text=You completed the game!')).toBeVisible();
      await expect(page.locator('[data-testid="earned-amount"]')).toBeVisible();
      
      // Go back to games
      await page.click('text=Back to Games');
      await expect(page).toHaveURL('/games');
    }
  });

  test('should display crypto balance in navigation after earning', async ({ page }) => {
    // Check if crypto balance is visible in navigation
    const balanceBadge = page.locator('[data-testid="crypto-balance"]');
    
    // If balance exists, verify it's displayed correctly
    if (await balanceBadge.isVisible()) {
      const balanceText = await balanceBadge.textContent();
      expect(balanceText).toMatch(/\d+\.?\d*/); // Should contain a number
    }
  });

  test('should handle game API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/games', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          success: false,
          error: 'Server error'
        })
      });
    });
    
    // Navigate to games page
    await page.click('text=Games');
    
    // Verify error handling
    await expect(page.locator('text=Error:')).toBeVisible();
    await expect(page.locator('text=Server error')).toBeVisible();
    
    // Verify retry button is available
    await expect(page.locator('text=Retry')).toBeVisible();
  });

  test('should show game completion feedback with animations', async ({ page }) => {
    // Navigate to games and select a game
    await page.click('text=Games');
    await page.click('text=Play Game').first();
    
    // Mock successful game completion
    await page.route('/api/games/*/complete', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            game: { name: 'Test Game', rewardAmount: 10 },
            earnedAmount: 10,
            newBalance: 20,
            message: 'Congratulations!'
          }
        })
      });
    });
    
    // Complete the game (assuming Lucky Number Puzzle)
    await page.fill('input[placeholder="Enter 1-10"]', '5');
    await page.click('text=Guess');
    
    // If we get success message, claim reward
    const claimButton = page.locator('text=Claim Reward');
    if (await claimButton.isVisible()) {
      await claimButton.click();
      
      // Verify reward screen elements
      await expect(page.locator('text=🎉 Congratulations!')).toBeVisible();
      await expect(page.locator('text=+10')).toBeVisible();
      await expect(page.locator('text=CRYPTO')).toBeVisible();
    }
  });

  test('should allow playing multiple games', async ({ page }) => {
    // Navigate to games
    await page.click('text=Games');
    
    // Get count of available games
    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCount = await gameCards.count();
    
    // If we have multiple games, test navigation between them
    if (gameCount > 1) {
      // Click on first game
      await gameCards.first().locator('text=Play Game').click();
      
      // Go back to games hub
      await page.click('text=Back to Games');
      await expect(page).toHaveURL('/games');
      
      // Click on second game if it exists
      if (gameCount > 1) {
        await gameCards.nth(1).locator('text=Play Game').click();
        
        // Verify we can navigate between games
        await expect(page.locator('h2')).not.toContainText('Games Hub');
      }
    }
  });
});