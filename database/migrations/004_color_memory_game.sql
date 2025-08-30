-- Migration: Add Color Memory Challenge game for Story 2.2
-- Story: 2.2 Additional In-App Game
-- Date: 2025-08-30

-- Remove old Color Match Challenge and add our new Color Memory Challenge
DELETE FROM public.games WHERE name = 'Color Match Challenge';

-- Insert the Color Memory Challenge game
INSERT INTO public.games (name, description, reward_amount, nft_award_threshold, image_url) VALUES
    ('Color Memory Challenge', 'Remember and repeat the color sequence to earn crypto rewards! Progressive difficulty increases with each round.', 12.0, 4, null)
ON CONFLICT (name) DO NOTHING;