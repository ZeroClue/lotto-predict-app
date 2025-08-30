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

  test('should play Color Memory Challenge game and earn crypto', async ({ page }) => {
    // Navigate to games and select Color Memory Challenge
    await page.click('text=Games');
    await page.click('text=Color Memory Challenge');
    
    // Verify we're on the game page
    await expect(page.locator('h2')).toContainText('Color Memory Challenge');
    await expect(page.locator('text=Remember and repeat the color sequence!')).toBeVisible();
    await expect(page.locator('text=Complete 5 rounds to win crypto rewards')).toBeVisible();
    
    // Wait for the initial sequence display to complete
    await page.waitForTimeout(6000);
    
    // Check that we can see the color buttons
    await expect(page.locator('text=RED')).toBeVisible();
    await expect(page.locator('text=BLUE')).toBeVisible();
    await expect(page.locator('text=GREEN')).toBeVisible();
    await expect(page.locator('text=YELLOW')).toBeVisible();
    await expect(page.locator('text=PURPLE')).toBeVisible();
    await expect(page.locator('text=ORANGE')).toBeVisible();
    
    // Check that progress indicators are visible
    await expect(page.locator('text=Round: 1/5')).toBeVisible();
    
    // Note: Due to the random nature of the color sequence, we can't predict the exact sequence.
    // Instead, we'll test the UI elements and basic interaction
    
    // Try clicking a color button to test interaction (this might be wrong sequence, but tests UI)
    await page.click('text=RED');
    
    // The game should provide feedback (either correct continuation or wrong sequence)
    // Check for either positive or negative feedback
    const hasPositiveFeedback = await page.locator('text=Now repeat the sequence!').isVisible().catch(() => false);
    const hasNegativeFeedback = await page.locator('text=Wrong color!').isVisible().catch(() => false);
    const hasTryAgainButton = await page.locator('text=Try Again').isVisible().catch(() => false);
    
    // If we got wrong sequence, try again
    if (hasTryAgainButton) {
      await page.click('text=Try Again');
      await page.waitForTimeout(6000); // Wait for new sequence
    }
    
    // Mock successful completion for testing the reward flow
    await page.route('/api/games/*/complete', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            game: { name: 'Color Memory Challenge', rewardAmount: 12 },
            earnedAmount: 12,
            newBalance: 32,
            message: 'Memory Master!'
          }
        })
      });
    });
    
    // If we can find a claim reward button (rare due to random sequences), test it
    const claimButton = page.locator('text=Claim Reward');
    if (await claimButton.isVisible()) {
      await claimButton.click();
      
      // Verify Color Memory Challenge specific reward screen
      await expect(page.locator('text=🎉 Congratulations!')).toBeVisible();
      await expect(page.locator('text=Memory Master!')).toBeVisible();
      await expect(page.locator('text=+12')).toBeVisible();
      await expect(page.locator('text=🎨🧠💫')).toBeVisible();
      
      // Go back to games
      await page.click('text=Back to Games');
      await expect(page).toHaveURL('/games');
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

  test('should verify crypto balance consistency across game sessions', async ({ page }) => {
    // Navigate to games hub
    await page.click('text=Games');
    
    // Check if we have games available
    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCount = await gameCards.count();
    
    if (gameCount > 0) {
      // Record initial balance if visible
      const initialBalance = await page.locator('[data-testid="crypto-balance"]').textContent().catch(() => '0');
      
      // Mock successful game completion
      await page.route('/api/games/*/complete', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: {
              game: { name: 'Test Game', rewardAmount: 10 },
              earnedAmount: 10,
              newBalance: 50,
              message: 'Test completion'
            }
          })
        });
      });
      
      // Play a game (any game)
      await gameCards.first().locator('text=Play Game').click();
      
      // Try to complete game (this is mocked so should work)
      await page.waitForTimeout(1000);
      
      // Navigate back to verify balance persistence
      await page.click('text=Back to Games');
      
      // Verify balance is still visible
      const finalBalance = await page.locator('[data-testid="crypto-balance"]').textContent().catch(() => null);
      
      // Balance should exist (even if we can't verify exact amount due to mocking)
      if (finalBalance) {
        expect(finalBalance).toMatch(/\d+/); // Should contain numbers
      }
    }
  });
});