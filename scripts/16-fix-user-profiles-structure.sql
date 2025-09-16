-- 修正 user_profiles 表的結構問題
-- 根據提供的 INSERT 語句，發現 id 和 name 欄位有問題

-- 1. 首先檢查並修正現有資料
-- 如果 name 欄位包含 UUID，將其移到 id 欄位
UPDATE user_profiles 
SET id = name::uuid, name = NULL 
WHERE name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
AND id IS NULL;

-- 2. 確保 user_profiles 表有正確的結構
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

-- 3. 添加缺少的欄位
DO $$ 
BEGIN
    -- 檢查並添加 email 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email TEXT;
    END IF;
    
    -- 檢查並添加 711 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = '711') THEN
        ALTER TABLE user_profiles ADD COLUMN "711" TEXT;
    END IF;
    
    -- 檢查並添加 recommendations 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'recommendations') THEN
        ALTER TABLE user_profiles ADD COLUMN recommendations JSONB;
    END IF;
    
    -- 檢查並添加 created_at 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'created_at') THEN
        ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- 檢查並添加 updated_at 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 4. 清理無效的資料（id 為 null 的記錄）
DELETE FROM user_profiles WHERE id IS NULL;

-- 5. 啟用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. 刪除舊的 RLS 政策
DROP POLICY IF EXISTS "Enable all operations for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- 7. 創建新的 RLS 政策
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
