# 定時任務設置指南

## 📅 自動重新計算扣款排程

系統提供了一個定時任務端點，可以每天自動重新計算所有活躍訂閱的扣款排程。

### API 端點

```
GET /api/cron/recalculate-payments
```

### 功能

- 每天執行一次
- 根據 `created_at`（第一期）和目前時間推算應該的期數
- 自動更新 `last_payment_date` 和 `next_payment_date`
- 判斷訂閱是否已完成（`currentPeriod >= totalTimes`）
- 記錄執行結果和錯誤

---

## 設置方式

### 方式 1：使用 Vercel Cron Jobs（推薦）

如果你的專案部署在 Vercel：

1. 在專案根目錄創建 `vercel.json`：

```json
{
  "crons": [
    {
      "path": "/api/cron/recalculate-payments",
      "schedule": "0 2 * * *"
    }
  ]
}
```

2. 在 Vercel Dashboard 設置環境變數：
   - `CRON_SECRET`: 設置一個隨機密鑰（可選，用於保護端點）

3. 部署後 Vercel 會自動每天凌晨 2 點執行

**Cron 表達式說明**：
- `0 2 * * *` - 每天凌晨 2:00 執行
- `0 */6 * * *` - 每 6 小時執行一次
- `0 0 * * 0` - 每週日午夜執行

---

### 方式 2：使用 GitHub Actions

在 `.github/workflows/cron.yml` 中：

```yaml
name: Daily Payment Recalculation

on:
  schedule:
    # 每天凌晨 2:00 UTC 執行
    - cron: '0 2 * * *'
  workflow_dispatch: # 允許手動觸發

jobs:
  recalculate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cron Endpoint
        run: |
          curl -X GET "https://your-domain.vercel.app/api/cron/recalculate-payments" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

### 方式 3：使用 Cron-Job.org（免費）

1. 訪問 https://cron-job.org
2. 註冊帳號
3. 創建新的 Cron Job：
   - **URL**: `https://your-domain.vercel.app/api/cron/recalculate-payments`
   - **Schedule**: 每天 02:00
   - **Request Method**: GET
   - **Header** (如果設置了 CRON_SECRET):
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

---

### 方式 4：使用本地 Crontab（Linux/Mac）

在本地伺服器上設置：

```bash
# 編輯 crontab
crontab -e

# 添加以下行（每天凌晨 2:00）
0 2 * * * curl -X GET "http://localhost:3000/api/cron/recalculate-payments"
```

---

## 手動觸發

你也可以手動調用定時任務：

```bash
# 不需要認證（如果沒設置 CRON_SECRET）
curl -X GET http://localhost:3000/api/cron/recalculate-payments

# 需要認證（如果設置了 CRON_SECRET）
curl -X GET http://localhost:3000/api/cron/recalculate-payments \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 環境變數

在 `.env.local` 或 Vercel 環境變數中設置：

```env
# 可選：保護 Cron 端點的密鑰
CRON_SECRET=your-random-secret-key-here

# 必需：Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 監控和日誌

### 查看執行結果

定時任務會返回詳細的執行結果：

```json
{
  "success": true,
  "message": "[CRON] 扣款排程重新計算完成",
  "results": {
    "total": 6,
    "updated": 5,
    "skipped": 0,
    "completed": 1,
    "errors": []
  }
}
```

### Vercel 日誌

在 Vercel Dashboard → Functions → Logs 中查看執行記錄

### 日誌關鍵字

在終端或日誌中搜索：
- `[CRON]` - 所有 cron 相關日誌
- `✅ [CRON]` - 成功的操作
- `❌ [CRON]` - 錯誤和失敗

---

## 測試

在部署前測試定時任務：

```bash
# 本地測試
npm run dev

# 在另一個終端調用
curl -X GET http://localhost:3000/api/cron/recalculate-payments
```

---

## 注意事項

1. **這是 fallback 機制**：理想情況下，NewebPay callback 應該會自動更新扣款時間
2. **定時任務只是補充**：用於修復 callback 未正確執行的情況
3. **監控 callback**：優先確保 `/api/newebpay/callback` 正常運作
4. **檢查日誌**：定期查看 `payment_data.newebpay_events` 確認 callback 有在執行

---

## 疑難排解

### 定時任務沒有執行

1. 檢查 Vercel Cron Jobs 是否啟用
2. 確認 `vercel.json` 配置正確
3. 查看 Vercel Dashboard 的 Cron 執行歷史

### 認證失敗

1. 確認 `CRON_SECRET` 環境變數已設置
2. 確認 Authorization header 格式正確：`Bearer YOUR_SECRET`

### 更新失敗

1. 檢查 `SUPABASE_SERVICE_ROLE_KEY` 是否正確
2. 確認 Supabase RLS 政策允許更新
3. 查看日誌中的具體錯誤訊息

