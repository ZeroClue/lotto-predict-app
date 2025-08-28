# Database Schema

## Table: `users`

```sql
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    password_hash text, -- Nullable for social logins
    username text UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    wallet_address text, -- Optional, for real crypto integration
    provider text, -- 'email', 'google', 'facebook', 'github'
    provider_id text -- ID from the social provider
);

-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_username ON public.users (username);
CREATE INDEX idx_users_provider_id ON public.users (provider_id);

-- Enable RLS (Row Level Security) for Supabase
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for RLS (example, will be refined)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

## Table: `nfts`

```sql
CREATE TABLE public.nfts (
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

-- Add indexes for frequently queried columns
CREATE INDEX idx_nfts_owner_id ON public.nfts (owner_id);
CREATE INDEX idx_nfts_rarity ON public.nfts (rarity);

-- Enable RLS
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

-- Policies for RLS (example, will be refined)
CREATE POLICY "Users can view their own NFTs" ON public.nfts
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can update their own NFTs (e.g., is_featured)" ON public.nfts
  FOR UPDATE USING (auth.uid() = owner_id);
```

## Table: `crypto_balances`

```sql
CREATE TABLE public.crypto_balances (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    balance numeric DEFAULT 0.0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.crypto_balances ENABLE ROW LEVEL SECURITY;

-- Policies for RLS (example, will be refined)
CREATE POLICY "Users can view their own crypto balance" ON public.crypto_balances
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own crypto balance (via game completion)" ON public.crypto_balances
  FOR UPDATE USING (auth.uid() = user_id); -- Note: Updates should primarily be via backend functions
```

## Table: `games`

```sql
CREATE TABLE public.games (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    description text,
    reward_amount numeric NOT NULL,
    nft_award_threshold integer, -- Nullable if game doesn't award NFT
    is_active boolean DEFAULT TRUE NOT NULL,
    image_url text
);

-- Add index for game name
CREATE INDEX idx_games_name ON public.games (name);

-- Enable RLS (games are public data)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view games" ON public.games
  FOR SELECT USING (TRUE);
```

## Table: `lottery_draws`

```sql
CREATE TABLE public.lottery_draws (
    id text PRIMARY KEY, -- e.g., "Powerball-2025-08-27"
    lottery_name text NOT NULL,
    draw_date timestamp with time zone NOT NULL,
    winning_numbers integer[] NOT NULL, -- Array of integers
    bonus_number integer,
    jackpot_amount numeric,
    source_url text
);

-- Add indexes for efficient querying by lottery and date
CREATE INDEX idx_lottery_draws_name_date ON public.lottery_draws (lottery_name, draw_date DESC);

-- Enable RLS (lottery data is public)
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lottery draws" ON public.lottery_draws
  FOR SELECT USING (TRUE);
```
