# 生產環境部署指南

## 已完成的配置更改

### ✅ 重定向 URL 已更新為生產環境

所有相關文件中的重定向 URL 已從本地開發環境更改為正式上線環境：

1. **`/lib/email-verification.ts`**
   - 重定向 URL: `https://sceut.vercel.app/auth/callback`

2. **`/app/register/page.tsx`**
   - 重定向 URL: `https://sceut.vercel.app/auth/callback`

3. **`/app/auth-provider.tsx`**
   - 重定向 URL: `https://sceut.vercel.app/auth/callback`

4. **`/supabase/config.toml`**
   - site_url: `https://sceut.vercel.app`
   - additional_redirect_urls: 包含生產環境和本地開發環境的 URL

### ✅ 環境變數已配置

`.env.local` 文件已更新為使用生產環境的 Supabase 配置。

## 部署前檢查清單

### 1. Supabase 生產環境設置

確保在 Supabase Dashboard 中設置以下重定向 URL：

\`\`\`
https://sceut.vercel.app/auth/callback
\`\`\`

**設置步驟：**
1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的項目
3. 進入 Authentication > URL Configuration
4. 在 "Redirect URLs" 中添加：`https://sceut.vercel.app/auth/callback`
5. 保存設置

### 2. 環境變數設置

在 Vercel 部署時，確保設置以下環境變數：

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://bbrnbyzjmxgxnczzymdt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEWEBPAY_MERCHANT_ID=your_production_merchant_id
NEWEBPAY_HASH_KEY=your_production_hash_key
NEWEBPAY_HASH_IV=your_production_hash_iv
NEWEBPAY_ENVIRONMENT=production
NEXT_PUBLIC_SUBSCRIPTION_PRICE=599
NODE_ENV=production
\`\`\`

### 3. Vercel 部署設置

**在 Vercel Dashboard 中設置環境變數：**
1. 進入你的 Vercel 項目
2. 進入 Settings > Environment Variables
3. 添加上述所有環境變數
4. 確保所有環境變數都設置為 "Production" 環境

## 測試生產環境驗證流程

### 1. 註冊測試
1. 訪問 [https://sceut.vercel.app/register](https://sceut.vercel.app/register)
2. 填寫註冊表單
3. 提交註冊

### 2. 驗證郵件測試
1. 檢查註冊郵箱
2. 點擊驗證連結
3. 確認跳轉到 `https://sceut.vercel.app/auth/callback`
4. 確認顯示"驗證成功"

### 3. 登入測試
1. 訪問 [https://sceut.vercel.app/login](https://sceut.vercel.app/login)
2. 使用驗證後的帳號登入
3. 確認可以正常進入會員中心

## 常見問題解決

### 問題 1: 驗證連結無效
**解決方案：**
- 檢查 Supabase Dashboard 中的重定向 URL 設置
- 確保 `https://sceut.vercel.app/auth/callback` 已添加到允許的重定向 URL 列表

### 問題 2: 環境變數未生效
**解決方案：**
- 在 Vercel 中重新部署項目
- 檢查 Vercel Dashboard 中的環境變數設置
- 確保環境變數名稱和值都正確

### 問題 3: 驗證後無法登入
**解決方案：**
- 檢查 Supabase 用戶表中的驗證狀態
- 確認 `email_confirmed_at` 欄位有值
- 檢查 Supabase 的認證設置

## 監控和維護

### 1. 日誌監控
- 使用 Vercel 的 Function Logs 監控 API 錯誤
- 檢查 Supabase Dashboard 中的認證日誌

### 2. 用戶反饋
- 監控用戶註冊和驗證成功率
- 收集用戶關於驗證流程的反饋

### 3. 定期檢查
- 定期測試註冊和驗證流程
- 檢查 Supabase 的服務狀態
- 監控 Vercel 的部署狀態

## 回滾計劃

如果部署後發現問題，可以：

1. **快速回滾：**
   - 在 Vercel 中回滾到上一個穩定版本
   - 檢查環境變數設置

2. **修復問題：**
   - 修復代碼問題
   - 重新部署

3. **驗證修復：**
   - 測試註冊和驗證流程
   - 確認所有功能正常

---

**重要提醒：** 部署前請確保所有環境變數都已正確設置，特別是 Supabase 的 Service Role Key 和 NeWebPay 的生產環境配置。
