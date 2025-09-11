-- 步驟 1: 建立 user_profiles 資料表
-- 這張表將儲存與 auth.users 關聯的公開用戶資料
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    quiz_answers JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 步驟 2: 為 user_profiles 資料表啟用 Row Level Security (RLS)
-- 這是確保用戶只能存取自己資料的關鍵安全措施
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 步驟 3: 建立 RLS 政策
-- 允許用戶讀取自己的個人資料
CREATE POLICY "Allow individual read access" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- 允許用戶新增自己的個人資料
CREATE POLICY "Allow individual insert access" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 允許用戶更新自己的個人資料
CREATE POLICY "Allow individual update access" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 步驟 4: 修正 subscribers 資料表
-- 為 subscribers 資料表添加 user_id 欄位以關聯用戶
ALTER TABLE public.subscribers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 為 user_id 建立索引以提高查詢效率
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);

-- 步驟 5: 為 subscribers 資料表啟用 RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 步驟 6: 建立 subscribers 的 RLS 政策
-- 允許用戶讀取自己的訂閱紀錄
CREATE POLICY "Allow individual read access on subscriptions" ON public.subscribers
    FOR SELECT USING (auth.uid() = user_id);

-- 允許用戶新增自己的訂閱紀錄
CREATE POLICY "Allow individual insert access on subscriptions" ON public.subscribers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 允許用戶更新自己的訂閱紀錄
CREATE POLICY "Allow individual update access on subscriptions" ON public.subscribers
    FOR UPDATE USING (auth.uid() = user_id);

-- 允許用戶刪除自己的訂閱紀錄
CREATE POLICY "Allow individual delete access on subscriptions" ON public.subscribers
    FOR DELETE USING (auth.uid() = user_id);

-- 步驟 7: 建立觸發器，在新用戶註冊時自動建立 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, name, updated_at)
    VALUES (new.id, new.raw_user_meta_data->>'name', now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 將觸發器綁定到 auth.users 表
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
