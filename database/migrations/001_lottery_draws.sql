-- Create lottery_draws table with sample data
-- This script should be run in your Supabase SQL editor

-- Create lottery_draws table
CREATE TABLE IF NOT EXISTS public.lottery_draws (
    id text PRIMARY KEY, -- e.g., "Powerball-2025-08-27"
    lottery_name text NOT NULL,
    draw_date timestamp with time zone NOT NULL,
    winning_numbers integer[] NOT NULL, -- Array of integers
    bonus_number integer,
    jackpot_amount numeric,
    source_url text
);

-- Add indexes for efficient querying by lottery and date
CREATE INDEX IF NOT EXISTS idx_lottery_draws_name_date ON public.lottery_draws (lottery_name, draw_date DESC);

-- Enable RLS (lottery data is public)
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view lottery draws" ON public.lottery_draws;

-- Create policy for public access
CREATE POLICY "Anyone can view lottery draws" ON public.lottery_draws
  FOR SELECT USING (TRUE);

-- Insert 50+ sample historical lottery draw records
INSERT INTO public.lottery_draws (id, lottery_name, draw_date, winning_numbers, bonus_number, jackpot_amount, source_url) VALUES
('Powerball-2025-08-27', 'Powerball', '2025-08-27T20:00:00Z', ARRAY[12, 29, 33, 41, 52], 24, 150000000, 'https://www.powerball.com'),
('Powerball-2025-08-24', 'Powerball', '2025-08-24T20:00:00Z', ARRAY[08, 19, 34, 46, 58], 03, 120000000, 'https://www.powerball.com'),
('Powerball-2025-08-21', 'Powerball', '2025-08-21T20:00:00Z', ARRAY[15, 27, 35, 48, 67], 18, 100000000, 'https://www.powerball.com'),
('Powerball-2025-08-18', 'Powerball', '2025-08-18T20:00:00Z', ARRAY[07, 23, 39, 44, 59], 12, 95000000, 'https://www.powerball.com'),
('Powerball-2025-08-15', 'Powerball', '2025-08-15T20:00:00Z', ARRAY[11, 26, 42, 55, 61], 09, 85000000, 'https://www.powerball.com'),
('Powerball-2025-08-12', 'Powerball', '2025-08-12T20:00:00Z', ARRAY[04, 17, 31, 47, 63], 21, 75000000, 'https://www.powerball.com'),
('Powerball-2025-08-09', 'Powerball', '2025-08-09T20:00:00Z', ARRAY[13, 28, 36, 49, 65], 15, 65000000, 'https://www.powerball.com'),
('Powerball-2025-08-06', 'Powerball', '2025-08-06T20:00:00Z', ARRAY[02, 18, 32, 45, 57], 06, 55000000, 'https://www.powerball.com'),
('Powerball-2025-08-03', 'Powerball', '2025-08-03T20:00:00Z', ARRAY[09, 24, 38, 51, 62], 11, 50000000, 'https://www.powerball.com'),
('Powerball-2025-07-31', 'Powerball', '2025-07-31T20:00:00Z', ARRAY[16, 30, 43, 54, 68], 07, 45000000, 'https://www.powerball.com'),
('Powerball-2025-07-28', 'Powerball', '2025-07-28T20:00:00Z', ARRAY[01, 20, 37, 50, 64], 19, 40000000, 'https://www.powerball.com'),
('Powerball-2025-07-25', 'Powerball', '2025-07-25T20:00:00Z', ARRAY[14, 25, 40, 53, 66], 13, 35000000, 'https://www.powerball.com'),
('Powerball-2025-07-22', 'Powerball', '2025-07-22T20:00:00Z', ARRAY[06, 21, 34, 48, 60], 22, 30000000, 'https://www.powerball.com'),
('Powerball-2025-07-19', 'Powerball', '2025-07-19T20:00:00Z', ARRAY[10, 22, 35, 52, 69], 04, 25000000, 'https://www.powerball.com'),
('Powerball-2025-07-16', 'Powerball', '2025-07-16T20:00:00Z', ARRAY[03, 19, 41, 56, 67], 16, 20000000, 'https://www.powerball.com'),
('Mega-Millions-2025-08-26', 'Mega Millions', '2025-08-26T20:00:00Z', ARRAY[11, 19, 33, 47, 58], 12, 180000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-08-23', 'Mega Millions', '2025-08-23T20:00:00Z', ARRAY[07, 24, 36, 49, 61], 05, 160000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-08-20', 'Mega Millions', '2025-08-20T20:00:00Z', ARRAY[14, 28, 42, 54, 65], 18, 140000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-08-17', 'Mega Millions', '2025-08-17T20:00:00Z', ARRAY[02, 21, 38, 51, 63], 09, 120000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-08-14', 'Mega Millions', '2025-08-14T20:00:00Z', ARRAY[16, 25, 44, 57, 69], 23, 100000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-08-11', 'Mega Millions', '2025-08-11T20:00:00Z', ARRAY[04, 18, 31, 46, 62], 07, 90000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-08-08', 'Mega Millions', '2025-08-08T20:00:00Z', ARRAY[09, 27, 39, 53, 66], 14, 80000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-08-05', 'Mega Millions', '2025-08-05T20:00:00Z', ARRAY[13, 30, 43, 56, 68], 21, 70000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-08-02', 'Mega Millions', '2025-08-02T20:00:00Z', ARRAY[01, 17, 35, 48, 64], 11, 60000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-07-30', 'Mega Millions', '2025-07-30T20:00:00Z', ARRAY[12, 26, 41, 55, 67], 06, 50000000, 'https://www.megamillions.com'),
('Powerball-2025-07-13', 'Powerball', '2025-07-13T20:00:00Z', ARRAY[05, 16, 29, 45, 59], 08, 18000000, 'https://www.powerball.com'),
('Powerball-2025-07-10', 'Powerball', '2025-07-10T20:00:00Z', ARRAY[08, 23, 37, 51, 66], 17, 15000000, 'https://www.powerball.com'),
('Powerball-2025-07-07', 'Powerball', '2025-07-07T20:00:00Z', ARRAY[12, 28, 41, 54, 63], 02, 12000000, 'https://www.powerball.com'),
('Powerball-2025-07-04', 'Powerball', '2025-07-04T20:00:00Z', ARRAY[07, 19, 34, 47, 61], 24, 10000000, 'https://www.powerball.com'),
('Powerball-2025-07-01', 'Powerball', '2025-07-01T20:00:00Z', ARRAY[15, 31, 43, 56, 68], 13, 8000000, 'https://www.powerball.com'),
('Mega-Millions-2025-07-27', 'Mega Millions', '2025-07-27T20:00:00Z', ARRAY[06, 20, 32, 49, 65], 15, 45000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-07-24', 'Mega Millions', '2025-07-24T20:00:00Z', ARRAY[10, 24, 37, 52, 69], 03, 40000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-07-21', 'Mega Millions', '2025-07-21T20:00:00Z', ARRAY[03, 18, 40, 55, 67], 19, 35000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-07-18', 'Mega Millions', '2025-07-18T20:00:00Z', ARRAY[14, 29, 45, 58, 64], 08, 30000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-07-15', 'Mega Millions', '2025-07-15T20:00:00Z', ARRAY[02, 16, 33, 47, 62], 22, 25000000, 'https://www.megamillions.com'),
('Powerball-2025-06-28', 'Powerball', '2025-06-28T20:00:00Z', ARRAY[11, 27, 39, 52, 65], 05, 7000000, 'https://www.powerball.com'),
('Powerball-2025-06-25', 'Powerball', '2025-06-25T20:00:00Z', ARRAY[04, 18, 35, 48, 69], 20, 6000000, 'https://www.powerball.com'),
('Powerball-2025-06-22', 'Powerball', '2025-06-22T20:00:00Z', ARRAY[09, 22, 41, 55, 67], 12, 5500000, 'https://www.powerball.com'),
('Powerball-2025-06-19', 'Powerball', '2025-06-19T20:00:00Z', ARRAY[13, 26, 44, 58, 63], 07, 5000000, 'https://www.powerball.com'),
('Powerball-2025-06-16', 'Powerball', '2025-06-16T20:00:00Z', ARRAY[01, 17, 30, 46, 61], 16, 4500000, 'https://www.powerball.com'),
('Mega-Millions-2025-07-12', 'Mega Millions', '2025-07-12T20:00:00Z', ARRAY[07, 21, 36, 50, 66], 04, 22000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-07-09', 'Mega Millions', '2025-07-09T20:00:00Z', ARRAY[11, 25, 42, 57, 69], 10, 20000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-07-06', 'Mega Millions', '2025-07-06T20:00:00Z', ARRAY[05, 19, 34, 48, 64], 17, 18000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-07-03', 'Mega Millions', '2025-07-03T20:00:00Z', ARRAY[12, 28, 41, 54, 68], 01, 16000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-06-30', 'Mega Millions', '2025-06-30T20:00:00Z', ARRAY[08, 23, 38, 51, 65], 24, 14000000, 'https://www.megamillions.com'),
('Powerball-2025-06-13', 'Powerball', '2025-06-13T20:00:00Z', ARRAY[06, 20, 33, 49, 64], 03, 4000000, 'https://www.powerball.com'),
('Powerball-2025-06-10', 'Powerball', '2025-06-10T20:00:00Z', ARRAY[14, 29, 42, 56, 68], 19, 3800000, 'https://www.powerball.com'),
('Powerball-2025-06-07', 'Powerball', '2025-06-07T20:00:00Z', ARRAY[02, 15, 28, 43, 59], 09, 3600000, 'https://www.powerball.com'),
('Powerball-2025-06-04', 'Powerball', '2025-06-04T20:00:00Z', ARRAY[10, 24, 37, 50, 66], 14, 3400000, 'https://www.powerball.com'),
('Powerball-2025-06-01', 'Powerball', '2025-06-01T20:00:00Z', ARRAY[16, 31, 45, 58, 62], 21, 3200000, 'https://www.powerball.com'),
('Mega-Millions-2025-06-27', 'Mega Millions', '2025-06-27T20:00:00Z', ARRAY[03, 17, 32, 47, 63], 13, 12000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-06-24', 'Mega Millions', '2025-06-24T20:00:00Z', ARRAY[09, 26, 40, 55, 67], 06, 11000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-06-21', 'Mega Millions', '2025-06-21T20:00:00Z', ARRAY[13, 30, 44, 59, 69], 18, 10000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-06-18', 'Mega Millions', '2025-06-18T20:00:00Z', ARRAY[01, 18, 35, 48, 64], 11, 9000000, 'https://www.megamillions.com'),
('Mega-Millions-2025-06-15', 'Mega Millions', '2025-06-15T20:00:00Z', ARRAY[07, 22, 39, 52, 66], 25, 8500000, 'https://www.megamillions.com');

-- Verify data insertion
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT lottery_name) as lottery_types,
  MIN(draw_date) as earliest_draw,
  MAX(draw_date) as latest_draw
FROM public.lottery_draws;