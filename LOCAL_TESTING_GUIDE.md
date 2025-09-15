# 本地端測試驗證指南

## 前置條件

1. **安裝 Docker Desktop**
   - 下載並安裝 Docker Desktop: https://docs.docker.com/desktop
   - 啟動 Docker Desktop 並等待完全啟動

2. **安裝 Supabase CLI**
   ```bash
   npm install -g supabase
   ```

## 設置步驟

### 1. 啟動本地 Supabase

```bash
# 在項目根目錄運行
supabase start
```

啟動成功後，你會看到類似以下的輸出：
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 創建環境變數文件

創建 `.env.local` 文件並填入以下內容：

```env
# Supabase 本地開發配置
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key

# NeWebPay 配置（測試用）
NEWEBPAY_MERCHANT_ID=MS123456789
NEWEBPAY_HASH_KEY=your_hash_key_here
NEWEBPAY_HASH_IV=your_hash_iv_here
NEWEBPAY_ENVIRONMENT=test

# 其他配置
NEXT_PUBLIC_SUBSCRIPTION_PRICE=599
NODE_ENV=development
```

**重要**: 將 `你的_anon_key` 和 `你的_service_role_key` 替換為 `supabase start` 命令輸出的實際值。

### 3. 啟動 Next.js 開發服務器

```bash
npm run dev
```

## 測試驗證流程

### 1. 訪問註冊頁面
```
http://localhost:3000/register
```

### 2. 填寫註冊表單
- 姓名: 測試用戶
- 郵箱: test@example.com
- 密碼: 123456

### 3. 查看驗證郵件
- 訪問 Inbucket: http://127.0.0.1:54324
- 這是本地郵件測試服務器
- 你可以在這裡看到所有發送的郵件

### 4. 點擊驗證連結
- 在 Inbucket 中找到驗證郵件
- 點擊郵件中的驗證連結
- 應該會跳轉到 `http://localhost:3000/auth/callback`
- 顯示"驗證成功"

### 5. 使用調試頁面
```
http://localhost:3000/debug-auth
```
- 可以查看詳細的認證狀態
- 查看調試日誌

## 常見問題

### 問題 1: Docker 未啟動
**解決方案**: 啟動 Docker Desktop 並等待完全啟動

### 問題 2: 驗證連結無效
**解決方案**: 
1. 檢查 `.env.local` 中的 URL 是否正確
2. 確保 `supabase/config.toml` 中 `enable_confirmations = true`

### 問題 3: 找不到驗證郵件
**解決方案**: 
1. 檢查 Inbucket: http://127.0.0.1:54324
2. 確保郵箱地址正確

### 問題 4: 驗證後無法登入
**解決方案**: 
1. 檢查 Supabase Studio: http://127.0.0.1:54323
2. 查看用戶表確認驗證狀態

## 停止本地服務

```bash
# 停止 Supabase
supabase stop

# 停止 Next.js (Ctrl+C)
```

## 重置本地數據庫

```bash
# 重置 Supabase 數據庫
supabase db reset
```
