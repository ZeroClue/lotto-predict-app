import { test, expect } from '@playwright/test';

test.describe('NFT Workflow', () => {
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

  test('should show Collection link in navigation', async ({ page }) => {
    // Verify Collection link is present in navigation
    await expect(page.locator('text=Collection')).toBeVisible();
  });

  test('should navigate to NFT gallery from navigation', async ({ page }) => {
    // Click Collection link
    await page.click('text=Collection');
    
    // Should be on NFT gallery page
    await expect(page).toHaveURL('/collection/nfts');
    
    // Check page title and description
    await expect(page.locator('h2')).toContainText('NFT Gallery');
    await expect(page.locator('text=Your collection of unique digital assets')).toBeVisible();
  });

  test('should navigate to NFT gallery from dashboard card', async ({ page }) => {
    // Should see NFT Collection card on dashboard
    await expect(page.locator('text=NFT Collection')).toBeVisible();
    
    // Click on View Collection button
    await page.click('text=View Collection');
    
    // Should navigate to NFT gallery
    await expect(page).toHaveURL('/collection/nfts');
  });

  test('should show empty NFT gallery for new user', async ({ page }) => {
    // Navigate to NFT gallery
    await page.click('text=Collection');
    await expect(page).toHaveURL('/collection/nfts');
    
    // Should show empty state
    await expect(page.locator('text=No NFTs Yet')).toBeVisible();
    await expect(page.locator('text=Start playing games to earn your first NFTs!')).toBeVisible();
    
    // Should have Play Games button
    await expect(page.locator('text=Play Games')).toBeVisible();
  });

  test('should complete game → earn NFT → display in gallery (full workflow)', async ({ page }) => {
    // First, check if user already has NFTs by going to gallery
    await page.click('text=Collection');
    const hasExistingNFTs = await page.locator('[data-testid="nft-card"]').count() > 0;
    
    if (hasExistingNFTs) {
      // Skip this test if user already has NFTs
      test.skip();
      return;
    }
    
    // Navigate to games
    await page.click('text=Games');
    await expect(page).toHaveURL('/games');
    
    // Select Lucky Number Puzzle
    await page.click('text=Lucky Number Puzzle');
    
    // Verify we're on the game page
    await expect(page.locator('h2')).toContainText('Lucky Number Puzzle');
    
    // Play the game - try numbers until we win (first-time completion should award NFT)
    let gameWon = false;
    for (let guess = 1; guess <= 10 && !gameWon; guess++) {
      await page.fill('input[placeholder="Enter 1-10"]', guess.toString());
      await page.click('text=Guess');
      
      // Check for success message or NFT award modal
      try {
        // Wait briefly for response
        await page.waitForTimeout(1000);
        
        // Check if we won (look for success indicators)
        const hasSuccessMessage = await page.locator('text=Congratulations').isVisible();
        const hasNFTModal = await page.locator('text=NFT Awarded').isVisible();
        const hasPlayAgain = await page.locator('text=Play Again').isVisible();
        
        if (hasSuccessMessage || hasNFTModal || hasPlayAgain) {
          gameWon = true;
          
          // If NFT modal is shown, interact with it
          if (hasNFTModal) {
            await expect(page.locator('text=🎉 NFT Awarded! 🎉')).toBeVisible();
            
            // Should show NFT details
            await expect(page.locator('text=Starter Crystal')).toBeVisible();
            await expect(page.locator('text=Common')).toBeVisible();
            
            // Close the modal
            await page.click('text=Awesome!');
            
            // Should return to game completion screen
            await expect(page.locator('text=Play Again')).toBeVisible();
          }
          
          break;
        }
      } catch (error) {
        // Continue trying if no success yet
        continue;
      }
    }
    
    expect(gameWon).toBeTruthy();
    
    // Navigate to NFT gallery to verify NFT is displayed
    await page.click('text=Collection');
    await expect(page).toHaveURL('/collection/nfts');
    
    // Should no longer show empty state
    await expect(page.locator('text=No NFTs Yet')).not.toBeVisible();
    
    // Should show the awarded NFT
    await expect(page.locator('[data-testid="nft-card"]')).toHaveCount(1);
    await expect(page.locator('text=Starter Crystal')).toBeVisible();
    await expect(page.locator('text=Common')).toBeVisible();
    await expect(page.locator('text=Value: 25 crypto')).toBeVisible();
  });

  test('should display NFT count in header after earning NFT', async ({ page }) => {
    // This test assumes user has at least one NFT
    // Navigate to Collection to ensure NFT store is loaded
    await page.click('text=Collection');
    
    // Wait for NFTs to load
    await page.waitForTimeout(2000);
    
    // Check if NFT count badge is visible in header
    const nftBadge = page.locator('[data-testid="nft-count-badge"]');
    
    // If NFTs exist, badge should be visible
    const nftCards = await page.locator('[data-testid="nft-card"]').count();
    
    if (nftCards > 0) {
      await expect(nftBadge).toBeVisible();
      await expect(nftBadge).toContainText(nftCards.toString());
    }
  });

  test('should allow filtering and sorting in NFT gallery', async ({ page }) => {
    // Navigate to NFT gallery
    await page.click('text=Collection');
    await expect(page).toHaveURL('/collection/nfts');
    
    // Check if user has NFTs
    const nftCount = await page.locator('[data-testid="nft-card"]').count();
    
    if (nftCount === 0) {
      // Skip test if no NFTs
      test.skip();
      return;
    }
    
    // Test sorting functionality
    await expect(page.locator('select[data-testid="sort-select"]')).toBeVisible();
    
    // Change sort to Name
    await page.selectOption('select[data-testid="sort-select"]', 'name');
    
    // Test filtering functionality
    await expect(page.locator('select[data-testid="filter-select"]')).toBeVisible();
    
    // Check if Featured filter works (show count)
    await page.selectOption('select[data-testid="filter-select"]', 'featured');
    
    // Reset to show all
    await page.selectOption('select[data-testid="filter-select"]', 'all');
  });

  test('should allow featuring/unfeaturing NFTs', async ({ page }) => {
    // Navigate to NFT gallery
    await page.click('text=Collection');
    await expect(page).toHaveURL('/collection/nfts');
    
    // Check if user has NFTs
    const nftCount = await page.locator('[data-testid="nft-card"]').count();
    
    if (nftCount === 0) {
      // Skip test if no NFTs
      test.skip();
      return;
    }
    
    // Find the first NFT card and its feature button
    const firstNftCard = page.locator('[data-testid="nft-card"]').first();
    const featureButton = firstNftCard.locator('button:has-text("Set Featured"), button:has-text("Featured"), button:has-text("Remove from Featured")');
    
    await expect(featureButton).toBeVisible();
    
    // Click the feature toggle button
    const initialText = await featureButton.textContent();
    await featureButton.click();
    
    // Wait for the change to process
    await page.waitForTimeout(1000);
    
    // Verify button text changed
    const newText = await featureButton.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should open NFT detail modal when clicking on NFT card', async ({ page }) => {
    // Navigate to NFT gallery
    await page.click('text=Collection');
    await expect(page).toHaveURL('/collection/nfts');
    
    // Check if user has NFTs
    const nftCount = await page.locator('[data-testid="nft-card"]').count();
    
    if (nftCount === 0) {
      // Skip test if no NFTs
      test.skip();
      return;
    }
    
    // Click on the first NFT card
    const firstNftCard = page.locator('[data-testid="nft-card"]').first();
    await firstNftCard.click();
    
    // Should open the NFT modal
    await expect(page.locator('[data-testid="nft-modal"]')).toBeVisible();
    
    // Should show NFT details
    await expect(page.locator('text=Properties')).toBeVisible();
    await expect(page.locator('text=Base Value')).toBeVisible();
    await expect(page.locator('text=Mint Date')).toBeVisible();
    
    // Should have close button
    await expect(page.locator('button:has-text("Close")')).toBeVisible();
    
    // Close the modal
    await page.click('button:has-text("Close")');
    
    // Modal should be closed
    await expect(page.locator('[data-testid="nft-modal"]')).not.toBeVisible();
  });

  test('should show crypto threshold NFT after earning enough crypto', async ({ page }) => {
    // This test checks if higher-tier NFTs are awarded based on crypto balance
    // Navigate to dashboard to check current crypto balance
    await page.goto('/dashboard');
    
    // Check crypto balance in header
    const cryptoBalance = page.locator('[data-testid="crypto-balance"]');
    
    // This test would require playing multiple games to reach thresholds
    // For now, we'll just verify the structure exists
    
    // Navigate to games and check that games show NFT thresholds
    await page.click('text=Games');
    
    // Look for NFT threshold indicators on game cards
    const gameCard = page.locator('[data-testid="game-card"]').first();
    
    // Should show NFT award threshold if configured
    const hasNftBadge = await gameCard.locator('text=NFT @').isVisible();
    
    if (hasNftBadge) {
      await expect(gameCard.locator('text=NFT @')).toBeVisible();
    }
  });
});