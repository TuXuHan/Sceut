-- 添加配送方式欄位到 user_profiles 表
DO $$
BEGIN
    -- 檢查 delivery_method 欄位是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'delivery_method'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN delivery_method TEXT CHECK (delivery_method IN ('711', 'home', ''));
        
        COMMENT ON COLUMN user_profiles.delivery_method IS '配送方式: 711 或 home';
    END IF;
END $$;
