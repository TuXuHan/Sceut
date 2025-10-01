-- 重置特定用戶的測驗答案
-- 請將 'YOUR_USER_ID' 替換為您的實際用戶 ID

-- 1. 查看當前的 quiz_answers
SELECT id, name, quiz_answers 
FROM user_profiles 
WHERE id = 'YOUR_USER_ID';

-- 2. 清除您的 quiz_answers（如果需要）
-- UPDATE user_profiles 
-- SET quiz_answers = NULL
-- WHERE id = 'YOUR_USER_ID';

-- 3. 驗證清除結果
-- SELECT id, name, quiz_answers 
-- FROM user_profiles 
-- WHERE id = 'YOUR_USER_ID';
