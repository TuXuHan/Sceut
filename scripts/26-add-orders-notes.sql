-- 為 orders 表添加備注欄位
-- 如果 notes 欄位不存在，則創建它

DO $$
BEGIN
    -- 檢查 notes 欄位是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'notes'
    ) THEN
        -- 如果不存在，添加 notes 欄位
        ALTER TABLE "public"."orders" 
        ADD COLUMN "notes" TEXT;
        
        RAISE NOTICE '已添加 notes 欄位到 orders 表';
    ELSE
        RAISE NOTICE 'notes 欄位已存在於 orders 表';
    END IF;
END $$;

-- 添加註釋說明欄位用途
COMMENT ON COLUMN "public"."orders"."notes" IS '訂單備註資訊';
