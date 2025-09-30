-- 簡化的地址欄位遷移腳本
-- 只添加必要的欄位：delivery_method 和 full_address
-- 使用現有的 city 和 "711" 欄位

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
    
    -- 添加完整地址欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'full_address') THEN
        ALTER TABLE user_profiles ADD COLUMN full_address TEXT;
    END IF;
    
    -- 添加註解說明欄位用途
    COMMENT ON COLUMN user_profiles.delivery_method IS '配送方式: 711 或 home';
    COMMENT ON COLUMN user_profiles.full_address IS '完整配送地址，當delivery_method為home時使用';
    COMMENT ON COLUMN user_profiles.city IS '縣市，當delivery_method為711時使用';
    COMMENT ON COLUMN user_profiles."711" IS '7-11門市名稱，當delivery_method為711時使用';
    
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

-- 5. 啟用 RLS（如果尚未啟用）
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. 創建或更新 RLS 政策
DROP POLICY IF EXISTS "Enable all operations for own profile" ON user_profiles;
CREATE POLICY "Enable all operations for own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- 7. 創建或替換更新 updated_at 的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 創建觸發器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 顯示最終的表結構
SELECT 
    'Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('id', 'name', 'email', 'phone', 'city', '711', 'delivery_method', 'full_address', 'address', 'postal_code', 'country')
ORDER BY 
    CASE column_name
        WHEN 'id' THEN 1
        WHEN 'name' THEN 2
        WHEN 'email' THEN 3
        WHEN 'phone' THEN 4
        WHEN 'city' THEN 5
        WHEN '711' THEN 6
        WHEN 'delivery_method' THEN 7
        WHEN 'full_address' THEN 8
        WHEN 'address' THEN 9
        WHEN 'postal_code' THEN 10
        WHEN 'country' THEN 11
        ELSE 12
    END;

-- 10. 顯示遷移結果統計
SELECT 
    'Migration Statistics' as info,
    COUNT(*) as total_profiles,
    COUNT(delivery_method) as profiles_with_delivery_method,
    COUNT(CASE WHEN delivery_method = '711' THEN 1 END) as profiles_711,
    COUNT(CASE WHEN delivery_method = 'home' THEN 1 END) as profiles_home,
    COUNT(CASE WHEN city IS NOT NULL AND city != '' THEN 1 END) as profiles_with_city,
    COUNT(CASE WHEN "711" IS NOT NULL AND "711" != '' THEN 1 END) as profiles_with_711,
    COUNT(CASE WHEN full_address IS NOT NULL AND full_address != '' THEN 1 END) as profiles_with_full_address
FROM user_profiles;
