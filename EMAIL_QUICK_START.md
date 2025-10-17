# 📧 訂閱確認郵件 - 快速開始

## ✅ 已完成的功能

✨ **訂閱成功時自動發送美觀的確認郵件給訂閱者**

### 包含內容
- 🎨 專業美觀的郵件模板（漸層設計）
- 📋 完整訂閱資訊（訂閱編號、月費、下次扣款日期）
- 🌸 顯示選擇的香水資訊
- 📍 後續步驟說明
- 🔗 會員中心快速連結
- 📱 響應式設計（支援手機查看）

### 實現位置
- **郵件服務**：`lib/email.ts`
- **整合位置**：`app/api/subscriptions/create/route.ts`
- **測試端點**：`app/api/test-email/route.ts`

---

## 🚀 立即開始（3 步驟）

### 1️⃣ 註冊 Resend（免費）

前往 [https://resend.com/](https://resend.com/) 註冊免費帳號
- ✅ 每月免費發送 3,000 封郵件
- ✅ 無需信用卡

### 2️⃣ 獲取 API 金鑰並設定環境變數

1. 登入 Resend 後，前往 **API Keys** 頁面
2. 點擊 **Create API Key**
3. 複製 API 金鑰

在 `UserHome/.env.local` 文件中添加（如果文件不存在，請創建）：

```bash
# Resend API 金鑰
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 寄件者郵箱（使用測試郵箱）
EMAIL_FROM=Sceut <onboarding@resend.dev>

# 應用程式 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ 測試郵件發送

啟動開發伺服器：
```bash
cd UserHome
npm run dev
```

在瀏覽器訪問（替換成您註冊 Resend 的郵箱）：
```
http://localhost:3000/api/test-email?email=your-email@example.com
```

檢查您的郵箱（包括垃圾郵件資料夾）！

---

## 🎯 實際訂閱流程測試

1. 確保已登入
2. 前往 `http://localhost:3000/subscribe`
3. 完成訂閱流程
4. 訂閱成功後會自動發送確認郵件 ✉️

---

## ⚠️ 重要提示

### 測試環境限制

使用 Resend 測試郵箱 `onboarding@resend.dev` 時：
- ❌ **只能**發送到您註冊 Resend 的郵箱
- ✅ 適合開發測試

### 生產環境設定

要發送給所有用戶，需要：
1. 驗證自定義域名（免費）
2. 更新 `EMAIL_FROM` 為您的域名

詳細步驟請參考：[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)

---

## 🔍 郵件發送流程

```
用戶完成付款
    ↓
NeWebPay 回傳結果
    ↓
重定向到 /subscribe/success 頁面
    ↓
調用 /api/subscriptions/create
    ↓
創建訂閱記錄到資料庫
    ↓
✉️ 自動發送確認郵件 ← 這裡！
    ↓
顯示成功頁面
```

### 錯誤處理

- ✅ 郵件發送失敗**不會影響**訂閱創建
- ✅ 錯誤會記錄在伺服器日誌中
- ✅ 用戶仍然可以正常訂閱

---

## 📊 查看發送狀態

### 伺服器日誌

在終端機查看：
```
📧 準備發送訂閱確認郵件...
✅ 訂閱確認郵件發送成功
```

### Resend 控制台

登入 [Resend 控制台](https://resend.com/emails) 查看：
- 已發送的郵件列表
- 郵件狀態（已發送、已開啟、退信等）
- 郵件內容預覽

---

## 🎨 自定義郵件模板

編輯 `lib/email.ts` 中的 `emailHtml` 變數來自定義：
- 郵件內容
- 顏色和樣式
- Logo 和圖片
- 文字訊息

---

## 💡 常見問題

### Q: 為什麼收不到郵件？

**A:** 檢查清單：
- [ ] 已設定 `RESEND_API_KEY`
- [ ] 使用註冊 Resend 的郵箱接收（測試模式）
- [ ] 檢查垃圾郵件資料夾
- [ ] 查看終端機日誌確認錯誤訊息

### Q: 如何發送給任意用戶？

**A:** 需要完成域名驗證，詳見 [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) 的「驗證自定義域名」章節

### Q: 郵件發送的成本？

**A:** 
- 免費方案：每月 3,000 封
- 付費方案：$20/月起（50,000 封）
- 對小型應用完全足夠

---

## 📚 更多資源

- 📖 [詳細設定指南](./EMAIL_SETUP_GUIDE.md)
- 🌐 [Resend 官方文檔](https://resend.com/docs)
- 💬 需要幫助？查看日誌或 Resend 控制台

---

## 🎉 完成！

現在您的訂閱系統已經可以自動發送確認郵件了！

**下一步建議：**
1. 測試完整訂閱流程
2. 自定義郵件模板以符合品牌風格
3. 生產環境部署前驗證自定義域名

祝您使用愉快！ 🚀

