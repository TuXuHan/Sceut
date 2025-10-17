# 📧 郵件配置詳細說明

## 📮 問題 1: 接收者 Email 是怎麼抓的？

### ✅ 是的，使用的是當下訂閱者的 Email

### 📍 Email 抓取流程

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 用戶完成付款後，進入訂閱成功頁面                            │
│    /app/subscribe/success/page.tsx                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. 獲取用戶個人資料                                           │
│    第 52 行: const userProfile = await getUserProfile(...)  │
│                                                             │
│    來源 1: user_profiles 資料表                              │
│    來源 2: 如果資料表沒有，使用 Supabase Auth 的 user.email  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. 準備資料並發送到 API                                       │
│    第 77 行: userProfile: profileData                       │
│                                                             │
│    profileData = {                                          │
│      name: ...,                                             │
│      email: user?.email || "",  ← 這裡！                     │
│      phone: ...,                                            │
│      ...                                                    │
│    }                                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. API 接收並儲存到資料庫                                      │
│    /app/api/subscriptions/create/route.ts                  │
│    第 75 行: email: userProfile?.email || ""                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. 發送郵件                                                  │
│    第 132 行: to: data.email  ← 使用訂閱者的 Email！          │
│                                                             │
│    sendSubscriptionConfirmationEmail({                      │
│      to: data.email,  ← 這就是接收者的 Email                 │
│      userName: data.name,                                   │
│      ...                                                    │
│    })                                                       │
└─────────────────────────────────────────────────────────────┘
```

### 📝 具體代碼位置

**文件**: `/app/subscribe/success/page.tsx`

```typescript
// 第 52-64 行
const userProfile = await getUserProfile(user!.id)

const profileData = userProfile || {
  name: user?.user_metadata?.name || user?.email?.split("@")[0] || "用戶",
  email: user?.email || "",  // ← Email 來源 1: Supabase Auth
  phone: "",
  address: "",
  ...
}
```

**文件**: `/app/api/subscriptions/create/route.ts`

```typescript
// 第 72-75 行
const subscriptionData = {
  user_id: userId,
  name: userProfile?.full_name || userProfile?.name || "",
  email: userProfile?.email || "",  // ← 從前端傳來的 userProfile
  ...
}

// 第 128-132 行
if (data.email) {  // ← 檢查是否有 email
  const emailResult = await sendSubscriptionConfirmationEmail({
    to: data.email,  // ← 發送到訂閱者的 email
    userName: data.name || "用戶",
    ...
  })
}
```

### 🔍 Email 優先順序

1. **第一優先**: `user_profiles` 資料表中的 `email` 欄位
2. **第二優先**: Supabase Auth 的 `user.email` (用戶註冊時的 email)
3. **備用**: 如果都沒有，不發送郵件（會記錄日誌）

---

## 📤 問題 2: 發送者的 Email 要如何設定？

### 🔧 設定位置：環境變數

**文件**: `.env.local`（需要在 UserHome 目錄下創建）

```bash
# 發送者 Email 設定
EMAIL_FROM=Sceut <noreply@yourdomain.com>
```

### 📍 代碼使用位置

**文件**: `/lib/email.ts` 第 203 行

```typescript
const result = await resend.emails.send({
  from: process.env.EMAIL_FROM || 'Sceut <onboarding@resend.dev>',  // ← 這裡！
  to,
  subject: '🎉 訂閱成功確認 - Sceut 香水訂閱服務',
  html: emailHtml,
});
```

### 🎯 設定方式

#### 方式 1: 使用 Resend 測試郵箱（開發測試用）

```bash
# .env.local
EMAIL_FROM=Sceut <onboarding@resend.dev>
```

**特點**：
- ✅ 立即可用，無需驗證
- ❌ 只能發送給註冊 Resend 的郵箱
- ✅ 適合開發測試

#### 方式 2: 使用自定義域名（生產環境）

```bash
# .env.local
EMAIL_FROM=Sceut <noreply@yourdomain.com>
```

**前置條件**：
1. 在 Resend 控制台驗證域名
2. 添加 DNS 記錄（SPF、DKIM、DMARC）
3. 等待驗證完成（24-48小時）

**特點**：
- ✅ 可發送給任何郵箱
- ✅ 專業形象
- ✅ 適合生產環境

### 📋 域名驗證步驟（詳細）

1. **登入 Resend 控制台**
   - 前往 https://resend.com/domains

2. **添加域名**
   - 點擊 "Add Domain"
   - 輸入你的域名（例如：yourdomain.com）

3. **獲取 DNS 記錄**
   Resend 會提供 3 筆記錄，類似：

   ```
   SPF 記錄:
   類型: TXT
   名稱: @
   值: v=spf1 include:resend.com ~all
   
   DKIM 記錄:
   類型: TXT
   名稱: resend._domainkey
   值: k=rsa; p=MIGfMA0GCSq...（很長的字串）
   
   DMARC 記錄:
   類型: TXT
   名稱: _dmarc
   值: v=DMARC1; p=none; pct=100; rua=mailto:dmarc@yourdomain.com
   ```

4. **在你的 DNS 提供商添加記錄**
   - 登入你的域名管理平台（如 Cloudflare、GoDaddy、Namecheap）
   - 找到 DNS 設定頁面
   - 逐一添加上述 3 筆 TXT 記錄

5. **等待驗證**
   - DNS 記錄需要時間生效（通常 24-48 小時）
   - 回到 Resend 控制台點擊 "Verify"

6. **更新環境變數**
   ```bash
   EMAIL_FROM=Sceut <noreply@yourdomain.com>
   ```

### 💡 發送者名稱格式

```bash
# 格式: 顯示名稱 <郵箱地址>

