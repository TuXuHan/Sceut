-- 測試地址欄位存儲功能
-- 此腳本用於驗證新的地址欄位是否正常工作

-- 1. 檢查表結構
SELECT 
    'Table Structure Check' as test_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('delivery_method', 'store_711', 'full_address', '711', 'city', 'address')
ORDER BY column_name;

-- 2. 檢查約束
SELECT 
    'Constraint Check' as test_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_profiles' 
  AND constraint_name = 'check_delivery_method';

-- 3. 檢查索引
SELECT 
    'Index Check' as test_name,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_profiles' 
  AND indexname LIKE '%delivery%';

-- 4. 測試插入7-11配送資料
INSERT INTO user_profiles (
    id, 
    name, 
    email, 
    phone, 
    delivery_method, 
    city, 
    store_711
) VALUES (
    gen_random_uuid(),
    '測試用戶711',
    'test711@example.com',
    '0912345678',
    '711',
    '台北市',
    '台北信義門市'
) ON CONFLICT (id) DO NOTHING;

-- 5. 測試插入宅配資料
INSERT INTO user_profiles (
    id, 
    name, 
    email, 
    phone, 
    delivery_method, 
    full_address
) VALUES (
    gen_random_uuid(),
    '測試用戶宅配',
    'testhome@example.com',
    '0987654321',
    'home',
    '台北市信義區信義路五段7號'
) ON CONFLICT (id) DO NOTHING;

-- 6. 查詢測試資料
SELECT 
    'Test Data Query' as test_name,
    name,
    email,
    delivery_method,
    city,
    store_711,
    full_address,
    "711" as old_711_field
FROM user_profiles 
WHERE name LIKE '測試用戶%'
ORDER BY name;

-- 7. 清理測試資料
DELETE FROM user_profiles WHERE name LIKE '測試用戶%';

-- 8. 顯示當前所有用戶的地址資訊統計
SELECT 
    'Current Data Statistics' as test_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN delivery_method = '711' THEN 1 END) as users_711,
    COUNT(CASE WHEN delivery_method = 'home' THEN 1 END) as users_home,
    COUNT(CASE WHEN delivery_method IS NULL OR delivery_method = '' THEN 1 END) as users_no_delivery_method,
    COUNT(CASE WHEN store_711 IS NOT NULL AND store_711 != '' THEN 1 END) as users_with_store_711,
    COUNT(CASE WHEN full_address IS NOT NULL AND full_address != '' THEN 1 END) as users_with_full_address,
    COUNT(CASE WHEN "711" IS NOT NULL AND "711" != '' THEN 1 END) as users_with_old_711
FROM user_profiles;
