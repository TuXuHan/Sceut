# TapPay 設定指南

## 環境變數設定

在您的 `.env.local` 檔案中加入以下變數：

\`\`\`env
# TapPay 設定 - 伺服器端配置 (安全)
TAPPAY_APP_ID=your_app_id_here
TAPPAY_APP_KEY=your_app_key_here
TAPPAY_SERVER_TYPE=sandbox
TAPPAY_PARTNER_KEY=your_partner_key_here
TAPPAY_MERCHANT_ID=your_merchant_id_here
\`\`\`

## 取得 TapPay 憑證

1. 前往 [TapPay 開發者平台](https://developer.tappaysdk.com/)
2. 註冊開發者帳號
3. 建立新的應用程式
4. 取得 App ID 和 Partner Key

### 重要說明：
- **App ID**: 用於前端 SDK 初始化 (透過伺服器端動作取得)
- **App Key**: 用於前端 SDK 初始化 (透過伺服器端動作取得)
- **Partner Key**: 用於後端 API 認證 (請保密)
- **Merchant ID**: 用於付款處理 (請保密)

### 安全性改進：
- 所有 TapPay 憑證現在都透過伺服器端動作取得
- 移除了 `NEXT_PUBLIC_` 前綴以避免客戶端暴露
- 提供更好的安全性而不影響功能

## 測試卡號

### 沙盒環境測試卡號：

**Visa 卡：**
- 卡號：4242 4242 4242 4242
- 到期日：任何未來日期 (如 12/25)
- 安全碼：任何 3 位數字 (如 123)

**MasterCard：**
- 卡號：5555 5555 5555 4444
- 到期日：任何未來日期 (如 12/25)
- 安全碼：任何 3 位數字 (如 123)

## 功能特色

### ✅ 已實作功能：

1. **自動 SDK 載入** - 自動載入 TapPay SDK，包含重試機制
2. **動態載入備案** - 如果初始載入失敗，會嘗試動態載入
3. **網路連線檢查** - 檢查網路連線狀態
4. **演示模式** - 當 TapPay 無法使用時，自動切換到演示模式
5. **詳細錯誤處理** - 提供清楚的錯誤訊息和重試選項
6. **即時表單驗證** - 即時驗證信用卡資訊
7. **安全付款處理** - 使用 Prime 進行安全付款

### 🔧 技術特點：

- **TypeScript 支援** - 完整的型別定義
- **React Hooks** - 使用現代 React 模式
- **錯誤邊界** - 優雅的錯誤處理
- **重試機制** - 自動重試失敗的操作
- **載入狀態** - 詳細的載入進度顯示
- **響應式設計** - 支援各種螢幕尺寸

## 使用方式

\`\`\`tsx
import TapPayPaymentForm from '@/components/tappay-payment-form'

function PaymentPage() {
  const handlePaymentSuccess = (result) => {
    console.log('付款成功:', result)
    // 處理付款成功邏輯
  }

  const handlePaymentError = (error) => {
    console.error('付款失敗:', error)
    // 處理付款失敗邏輯
  }

  return (
    <TapPayPaymentForm
      amount={2800}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
    />
  )
}
\`\`\`

## 故障排除

### 常見問題：

1. **SDK 載入超時**
   - 檢查網路連線
   - 確認環境變數設定正確
   - 檢查瀏覽器控制台錯誤訊息

2. **付款失敗**
   - 確認使用正確的測試卡號
   - 檢查 TapPay 後端設定
   - 查看瀏覽器網路請求

3. **表單無法提交**
   - 確認所有必填欄位都已填寫
   - 檢查信用卡資訊格式
   - 確認 TapPay Fields 狀態

### 除錯技巧：

1. 開啟瀏覽器開發者工具
2. 查看 Console 標籤的日誌訊息
3. 檢查 Network 標籤的 API 請求
4. 使用測試卡號進行測試

## 生產環境部署

1. 將 `TAPPAY_SERVER_TYPE` 設為 `production`
2. 使用生產環境的 App ID 和 App Key
3. 確保 HTTPS 連線
4. 測試真實信用卡付款流程

## 支援

如果遇到問題，請檢查：
1. 環境變數設定
2. 網路連線狀態
3. 瀏覽器控制台錯誤
4. TapPay 開發者文件
