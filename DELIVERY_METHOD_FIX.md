# 配送方式儲存功能

## 問題
"請先完成配送地址設定才能儲存" 錯誤，無法儲存選擇的配送方式（7-11 或宅配）

## ✅ 解決方案

### 1. 資料庫遷移
**文件**: `scripts/22-add-delivery-method.sql`

執行此 SQL 腳本在 Supabase 中添加 `delivery_method` 欄位：

\`\`\`sql
ALTER TABLE user_profiles 
ADD COLUMN delivery_method TEXT CHECK (delivery_method IN ('711', 'home', ''));
\`\`\`

### 2. 程式碼更新

#### 更新內容：
1. ✅ 添加 `delivery_method` 到 `UserProfile` 接口
2. ✅ 在初始狀態中包含 `delivery_method: ""`
3. ✅ `createUserProfile` 函數處理 `delivery_method`
4. ✅ `handleAddressFormChange` 儲存選擇的配送方式
5. ✅ `addressFormInitialData` 從資料庫載入已儲存的配送方式
6. ✅ `handleSave` 將 `delivery_method` 儲存到資料庫
7. ✅ 載入時查詢包含 `delivery_method`

## 🎯 功能說明

### 配送方式選擇：
- **7-11 超商取貨** (`delivery_method: "711"`)
  - 需要填寫：縣市、門市名稱
  
- **宅配到府** (`delivery_method: "home"`)
  - 需要填寫：完整地址

### 儲存流程：
1. 用戶選擇配送方式（7-11 或宅配）
2. 填寫相應的地址資訊
3. 點擊儲存按鈕
4. `delivery_method` 和地址資訊一起儲存到 `user_profiles` 表
5. 下次載入時會顯示之前選擇的配送方式

### 顯示當前結果：
- 頁面載入時會從資料庫讀取 `delivery_method`
- `AddressForm` 會自動顯示之前選擇的配送方式
- 相應的表單欄位會自動展開並填入已儲存的資料

## 📝 使用步驟

### 步驟 1: 執行資料庫遷移
在 Supabase SQL Editor 中執行：
\`\`\`sql
-- 執行 scripts/22-add-delivery-method.sql 的內容
\`\`\`

### 步驟 2: 重新載入頁面
1. 刷新個人資料頁面
2. 選擇配送方式（7-11 或宅配）
3. 填寫相應的地址資訊
4. 點擊儲存

### 步驟 3: 驗證
1. 重新載入頁面
2. 應該看到之前選擇的配送方式
3. 相應的表單欄位應該已填入資料

## 🔍 驗證資料庫

執行以下 SQL 查詢驗證資料是否正確儲存：

\`\`\`sql
SELECT id, name, delivery_method, city, "711", address 
FROM user_profiles 
WHERE id = '你的用戶ID';
\`\`\`

應該看到：
- `delivery_method`: "711" 或 "home"
- `city`: 縣市名稱（如果選擇 7-11）
- `"711"`: 門市名稱（如果選擇 7-11）
- `address`: 完整地址（如果選擇宅配）

## ✅ 完成！

現在配送方式會正確儲存和顯示了！
