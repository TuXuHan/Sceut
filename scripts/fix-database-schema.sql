-- 修復數據庫架構，添加用戶關聯
-- 在 Supabase SQL 編輯器中執行

-- 1. 添加 user_id 列到 subscribers 表
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);

-- 3. 創建 RLS (Row Level Security) 政策
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 4. 創建政策：用戶只能看到自己的數據
CREATE POLICY "Users can view own subscriptions" ON subscribers
    FOR SELECT USING (auth.uid() = user_id);

-- 5. 創建政策：用戶只能插入自己的數據
CREATE POLICY "Users can insert own subscriptions" ON subscribers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. 創建政策：用戶只能更新自己的數據
CREATE POLICY "Users can update own subscriptions" ON subscribers
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. 創建政策：用戶只能刪除自己的數據
CREATE POLICY "Users can delete own subscriptions" ON subscribers
    FOR DELETE USING (auth.uid() = user_id);

-- 8. 創建用戶配置文件表
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Taiwan',
    quiz_answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. 為用戶配置文件表啟用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 10. 創建用戶配置文件的政策
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
