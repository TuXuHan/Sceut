-- Add missing columns to subscribers table for perfume subscription data
-- This script ensures the subscribers table can store all necessary subscription information

-- Add perfume-related columns if they don't exist
DO $$ 
BEGIN
    -- Add perfume_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'perfume_name') THEN
        ALTER TABLE subscribers ADD COLUMN perfume_name TEXT;
    END IF;
    
    -- Add perfume_brand column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'perfume_brand') THEN
        ALTER TABLE subscribers ADD COLUMN perfume_brand TEXT;
    END IF;
    
    -- Add quiz_answers column as JSONB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'quiz_answers') THEN
        ALTER TABLE subscribers ADD COLUMN quiz_answers JSONB;
    END IF;
    
    -- Add payment_data column as JSONB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'payment_data') THEN
        ALTER TABLE subscribers ADD COLUMN payment_data JSONB;
    END IF;
    
    -- Ensure email column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'email') THEN
        ALTER TABLE subscribers ADD COLUMN email TEXT;
    END IF;
    
    -- Ensure postal_code column exists (snake_case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'postal_code') THEN
        ALTER TABLE subscribers ADD COLUMN postal_code TEXT;
    END IF;
END $$;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Update RLS policies to ensure users can insert their own subscription data
DROP POLICY IF EXISTS "Users can insert their own subscription data" ON subscribers;
CREATE POLICY "Users can insert their own subscription data" ON subscribers
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view their own subscription data" ON subscribers;
CREATE POLICY "Users can view their own subscription data" ON subscribers
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription data" ON subscribers;
CREATE POLICY "Users can update their own subscription data" ON subscribers
    FOR UPDATE USING (auth.uid()::text = user_id);
