# 📧 電子郵件設定指南

本指南說明如何設定訂閱確認郵件功能。

## 🎯 功能說明

當用戶成功訂閱時，系統會自動發送一封美觀的確認郵件，包含：
- 訂閱詳情（訂閱編號、月費、下次扣款日期）
- 選擇的香水資訊
- 後續步驟說明
- 訂閱管理連結

## 📦 已安裝的套件

```bash
npm install resend
```

## 🔧 設定步驟

### 1. 註冊 Resend 帳號

1. 前往 [Resend 官網](https://resend.com/)
2. 註冊免費帳號（每月可免費發送 3,000 封郵件）
3. 驗證您的電子郵件地址

### 2. 獲取 API 金鑰

1. 登入 Resend 控制台
2. 前往 **API Keys** 頁面
3. 點擊 **Create API Key**
4. 複製生成的 API 金鑰

### 3. 設定環境變數

在 `UserHome/.env.local` 文件中添加以下環境變數：

```bash
# Resend API 金鑰（必填）
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 寄件者郵箱（選填，預設使用 Resend 測試郵箱）
# 注意：使用自定義域名需要在 Resend 控制台中驗證域名
EMAIL_FROM=Sceut <noreply@yourdomain.com>

# 應用程式 URL（用於郵件中的連結）
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. 驗證自定義域名（選填但建議）

使用 Resend 測試郵箱 (`onboarding@resend.dev`) 只能發送到您自己的郵箱。要發送給所有用戶，需要驗證自定義域名：

1. 在 Resend 控制台前往 **Domains** 頁面
2. 點擊 **Add Domain**
3. 輸入您的域名（例如：`yourdomain.com`）
4. 按照指示在您的 DNS 提供商添加以下記錄：
   - SPF 記錄（TXT）
   - DKIM 記錄（TXT）
   - DMARC 記錄（TXT）
5. 等待 DNS 記錄生效（通常需要 24-48 小時）
6. 在 Resend 控制台點擊 **Verify**

驗證完成後，更新 `EMAIL_FROM` 環境變數：
```bash
EMAIL_FROM=Sceut <noreply@yourdomain.com>
```

## 📝 程式碼說明

### 郵件服務模組

位置：`lib/email.ts`

提供以下函數：
- `sendSubscriptionConfirmationEmail()` - 發送訂閱確認郵件
- `sendSubscriptionCancellationEmail()` - 發送訂閱取消確認郵件

### 整合位置

郵件發送已整合在以下 API 端點中：

**訂閱創建**：`app/api/subscriptions/create/route.ts`
```typescript
// 在訂閱成功創建後自動發送確認郵件
if (data.email) {
  await sendSubscriptionConfirmationEmail({
    to: data.email,
    userName: data.name || "用戶",
    subscriptionId: data.id,
    periodNo: data.period_no,
    monthlyFee: data.monthly_fee,
    nextPaymentDate: data.next_payment_date,
    perfumeName: selectedPerfume?.name,
    perfumeBrand: selectedPerfume?.brand,
  })
}
```

## 🧪 測試郵件功能

### 開發環境測試

1. 確保已設定 `RESEND_API_KEY`
2. 使用 Resend 測試郵箱時，只能發送到您註冊 Resend 的郵箱
3. 執行訂閱流程測試

### 測試步驟

1. 啟動開發伺服器：
```bash
cd UserHome
npm run dev
```

2. 前往訂閱頁面：`http://localhost:3000/subscribe`
3. 完成訂閱流程
4. 檢查您的郵箱（註冊 Resend 的郵箱）

### 檢查日誌

在終端機查看日誌：
```
📧 準備發送訂閱確認郵件到: user@example.com
✅ 訂閱確認郵件發送成功
```

或如果失敗：
```
⚠️ 訂閱確認郵件發送失敗，但不影響訂閱創建: [錯誤訊息]
```

## 🎨 郵件模板自定義

### 修改郵件內容

編輯 `lib/email.ts` 中的 `emailHtml` 變數來自定義郵件內容。

### 郵件樣式

當前郵件使用內嵌 CSS，包含：
- 漸層背景標題
- 響應式設計
- 專業的排版
- 品牌色彩 (#667eea, #764ba2)

### 添加 Logo

在郵件 HTML 的 header 部分添加：
```html
<img src="https://yourdomain.com/logo.png" alt="Sceut" style="width: 120px; margin-bottom: 20px;">
```

## 🔍 常見問題

### Q: 為什麼我收不到郵件？

A: 檢查以下項目：
1. `RESEND_API_KEY` 是否正確設定
2. 使用測試郵箱時，收件者必須是註冊 Resend 的郵箱
3. 檢查垃圾郵件資料夾
4. 查看終端機日誌確認是否有錯誤

### Q: 如何發送給所有用戶？

A: 必須完成自定義域名驗證（見上方「驗證自定義域名」章節）

### Q: 郵件發送失敗會影響訂閱嗎？

A: 不會。郵件發送被設計為「最佳努力」，即使失敗也不會中斷訂閱流程。失敗訊息會記錄在日誌中。

### Q: 可以使用其他郵件服務嗎？

A: 可以。只需修改 `lib/email.ts` 中的實現。推薦的替代方案：
- SendGrid
- Mailgun
- AWS SES
- Postmark

### Q: 郵件發送的成本是多少？

A: Resend 免費方案：
- 每月 3,000 封郵件
- 每月 100 個收件者
- 對大多數小型應用已足夠

付費方案從 $20/月起，可發送 50,000 封郵件。

## 📊 監控與分析

### Resend 控制台

登入 Resend 控制台可以查看：
- 郵件發送統計
- 開信率
- 點擊率
- 退信率
- 郵件日誌

### 添加追蹤

在郵件中添加追蹤參數：
```html
<a href="https://yourdomain.com/subscribe?utm_source=email&utm_medium=subscription_confirmation">
```

## 🚀 生產環境部署

### 部署前檢查清單

- [ ] 已設定 `RESEND_API_KEY` 環境變數
- [ ] 已驗證自定義域名
- [ ] 已更新 `EMAIL_FROM` 為自定義域名
- [ ] 已設定 `NEXT_PUBLIC_APP_URL` 為生產環境 URL
- [ ] 已測試郵件發送功能
- [ ] 已檢查郵件在各種郵件客戶端的顯示效果

### Vercel 部署設定

在 Vercel 專案設定中添加環境變數：
1. 前往專案 Settings > Environment Variables
2. 添加以下變數：
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL`

## 📚 相關資源

- [Resend 文檔](https://resend.com/docs)
- [Resend API 參考](https://resend.com/docs/api-reference/introduction)
- [郵件最佳實踐](https://resend.com/docs/knowledge-base/best-practices)
- [郵件模板範例](https://resend.com/templates)

## 💡 進階功能

### 發送測試郵件

創建測試端點 `app/api/test-email/route.ts`：
```typescript
import { NextResponse } from 'next/server';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';

export async function GET() {
  const result = await sendSubscriptionConfirmationEmail({
    to: 'your-email@example.com',
    userName: '測試用戶',
    subscriptionId: 'test-123',
    periodNo: 'TEST123456789',
    monthlyFee: 599,
    nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    perfumeName: '測試香水',
    perfumeBrand: '測試品牌',
  });

  return NextResponse.json(result);
}
```

訪問 `http://localhost:3000/api/test-email` 發送測試郵件。

### 郵件佇列

對於大量郵件，建議使用佇列系統（如 Bull、BullMQ）：
```bash
npm install bull redis
```

### 郵件範本系統

使用 React Email 創建可維護的郵件範本：
```bash
npm install @react-email/components
```

---

如有任何問題，請查閱 [Resend 文檔](https://resend.com/docs) 或聯繫技術支援。

