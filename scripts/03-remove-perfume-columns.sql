-- 移除 perfume_name 和 perfume_brand 欄位
-- 在 Supabase SQL 編輯器中執行

-- 1. 移除 perfume_name 欄位
ALTER TABLE subscribers 
DROP COLUMN IF EXISTS perfume_name;

-- 2. 移除 perfume_brand 欄位
ALTER TABLE subscribers 
DROP COLUMN IF EXISTS perfume_brand;

-- 3. 確認欄位已移除
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscribers' 
ORDER BY ordinal_position;
