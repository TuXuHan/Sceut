-- 修復 orders 表中 ratings 欄位的資料類型
-- 將 ratings 欄位從 integer 改為 jsonb

-- 首先檢查當前的欄位類型
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name = 'ratings';

-- 如果 ratings 欄位存在但類型錯誤，先刪除它
ALTER TABLE "public"."orders" DROP COLUMN IF EXISTS "ratings";

-- 重新創建 ratings 欄位為 jsonb 類型
ALTER TABLE "public"."orders" ADD COLUMN "ratings" jsonb;

-- 添加註釋說明欄位用途
COMMENT ON COLUMN "public"."orders"."ratings" IS '訂單評分資料，包含 rating (1-5), comment, rated_at, rated_by';

-- 創建索引以提高查詢性能（可選）
CREATE INDEX IF NOT EXISTS "idx_orders_ratings" ON "public"."orders" USING GIN ("ratings");

-- 示例：插入測試評分資料
-- UPDATE "public"."orders" 
-- SET "ratings" = '{"rating": 5, "comment": "很棒的商品！", "rated_at": "2025-09-10T18:52:47.614Z", "rated_by": "15016f67-e8e4-42a4-b163-8d0c98c9ce4f"}'::jsonb
-- WHERE "id" = '15016f67-e8e4-42a4-b163-8d0c98c9ce4f';
