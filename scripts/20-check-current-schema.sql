-- 檢查當前 user_profiles 表的結構
-- 用於診斷欄位是否存在

-- 1. 檢查表是否存在
SELECT 
    'Table Exists Check' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
        THEN 'user_profiles 表存在' 
        ELSE 'user_profiles 表不存在' 
    END as status;

-- 2. 檢查所有欄位
SELECT 
    'Current Columns' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 3. 檢查特定欄位是否存在
SELECT 
    'Required Columns Check' as info,
    column_name,
    CASE 
        WHEN column_name IS NOT NULL THEN '存在' 
        ELSE '不存在' 
    END as status
FROM (
    SELECT 'id' as column_name
    UNION SELECT 'name'
    UNION SELECT 'email'
    UNION SELECT 'phone'
    UNION SELECT 'city'
    UNION SELECT '711'
    UNION SELECT 'delivery_method'
    UNION SELECT 'full_address'
    UNION SELECT 'address'
    UNION SELECT 'postal_code'
    UNION SELECT 'country'
) required_columns
LEFT JOIN information_schema.columns 
    ON required_columns.column_name = information_schema.columns.column_name 
    AND information_schema.columns.table_name = 'user_profiles'
ORDER BY required_columns.column_name;

-- 4. 檢查 RLS 狀態
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 5. 檢查 RLS 政策
SELECT 
    'RLS Policies' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 6. 檢查現有資料
SELECT 
    'Current Data Sample' as info,
    COUNT(*) as total_records
FROM user_profiles;

-- 7. 顯示前3筆資料的結構
SELECT 
    'Sample Data' as info,
    id,
    name,
    email,
    city,
    "711",
    address
FROM user_profiles 
LIMIT 3;
