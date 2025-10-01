# 測驗答案覆蓋修復

## ✅ 修復內容

### 1. 改進 upsert 邏輯
**文件**: `lib/user-data-service.ts`

**關鍵改進**：
```typescript
// 特別處理 quiz_answers: 即使是空對象也要儲存，以覆蓋舊資料
if (profile.quiz_answers !== undefined) {
  dataToSave.quiz_answers = profile.quiz_answers
  console.log("🔄 將覆蓋 quiz_answers 欄位為:", profile.quiz_answers)
}

const { error } = await supabase.from("user_profiles").upsert(dataToSave, { 
  onConflict: 'id',
  ignoreDuplicates: false  // 確保覆蓋而不是忽略
})
```

### 2. 確保每次測驗都覆蓋
- ✅ 使用 `ignoreDuplicates: false`
- ✅ 明確處理 `quiz_answers` 欄位
- ✅ 添加覆蓋日誌

## 🔧 測試步驟

### 快速測試（清除您自己的數據）:

**步驟 1: 清除您的 localStorage**
在瀏覽器控制台執行：
```javascript
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sceut_')) {
    localStorage.removeItem(key)
  }
})
location.href = '/quiz'
```

**步驟 2: 完成新測驗**
- 完成所有 7 個問題
- 觀察日誌

**步驟 3: 查看結果**
- 訪問推薦頁面
- 檢查是否顯示新的 7 個偏好

## 📊 預期日誌

### 測驗完成時（瀏覽器）:
```
最終答案: {
  gender: "neutral",
  scent: "fresh",
  complexity: "balanced",
  intensity: "moderate",
  character: "contemporary",
  mood: "calm",
  occasion: "casual"
}
🔄 嘗試保存到 Supabase 數據庫...
📝 準備儲存的答案: {...}
```

### 伺服器端（終端）:
```
💾 Attempting to save user profile for ID: xxx
📝 Profile data: {
  "id": "xxx",
  "quiz_answers": {
    "gender": "neutral",
    ...所有 7 個欄位...
  }
}
🔄 將覆蓋 quiz_answers 欄位為: {...}
📦 準備儲存到資料庫的數據: {...}
✅ User profile saved and verified successfully
```

### 推薦頁面（瀏覽器）:
```
✅ 測驗答案（來源: 資料庫）: {
  gender: "neutral",
  scent: "fresh",
  complexity: "balanced",
  ...
}
📊 答案欄位檢查: {
  dataSource: "資料庫",
  hasComplexity: true,  // 應該是 true
  hasIntensity: true,   // 應該是 true
  hasCharacter: true,   // 應該是 true
  hasOccasion: true,    // 應該是 true
  allFields: [...7 個欄位...]
}
```

## ✅ 修復完成

現在每次做測驗都會：
- ✅ 自動覆蓋舊的 quiz_answers
- ✅ 不需要手動刪除
- ✅ 確保使用最新的測驗結果

請清除 localStorage 並重新測驗，應該可以正確覆蓋了！
