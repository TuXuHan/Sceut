-- 修復 user_profiles 表的 RLS 政策和 RPC 函數

-- 1. 確保 user_profiles 表存在且結構正確
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Taiwan',
    quiz_answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 啟用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. 刪除舊的 RLS 政策
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON user_profiles;

-- 4. 創建新的 RLS 政策
CREATE POLICY "Enable all operations for own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- 5. 創建或替換 RPC 函數來確保用戶資料存在
CREATE OR REPLACE FUNCTION ensure_user_profile(
    p_user_id UUID,
    p_name TEXT,
    p_email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_profiles (id, name, email, created_at, updated_at)
    VALUES (p_user_id, p_name, p_email, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, user_profiles.name),
        email = COALESCE(EXCLUDED.email, user_profiles.email),
        updated_at = NOW();
END;
$$;

-- 6. 創建觸發器來自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 授予必要的權限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_profile(UUID, TEXT, TEXT) TO authenticated;
