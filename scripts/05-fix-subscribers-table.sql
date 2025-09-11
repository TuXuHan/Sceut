-- Fix subscribers table structure and add missing columns
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'user_id') THEN
        ALTER TABLE subscribers ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add index on user_id for better performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscribers_user_id') THEN
        CREATE INDEX idx_subscribers_user_id ON subscribers(user_id);
    END IF;
    
    -- Ensure quiz_answers column exists and is JSONB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'quiz_answers') THEN
        ALTER TABLE subscribers ADD COLUMN quiz_answers JSONB;
    END IF;
    
    -- Ensure subscription_status column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'subscription_status') THEN
        ALTER TABLE subscribers ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    -- Add timestamps if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'created_at') THEN
        ALTER TABLE subscribers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'updated_at') THEN
        ALTER TABLE subscribers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Update existing rows to have user_id if they don't have one
    -- This assumes you can match by email with auth.users
    UPDATE subscribers 
    SET user_id = auth.users.id 
    FROM auth.users 
    WHERE subscribers.email = auth.users.email 
    AND subscribers.user_id IS NULL;
    
END $$;

-- Enable RLS on subscribers table
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscribers;
CREATE POLICY "Users can view their own subscriptions" ON subscribers
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own subscriptions
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscribers;
CREATE POLICY "Users can insert their own subscriptions" ON subscribers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own subscriptions
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscribers;
CREATE POLICY "Users can update their own subscriptions" ON subscribers
    FOR UPDATE USING (auth.uid() = user_id);
