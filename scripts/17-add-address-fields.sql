-- 添加新的地址相關欄位到 user_profiles 表
-- 支援新的配送方式選擇功能

-- 1. 添加新的地址相關欄位
DO $$ 
BEGIN
    -- 添加配送方式欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'delivery_method') THEN
        ALTER TABLE user_profiles ADD COLUMN delivery_method TEXT;
    END IF;
    
    -- 添加7-11門市名稱欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'store_711') THEN
        ALTER TABLE user_profiles ADD COLUMN store_711 TEXT;
    END IF;
    
    -- 添加完整地址欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'full_address') THEN
        ALTER TABLE user_profiles ADD COLUMN full_address TEXT;
    END IF;
    
    -- 添加註解說明欄位用途
    COMMENT ON COLUMN user_profiles.delivery_method IS '配送方式: 711 或 home';
    COMMENT ON COLUMN user_profiles.store_711 IS '7-11門市名稱，當delivery_method為711時使用';
    COMMENT ON COLUMN user_profiles.full_address IS '完整配送地址，當delivery_method為home時使用';
    
END $$;

-- 2. 創建檢查約束確保 delivery_method 的值是有效的
DO $$
BEGIN
    -- 檢查約束是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_delivery_method'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT check_delivery_method 
        CHECK (delivery_method IS NULL OR delivery_method IN ('711', 'home'));
    END IF;
END $$;

-- 3. 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_delivery_method 
ON user_profiles(delivery_method);

-- 4. 更新現有資料（可選）
-- 如果現有的711欄位有資料，可以遷移到新的store_711欄位
UPDATE user_profiles 
SET store_711 = "711", delivery_method = '711'
WHERE "711" IS NOT NULL AND "711" != '' AND delivery_method IS NULL;

-- 5. 顯示更新結果
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_profiles,
    COUNT(delivery_method) as profiles_with_delivery_method,
    COUNT(store_711) as profiles_with_store_711,
    COUNT(full_address) as profiles_with_full_address
FROM user_profiles;