# 範例 1: 使用品牌名稱
EMAIL_FROM=Sceut <noreply@sceut.com>

# 範例 2: 使用中文名稱
EMAIL_FROM=香水訂閱 <noreply@sceut.com>

# 範例 3: 使用客服名稱
EMAIL_FROM=Sceut 客服 <support@sceut.com>

# 範例 4: 只有郵箱地址
EMAIL_FROM=noreply@sceut.com
```

---

## ✏️ 問題 3: 信件內容在哪裡設定？

### 📍 主要設定文件

**文件**: `/lib/email.ts`

這個文件包含了所有郵件相關的邏輯和模板。

### 📧 訂閱確認郵件內容

**函數**: `sendSubscriptionConfirmationEmail()`  
**位置**: `/lib/email.ts` 第 16-205 行

### 🎨 內容結構

```typescript
// /lib/email.ts

export async function sendSubscriptionConfirmationEmail(data: SubscriptionConfirmationEmailData) {
  
  // 1. 格式化資料（第 23-28 行）
  const formattedNextPaymentDate = new Date(nextPaymentDate).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 2. 郵件 HTML 內容（第 30-197 行）
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <!-- 郵件樣式和 Meta 標籤 -->
    </head>
    <body>
      <!-- 郵件內容 -->
    </body>
    </html>
  `;

  // 3. 發送郵件（第 199-205 行）
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Sceut <onboarding@resend.dev>',
    to,
    subject: '🎉 訂閱成功確認 - Sceut 香水訂閱服務',  // ← 郵件主旨
    html: emailHtml,
  });
}
```

### 📝 可修改的內容區塊

#### 1. 郵件主旨（Subject）

**位置**: `/lib/email.ts` 第 201 行

```typescript
subject: '🎉 訂閱成功確認 - Sceut 香水訂閱服務',
```

**修改範例**:
```typescript
subject: '歡迎加入 Sceut！您的訂閱已確認',
subject: '🎊 感謝訂閱 - Sceut 香水每月配送',
subject: 'Subscription Confirmed - Sceut Perfume Service',
```

#### 2. 郵件標題（Header）

**位置**: `/lib/email.ts` 第 42-46 行

```html
<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
  🎉 訂閱成功！
</h1>
<p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">
  感謝您加入 Sceut 香水訂閱服務
</p>
```

#### 3. 歡迎訊息

**位置**: `/lib/email.ts` 第 52-58 行

```html
<p style="color: #333333; font-size: 16px;">
  親愛的 <strong>${userName}</strong>，您好！
</p>
<p style="color: #666666; font-size: 15px;">
  恭喜您成功訂閱 Sceut 香水服務！我們很高興能為您帶來每月精心挑選的香水體驗。
</p>
```

#### 4. 訂閱詳情區塊

**位置**: `/lib/email.ts` 第 79-115 行

```html
<h2>訂閱詳情</h2>

<table>
  <tr>
    <td>訂閱編號：</td>
    <td>${periodNo}</td>
  </tr>
  <tr>
    <td>月費：</td>
    <td>NT$ ${monthlyFee.toLocaleString()}</td>
  </tr>
  <tr>
    <td>下次扣款日期：</td>
    <td>${formattedNextPaymentDate}</td>
  </tr>
</table>
```

#### 5. 後續步驟

**位置**: `/lib/email.ts` 第 121-143 行

```html
<h2>接下來會發生什麼？</h2>

<div>
  <div>1</div>
  <span>我們將為您精心包裝選中的香水</span>
</div>

<div>
  <div>2</div>
  <span>3-5 個工作天內送達您指定的地址</span>
</div>

<div>
  <div>3</div>
  <span>每月自動配送新香水到您手中</span>
</div>
```

#### 6. CTA 按鈕連結

**位置**: `/lib/email.ts` 第 158-164 行

```html
<a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/member-center/subscription">
  查看我的訂閱
</a>
```

#### 7. 頁尾（Footer）

**位置**: `/lib/email.ts` 第 170-176 行

```html
<p>此郵件由系統自動發送，請勿直接回覆</p>
<p>© ${new Date().getFullYear()} Sceut. All rights reserved.</p>
```

### 🎨 樣式修改

#### 顏色主題

**目前使用的顏色**（可在 `/lib/email.ts` 中全局搜尋替換）:

```css
主要顏色: #667eea (紫藍色)
漸層色: #667eea → #764ba2
標題文字: #333333 (深灰)
內文文字: #666666 (中灰)
背景色: #f5f5f5 (淺灰)
提示框: #fff8e1 (淺黃)
```

**修改範例**:

```typescript
// 改成綠色主題
主要顏色: #10b981 (綠色)
漸層色: #10b981 → #059669

// 改成粉色主題
主要顏色: #ec4899 (粉色)
漸層色: #ec4899 → #db2777
```

### 🖼️ 添加 Logo

**位置**: 在 `/lib/email.ts` 第 42 行之前添加

```html
<!-- Header -->
<tr>
  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
    
    <!-- 添加 Logo -->
    <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" 
         alt="Sceut Logo" 
         style="width: 120px; height: auto; margin-bottom: 20px;">
    
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
      🎉 訂閱成功！
    </h1>
    ...
  </td>
</tr>
```

### 📋 快速修改範例

#### 範例 1: 修改歡迎文字

```typescript
// 找到第 52-58 行，修改為：
<p style="color: #333333; font-size: 16px;">
  嗨 <strong>${userName}</strong>！👋
</p>
<p style="color: #666666; font-size: 15px;">
  太棒了！您已經成功訂閱 Sceut 香水服務。讓我們一起開始這段美好的香氛旅程吧！
</p>
```

#### 範例 2: 添加聯絡資訊

```typescript
// 在頁尾（第 170 行）添加：
<p style="color: #666666; font-size: 14px; margin: 10px 0;">
  如有任何問題，請聯絡我們：<br>
  📧 Email: support@sceut.com<br>
  📱 電話: 02-1234-5678
</p>
<p style="color: #666666; font-size: 14px;">
  此郵件由系統自動發送，請勿直接回覆
</p>
```

#### 範例 3: 修改按鈕文字和連結

```typescript
// 找到第 158-164 行，修改為：
<a href="${process.env.NEXT_PUBLIC_APP_URL}/member-center/dashboard">
  前往我的帳戶
</a>

// 或添加多個按鈕：
<div style="text-align: center; margin: 30px 0;">
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/member-center/subscription">
    管理訂閱
  </a>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/recommendations">
    查看推薦
  </a>
</div>
```

---

## 🧪 測試修改後的郵件

### 方法 1: 使用測試 API

```bash
# 1. 修改 /lib/email.ts 中的內容
# 2. 儲存文件
# 3. 重啟開發伺服器（如果需要）
# 4. 訪問測試端點

http://localhost:3000/api/test-email?email=your-email@example.com
```

### 方法 2: 實際訂閱流程

```bash
# 1. 修改 /lib/email.ts
# 2. 儲存文件
# 3. 前往 /subscribe 完成訂閱
# 4. 檢查郵箱
```

---

## 📍 完整文件清單

### 郵件相關文件

1. **`/lib/email.ts`** - 郵件服務和模板（主要修改位置）
2. **`/app/api/subscriptions/create/route.ts`** - 訂閱創建和郵件觸發
3. **`/app/api/test-email/route.ts`** - 測試郵件發送
4. **`/app/subscribe/success/page.tsx`** - 訂閱成功頁面（獲取用戶資料）

### 環境變數

**`.env.local`** (需手動創建)
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Sceut <noreply@yourdomain.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 總結

### 問題 1: 接收者 Email
- ✅ **來源**: 訂閱者在註冊時提供的 email
- ✅ **優先順序**: user_profiles 資料表 → Supabase Auth user.email
- ✅ **代碼位置**: `/app/api/subscriptions/create/route.ts` 第 132 行

### 問題 2: 發送者 Email
- ✅ **設定位置**: `.env.local` 文件的 `EMAIL_FROM` 變數
- ✅ **測試模式**: `Sceut <onboarding@resend.dev>`
- ✅ **生產模式**: `Sceut <noreply@yourdomain.com>` (需驗證域名)
- ✅ **代碼位置**: `/lib/email.ts` 第 200 行

### 問題 3: 信件內容
- ✅ **主要文件**: `/lib/email.ts`
- ✅ **修改範圍**: 主旨、標題、內容、樣式、Logo、按鈕、頁尾
- ✅ **測試方式**: `/api/test-email` 或實際訂閱流程

---

**需要更詳細的說明或範例嗎？歡迎隨時詢問！** 🚀

