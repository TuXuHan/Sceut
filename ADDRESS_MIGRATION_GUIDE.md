# 地址功能資料庫遷移指南

## 概述
此遷移添加了新的地址相關欄位到 `user_profiles` 表，以支援新的配送方式選擇功能。

## 完整的 user_profiles 表欄位
### 現有欄位
- `id`: 用戶ID (UUID)
- `name`: 姓名
- `email`: 電子郵件
- `phone`: 電話
- `address`: 地址（舊版，保留向後相容）
- `city`: 縣市
- `postal_code`: 郵遞區號
- `country`: 國家
- `"711"`: 7-11門市名稱（舊版，保留向後相容）
- `quiz_answers`: 測驗答案 (JSONB)
- `recommendations`: 推薦結果 (JSONB)
- `created_at`: 創建時間
- `updated_at`: 更新時間

### 新增欄位
- `delivery_method`: 配送方式（'711' 或 'home'）
- `store_711`: 7-11門市名稱（新版標準化欄位）
- `full_address`: 完整配送地址

## 執行遷移

### 方法1: 使用 Supabase Dashboard（推薦）
1. 登入 Supabase Dashboard
2. 進入您的專案
3. 點擊左側選單的 "SQL Editor"
4. 複製 `scripts/18-complete-user-profiles-schema.sql` 的內容
5. 貼上並執行

### 方法2: 測試功能
執行完遷移後，可以運行測試腳本：
1. 在 SQL Editor 中執行 `scripts/test-address-storage.sql`
2. 檢查測試結果是否正常

### 方法2: 使用 Supabase CLI
\`\`\`bash
# 在 UserHome 目錄下執行
supabase db push
\`\`\`

### 方法3: 直接執行 SQL
\`\`\`sql
-- 複製並執行 scripts/17-add-address-fields.sql 中的內容
\`\`\`

## 遷移內容
1. **添加新欄位**: 三個新的地址相關欄位
2. **添加約束**: 確保 delivery_method 只能是 '711' 或 'home'
3. **創建索引**: 提高查詢性能
4. **資料遷移**: 將現有的 711 欄位資料遷移到新的 store_711 欄位
5. **添加註解**: 說明各欄位的用途

## 驗證遷移
執行遷移後，您應該會看到類似以下的結果：
\`\`\`
status: Migration completed successfully
total_profiles: X
profiles_with_delivery_method: Y
profiles_with_store_711: Z
profiles_with_full_address: W
\`\`\`

## 回滾（如果需要）
如果需要回滾，可以執行以下 SQL：
\`\`\`sql
-- 刪除新欄位
ALTER TABLE user_profiles DROP COLUMN IF EXISTS delivery_method;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS store_711;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS full_address;

-- 刪除約束
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS check_delivery_method;

-- 刪除索引
DROP INDEX IF EXISTS idx_user_profiles_delivery_method;
\`\`\`

## 注意事項
- 此遷移是向後相容的，不會影響現有功能
- 現有的 711 欄位資料會自動遷移到新的 store_711 欄位
- 新欄位都是可選的，不會破壞現有的資料
