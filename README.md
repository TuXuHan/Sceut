# Sceut

## 香水訂閱服務平台

Sceut 是一個個性化香水訂閱服務平台，透過智能問卷幫助用戶找到最適合的香水，並提供便捷的月費訂閱服務。

## 主要功能

### 🎯 個性化推薦
- 智能問卷系統，了解用戶的香水偏好
- AI 驅動的香水推薦引擎
- 品牌資料庫與匹配度計算

### 💳 訂閱服務
- **定期定額付款**：每月自動扣款 NT$ 599
- **訂閱期數**：預設 12 期（可隨時取消）
- **配送方式**：支援 7-11 超商取貨 / 宅配到府
- **免運費**：全台免費配送

### 👤 會員中心
- 個人資料管理
- 訂閱狀態查詢
- 訂單歷史記錄
- 地址管理（支援 7-11 / 宅配）

## 訂閱方案說明

### 💰 月費方案
- **每月費用**：NT$ 599
- **訂閱週期**：12 期（12 個月）
- **取消政策**：隨時可在會員中心取消，取消後不再收費
- **首次付款**：訂閱後立即開始
- **配送費用**：完全免費

### 📦 配送選項
1. **7-11 超商取貨**：選擇縣市和門市
2. **宅配到府**：填寫完整配送地址

## 技術棧

### 前端
- **Next.js 14** - React 框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **Shadcn UI** - 元件庫

### 後端 & 資料庫
- **Supabase** - 後端即服務
- **PostgreSQL** - 資料庫
- **Row Level Security** - 資料安全

### 支付整合
- **藍新金流 (NeWebPay)** - 定期定額付款
- **TapPay** - 信用卡支付（可選）

### AI 服務
- **Google Gemini API** - AI 推薦引擎

## 環境變數設定

在專案根目錄創建 `.env.local` 文件，並設定以下環境變數：

\`\`\`env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 網站配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUBSCRIPTION_PRICE=599

# NeWebPay 配置
NEWEBPAY_MERCHANT_ID=your_merchant_id
NEWEBPAY_HASH_KEY=your_hash_key
NEWEBPAY_HASH_IV=your_hash_iv
NEWEBPAY_ENVIRONMENT=sandbox

# Google Gemini AI 配置
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# TapPay 配置（可選）
TAPPAY_APP_ID=your_app_id
TAPPAY_APP_KEY=your_app_key
TAPPAY_PARTNER_KEY=your_partner_key
TAPPAY_MERCHANT_ID=your_merchant_id
TAPPAY_SERVER_TYPE=sandbox
\`\`\`

詳細的環境變數設定說明請參考：
- [環境變數設定指南](./ENV_SETUP_GUIDE.md)
- [TapPay 設定指南](./TAPPAY_SETUP.md)

## 本地開發

### 安裝依賴
\`\`\`bash
npm install
# 或
pnpm install
\`\`\`

### 啟動開發服務器
\`\`\`bash
npm run dev
# 或
pnpm dev
\`\`\`

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 資料庫設定
1. 在 Supabase 建立新專案
2. 執行 `scripts/` 目錄下的 SQL 遷移腳本
3. 設定 Row Level Security 政策

## 專案結構

\`\`\`
UserHome/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   ├── auth/                # 認證頁面
│   ├── member-center/       # 會員中心
│   ├── quiz/                # 問卷系統
│   ├── recommendations/     # 推薦結果
│   └── subscribe/           # 訂閱頁面（12期制）
├── components/              # React 元件
│   ├── ui/                 # UI 元件庫
│   └── periodicPaymentForm.tsx  # 定期定額付款表單
├── lib/                     # 工具函式
│   ├── supabase/           # Supabase 客戶端
│   ├── newebpay/           # 藍新金流整合
│   └── ai-recommendations-gemini.ts  # AI 推薦
├── scripts/                 # SQL 遷移腳本
└── .env.local              # 環境變數（需自行創建）
\`\`\`

## 主要功能說明

### 訂閱流程
1. 使用者完成個性化問卷
2. 系統生成香水推薦
3. 使用者選擇喜愛的香水
4. 填寫個人資料和配送地址
5. 選擇訂閱方案（**預設 12 期**）
6. 完成信用卡定期定額授權
7. 每月自動扣款並配送香水

### 取消訂閱
- 使用者可隨時在會員中心取消訂閱
- 取消後不會再進行扣款
- 已付款的當月仍會正常配送

## 測試

### 測試環境
使用沙盒環境進行測試，不會實際扣款。

### 測試卡號
- **Visa**: 4242 4242 4242 4242
- **MasterCard**: 5555 5555 5555 4444
- 到期日：任何未來日期（如 12/25）
- 安全碼：任何 3 位數字（如 123）

## 部署

### Vercel 部署
1. 連接 GitHub 倉庫
2. 在 Vercel 設定環境變數
3. 部署至生產環境

### 環境變數注意事項
- 生產環境請使用正式的 API 金鑰
- 將 `NEWEBPAY_ENVIRONMENT` 設為 `production`
- 將 `TAPPAY_SERVER_TYPE` 設為 `production`

## 相關文件

- [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - 環境變數設定指南
- [TAPPAY_SETUP.md](./TAPPAY_SETUP.md) - TapPay 支付設定
- [GUEST_QUIZ_FLOW.md](./GUEST_QUIZ_FLOW.md) - 訪客問卷流程
- [QUIZ_FEATURE_SUMMARY.md](./QUIZ_FEATURE_SUMMARY.md) - 問卷功能總覽

## License

Copyright © 2025 Sceut. All rights reserved.
