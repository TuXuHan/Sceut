# 環境變數設置指南

## 問題：Invalid API Key

如果遇到 `invalid api key` 錯誤，表示 Supabase 環境變數未正確設置。

## 解決方案

### 1. 創建 `.env.local` 文件

在專案根目錄 `/Users/SummerTu/Desktop/Sceut/UserHome/` 創建 `.env.local` 文件：

\`\`\`bash
cd /Users/SummerTu/Desktop/Sceut/UserHome
touch .env.local
\`\`\`

### 2. 添加 Supabase 環境變數

在 `.env.local` 文件中添加以下內容：

\`\`\`env
# Supabase URL (從 Supabase Dashboard 獲取)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key (公開密鑰)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (服務密鑰 - 僅用於服務端)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 3. 從 Supabase Dashboard 獲取密鑰

1. 訪問 https://supabase.com/dashboard
2. 選擇您的專案
3. 點擊左側選單的 **Settings** (⚙️)
4. 點擊 **API**
5. 複製以下資訊：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **保密！**

### 4. 重啟開發服務器

設置完環境變數後，必須重啟服務器：

\`\`\`bash
# 停止當前服務器 (Ctrl + C)
# 然後重新啟動
npm run dev
\`\`\`

## 檢查環境變數是否設置正確

訪問以下 URL 檢查：

\`\`\`
http://localhost:3000/api/check-env
\`\`\`

應該看到：
\`\`\`json
{
  "env": {
    "SUPABASE_URL": true,
    "SUPABASE_SERVICE_ROLE_KEY": true,
    "SUPABASE_ANON_KEY": true
  }
}
\`\`\`

## 安全注意事項

⚠️ **重要：** 
- `.env.local` 文件已在 `.gitignore` 中，不會被提交到 Git
- 永遠不要將 `SUPABASE_SERVICE_ROLE_KEY` 暴露在客戶端代碼中
- 不要將環境變數文件提交到版本控制系統

## 常見問題

### Q: 我已經設置了環境變數，但還是報錯？
A: 確保重啟了開發服務器（必須完全停止並重新啟動）

### Q: 在哪裡可以找到 Service Role Key？
A: Supabase Dashboard → Settings → API → service_role (需要點擊"Reveal"顯示)

### Q: 測試環境和生產環境怎麼設置？
A: 
- 本地開發：使用 `.env.local`
- Vercel 部署：在 Vercel Dashboard → Settings → Environment Variables 中設置

## 測試連接

設置完成後，訪問測試頁面：

\`\`\`
http://localhost:3000/test-subscription
\`\`\`

如果環境變數正確，測試應該成功寫入數據到 Supabase。
