# 緊急修復指南

## 問題診斷
錯誤訊息：`Could not find the 'delivery_method' column of 'user_profiles' in the schema cache`

**原因**：資料庫中缺少 `delivery_method` 和 `full_address` 欄位。

## 立即解決方案

### 步驟1: 執行緊急修復腳本
1. 登入 Supabase Dashboard
2. 進入 SQL Editor
3. 複製並執行 `scripts/21-emergency-fix.sql`

### 步驟2: 驗證修復
執行 `scripts/20-check-current-schema.sql` 確認欄位已添加。

### 步驟3: 重新啟用新欄位
修復完成後，取消註解以下代碼：

**在 `app/member-center/profile/page.tsx` 中**：

```typescript
// 取消註解這兩行
delivery_method: (profile.delivery_method as "711" | "home" | "") || "",
full_address: profile.full_address || "",
```

**在查詢語句中**：
```typescript
// 改回完整的查詢
const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=id,name,email,phone,address,city,postal_code,country,711,delivery_method,full_address&id=eq.${user.id}`, {
```

## 當前狀態
我已經暫時修改了代碼，現在只使用現有的欄位：
- ✅ `city` - 縣市
- ✅ `"711"` - 7-11門市名稱
- ❌ `delivery_method` - 暫時註解（等遷移完成）
- ❌ `full_address` - 暫時註解（等遷移完成）

## 測試步驟

### 1. 檢查當前功能
現在應該可以：
- ✅ 儲存基本個人資料
- ✅ 儲存 city 和 "711" 欄位
- ❌ 地址表單驗證（暫時禁用）

### 2. 執行遷移後
遷移完成後應該可以：
- ✅ 完整的地址表單功能
- ✅ 配送方式選擇
- ✅ 表單驗證

## 遷移腳本說明

### `21-emergency-fix.sql`
- 添加 `delivery_method` 欄位
- 添加 `full_address` 欄位
- 設置約束和索引
- 配置 RLS 政策

### `20-check-current-schema.sql`
- 檢查表結構
- 驗證欄位存在
- 檢查 RLS 狀態

## 如果遷移失敗

### 手動添加欄位
```sql
-- 手動添加欄位
ALTER TABLE user_profiles ADD COLUMN delivery_method TEXT;
ALTER TABLE user_profiles ADD COLUMN full_address TEXT;

-- 添加約束
ALTER TABLE user_profiles 
ADD CONSTRAINT check_delivery_method 
CHECK (delivery_method IS NULL OR delivery_method IN ('711', 'home'));
```

### 檢查權限
確保您有足夠的權限修改表結構。

## 完成後
遷移完成後，記得：
1. 取消註解代碼中的新欄位
2. 測試完整的地址表單功能
3. 驗證資料正確儲存

## 聯繫支援
如果問題持續存在，請提供：
1. 執行 `20-check-current-schema.sql` 的結果
2. 任何錯誤訊息
3. Supabase 專案設定
