# 直接儲存修復

## 問題
使用 server action `saveUserProfile` 沒有正確覆蓋 quiz_answers

## ✅ 解決方案

### 改用客戶端直接儲存
**文件**: `app/quiz/page.tsx`

**修改前**（使用 server action）:
```typescript
const result = await saveUserProfile({
  id: user.id,
  quiz_answers: newAnswers,
})
```

**修改後**（直接使用 Supabase 客戶端）:
```typescript
// 使用客戶端 Supabase
const { createClient } = await import("@/lib/supabase/client")
const supabase = createClient()

const dataToSave = {
  id: user.id,
  quiz_answers: newAnswers,
  updated_at: new Date().toISOString(),
}

const { data, error } = await supabase
  .from("user_profiles")
  .upsert(dataToSave, { onConflict: 'id' })
  .select()
```

## 🎯 優點

1. **直接操作** - 不經過 server action
2. **即時反饋** - 可以直接在瀏覽器看到錯誤
3. **更多控制** - 可以使用 `.select()` 確認儲存結果
4. **更詳細的日誌** - 顯示儲存後的完整數據

## 📊 預期日誌

### 測驗完成時（瀏覽器控制台）:
```
🎉 測驗完成！開始保存答案...
最終答案: {
  gender: "neutral",
  scent: "fresh",
  complexity: "balanced",
  intensity: "moderate",
  character: "contemporary",
  mood: "calm",
  occasion: "casual"
}
💾 保存測驗答案...
✅ 答案已保存到 localStorage
🔄 嘗試保存到 Supabase 數據庫...
📝 準備儲存的答案: {...}
💾 直接儲存到資料庫: {
  id: "xxx",
  quiz_answers: {...},
  updated_at: "2025-10-01T..."
}
✅ 測驗答案已成功保存到數據庫
✅ 儲存後的數據: [{
  id: "xxx",
  name: "...",
  quiz_answers: {
    gender: "neutral",
    scent: "fresh",
    complexity: "balanced",
    intensity: "moderate",
    character: "contemporary",
    mood: "calm",
    occasion: "casual"
  },
  ...
}]
```

## 🔧 測試步驟

### 1. 清除 localStorage
```javascript
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sceut_')) {
    localStorage.removeItem(key)
  }
})
location.href = '/quiz'
```

### 2. 重新完成測驗
- 完成所有 7 個問題
- **仔細觀察控制台日誌**

### 3. 檢查關鍵日誌

#### 如果成功：
```
✅ 測驗答案已成功保存到數據庫
✅ 儲存後的數據: [...]  // 應該包含新的 quiz_answers
```

#### 如果失敗：
```
❌ 數據庫保存失敗: {error details}
```

### 4. 查看推薦頁面
```
✅ 測驗答案（來源: 資料庫）: {
  gender: "neutral",  // 新數據
  scent: "fresh",
  complexity: "balanced",  // 應該存在
  ...
}
```

## ⚠️ 可能的錯誤

### 如果看到權限錯誤：
```
error: "new row violates row-level security policy"
```

**解決**：檢查 Supabase RLS 政策是否允許用戶更新自己的 quiz_answers

### 如果看到欄位不存在錯誤：
```
error: "column quiz_answers does not exist"
```

**解決**：執行 SQL 添加欄位：
```sql
ALTER TABLE user_profiles ADD COLUMN quiz_answers JSONB;
```

## ✅ 執行

現在請：
1. 清除 localStorage
2. 重新完成測驗
3. 提供完整的控制台日誌

如果還是失敗，請告訴我看到的錯誤訊息！
