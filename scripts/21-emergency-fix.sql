-- 緊急修復腳本：添加缺失的欄位
-- 解決 "Could not find the 'delivery_method' column" 錯誤

-- 1. 確保 user_profiles 表存在
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

-- 2. 添加缺失的欄位
DO $$ 
BEGIN
    -- 添加 delivery_method 欄位
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'delivery_method'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN delivery_method TEXT;
        RAISE NOTICE 'Added delivery_method column';
    ELSE
        RAISE NOTICE 'delivery_method column already exists';
    END IF;
    
    -- 添加 full_address 欄位
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'full_address'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN full_address TEXT;
        RAISE NOTICE 'Added full_address column';
    ELSE
        RAISE NOTICE 'full_address column already exists';
    END IF;
    
END $$;

-- 3. 添加約束
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
        RAISE NOTICE 'Added delivery_method constraint';
    ELSE
        RAISE NOTICE 'delivery_method constraint already exists';
    END IF;
END $$;

-- 4. 啟用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. 創建 RLS 政策
DROP POLICY IF EXISTS "Enable all operations for own profile" ON user_profiles;
CREATE POLICY "Enable all operations for own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- 6. 創建觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 創建觸發器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 驗證修復結果
SELECT 
    'Fix Verification' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('delivery_method', 'full_address', 'city', '711')
ORDER BY column_name;

-- 9. 測試插入
INSERT INTO user_profiles (
    id, 
    name, 
    email, 
    delivery_method, 
    city, 
    "711"
) VALUES (
    gen_random_uuid(),
    '測試修復',
    'test@example.com',
    '711',
    '測試縣市',
    '測試門市'
) ON CONFLICT (id) DO NOTHING;

-- 10. 清理測試資料
DELETE FROM user_profiles WHERE name = '測試修復';

-- 11. 顯示成功訊息
SELECT 'Emergency fix completed successfully!' as status;
