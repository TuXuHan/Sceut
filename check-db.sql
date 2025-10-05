-- 查詢你的用戶資料
SELECT 
    id,
    name,
    email,
    phone,
    delivery_method,
    address,
    city,
    postal_code,
    "711",
    created_at,
    updated_at
FROM user_profiles
WHERE email = 'tusummer1214@gmail.com'
ORDER BY updated_at DESC
LIMIT 1;
