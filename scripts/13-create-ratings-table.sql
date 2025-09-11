-- 創建 ratings 表
CREATE TABLE IF NOT EXISTS "public"."ratings" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "order_id" uuid NOT NULL REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    -- 確保每個用戶對每個訂單只能評分一次
    UNIQUE("order_id", "user_id")
);

-- 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS "idx_ratings_order_id" ON "public"."ratings"("order_id");
CREATE INDEX IF NOT EXISTS "idx_ratings_user_id" ON "public"."ratings"("user_id");
CREATE INDEX IF NOT EXISTS "idx_ratings_created_at" ON "public"."ratings"("created_at");

-- 啟用 RLS
ALTER TABLE "public"."ratings" ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 政策
-- 用戶只能查看自己的評分
CREATE POLICY "Users can view their own ratings" ON "public"."ratings"
    FOR SELECT USING (auth.uid() = user_id);

-- 用戶只能插入自己的評分
CREATE POLICY "Users can insert their own ratings" ON "public"."ratings"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用戶只能更新自己的評分
CREATE POLICY "Users can update their own ratings" ON "public"."ratings"
    FOR UPDATE USING (auth.uid() = user_id);

-- 用戶只能刪除自己的評分
CREATE POLICY "Users can delete their own ratings" ON "public"."ratings"
    FOR DELETE USING (auth.uid() = user_id);

-- 創建更新時間的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ratings_updated_at 
    BEFORE UPDATE ON "public"."ratings" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
