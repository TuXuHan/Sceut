-- 完整的 user_profiles 表結構更新
-- 確保包含所有地址相關欄位

-- 1. 確保 user_profiles 表存在並有正確的基礎結構
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT '台灣',
    "711" TEXT,
    quiz_answers JSONB,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 添加新的地址相關欄位
DO $$ 
BEGIN
    -- 添加配送方式欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'delivery_method') THEN
        ALTER TABLE user_profiles ADD COLUMN delivery_method TEXT;
    END IF;
    
    -- 添加7-11門市名稱欄位（新的標準化欄位）
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
    COMMENT ON COLUMN user_profiles."711" IS '舊版7-11門市欄位，保留向後相容性';
    
END $$;

-- 3. 創建檢查約束確保 delivery_method 的值是有效的
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

-- 4. 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_delivery_method 
ON user_profiles(delivery_method);

CREATE INDEX IF NOT EXISTS idx_user_profiles_city 
ON user_profiles(city);

-- 5. 資料遷移：將現有的711欄位資料遷移到新的store_711欄位
UPDATE user_profiles 
SET store_711 = "711", delivery_method = '711'
WHERE "711" IS NOT NULL AND "711" != '' 
  AND (store_711 IS NULL OR store_711 = '') 
  AND (delivery_method IS NULL OR delivery_method = '');

-- 6. 啟用 RLS（如果尚未啟用）
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. 創建或更新 RLS 政策
DROP POLICY IF EXISTS "Enable all operations for own profile" ON user_profiles;
CREATE POLICY "Enable all operations for own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- 8. 創建或替換更新 updated_at 的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 創建觸發器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. 顯示最終的表結構
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 11. 顯示遷移結果統計
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_profiles,
    COUNT(delivery_method) as profiles_with_delivery_method,
    COUNT(store_711) as profiles_with_store_711,
    COUNT("711") as profiles_with_old_711,
    COUNT(full_address) as profiles_with_full_address
FROM user_profiles;
