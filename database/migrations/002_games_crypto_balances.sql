-- Migration: Create games and crypto_balances tables
-- Story: 1.3 Simple In-App Game & Placeholder Crypto Earning
-- Date: 2025-08-28

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    description text,
    reward_amount numeric NOT NULL,
    nft_award_threshold integer, -- Nullable if game doesn't award NFT
    is_active boolean DEFAULT TRUE NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create crypto_balances table
CREATE TABLE IF NOT EXISTS public.crypto_balances (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    balance numeric DEFAULT 0.0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add Row Level Security policies for games table
-- Games are public data accessible to all authenticated users
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active games" ON public.games
    FOR SELECT USING (is_active = true);

-- Add Row Level Security policies for crypto_balances table
-- Users can only view and update their own crypto balance
ALTER TABLE public.crypto_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own crypto balance" ON public.crypto_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own crypto balance" ON public.crypto_balances
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crypto balance" ON public.crypto_balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed games table with sample data
INSERT INTO public.games (name, description, reward_amount, nft_award_threshold, image_url) VALUES
    ('Lucky Number Puzzle', 'Guess the lucky number between 1 and 10 to earn crypto rewards!', 10.0, 5, null),
    ('Color Match Challenge', 'Match the colors in the correct sequence to win!', 15.0, 3, null),
    ('Quick Click Quest', 'Click the targets as fast as you can to earn rewards!', 8.0, 7, null)
ON CONFLICT (name) DO NOTHING;

-- Initialize crypto balances for existing users (if any)
-- This will create a balance record for any existing users with 0 balance
INSERT INTO public.crypto_balances (user_id, balance)
SELECT id, 0.0
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.crypto_balances)
ON CONFLICT (user_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_active ON public.games (is_active);
CREATE INDEX IF NOT EXISTS idx_crypto_balances_user_id ON public.crypto_balances (user_id);

-- Add trigger to automatically update updated_at timestamp for games
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_balances_updated_at
    BEFORE UPDATE ON public.crypto_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();