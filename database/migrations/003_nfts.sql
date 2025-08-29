-- Migration: Create NFTs table and seed with sample templates
-- Story: 1.4 Basic Placeholder NFT Minting & Gallery Display
-- Date: 2025-08-29

-- Create NFTs table
CREATE TABLE IF NOT EXISTS public.nfts (
    id text PRIMARY KEY, -- Blockchain token ID or unique identifier
    owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    image_url text NOT NULL,
    rarity text NOT NULL,
    mint_date timestamp with time zone DEFAULT now() NOT NULL,
    dynamic_properties jsonb, -- JSONB for flexible dynamic properties
    is_featured boolean DEFAULT FALSE NOT NULL,
    base_value numeric NOT NULL -- Intrinsic value in custom cryptocurrency
);

-- Add Row Level Security policies for NFTs table
-- Users can view their own NFTs
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own NFTs" ON public.nfts
    FOR SELECT USING (auth.uid() = owner_id);

-- Users can update their own NFTs (e.g., is_featured)
CREATE POLICY "Users can update their own NFTs" ON public.nfts
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can insert their own NFTs (for minting)
CREATE POLICY "Users can insert their own NFTs" ON public.nfts
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Create NFT templates table for minting templates
CREATE TABLE IF NOT EXISTS public.nft_templates (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    image_url text NOT NULL,
    rarity text NOT NULL,
    base_value numeric NOT NULL,
    mint_conditions jsonb -- Conditions for minting this NFT template
);

-- Seed NFT templates with sample data for minting
INSERT INTO public.nft_templates (id, name, description, image_url, rarity, base_value, mint_conditions) VALUES
    ('starter-crystal', 'Starter Crystal', 'A glowing crystal awarded for completing your first game', '/images/nfts/starter-crystal.png', 'Common', 25.0, '{"first_game_completion": true}'),
    ('lucky-coin', 'Lucky Coin', 'A shimmering coin that brings fortune to its holder', '/images/nfts/lucky-coin.png', 'Rare', 50.0, '{"crypto_threshold": 100}'),
    ('golden-trophy', 'Golden Trophy', 'The ultimate prize for dedicated players', '/images/nfts/golden-trophy.png', 'Legendary', 100.0, '{"crypto_threshold": 500}')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nfts_owner_id ON public.nfts (owner_id);
CREATE INDEX IF NOT EXISTS idx_nfts_rarity ON public.nfts (rarity);
CREATE INDEX IF NOT EXISTS idx_nfts_mint_date ON public.nfts (mint_date);
CREATE INDEX IF NOT EXISTS idx_nfts_is_featured ON public.nfts (is_featured);
CREATE INDEX IF NOT EXISTS idx_nft_templates_rarity ON public.nft_templates (rarity);

-- Add trigger to automatically update updated_at if we add that column later
-- For now, NFTs use mint_date as their timestamp