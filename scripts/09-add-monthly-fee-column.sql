-- Add monthly_fee column to subscribers table
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS monthly_fee INTEGER DEFAULT 599;

-- Update existing records to have the default monthly fee
UPDATE subscribers 
SET monthly_fee = 599 
WHERE monthly_fee IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN subscribers.monthly_fee IS 'Monthly subscription fee in TWD';
