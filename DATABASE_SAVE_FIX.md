# 資料庫儲存修復

## 問題
測驗答案沒有正確儲存到資料庫

## ✅ 修復內容

### 1. 改進 `saveUserProfile` 函數
**文件**: `lib/user-data-service.ts`

**修改前**:
\`\`\`typescript
const { error } = await supabase.from("user_profiles").upsert(profile)
\`\`\`

**修改後**:
\`\`\`typescript
// 準備要儲存的數據，確保 quiz_answers 作為 JSONB
const dataToSave = {
  id: profile.id,
  updated_at: new Date().toISOString(),
  ...(profile.name && { name: profile.name }),
  ...(profile.phone && { phone: profile.phone }),
  ...(profile.address && { address: profile.address }),
  ...(profile.city && { city: profile.city }),
  ...(profile.postal_code && { postal_code: profile.postal_code }),
  ...(profile.country && { country: profile.country }),
  ...(profile.quiz_answers && { quiz_answers: profile.quiz_answers }),
}

console.log("📦 準備儲存到資料庫的數據:", JSON.stringify(dataToSave, null, 2))

const { error } = await supabase.from("user_profiles").upsert(dataToSave, { onConflict: 'id' })
\`\`\`

### 2. 添加詳細日誌
- ✅ 顯示準備儲存的完整數據
- ✅ 顯示 upsert 操作的結果
- ✅ 驗證儲存後的數據

### 3. 自動檢測舊格式數據
**文件**: `app/recommendations/page.tsx`

當載入推薦頁面時：
\`\`\`typescript
// 檢查是否為舊格式的答案（缺少新欄位）
const isOldFormat = !storedProfile.complexity && !storedProfile.intensity && !storedProfile.character && !storedProfile.occasion
if (isOldFormat) {
  console.log("⚠️ 檢測到舊格式的測驗答案，需要重新測驗")
  // 清除舊數據
  UserStorage.clearQuizAnswers(user.id)
  UserStorage.clearRecommendations(user.id)
  setShowQuizPrompt(true)
  return
}
\`\`\`

## 🔍 測試步驟

### 1. 清除舊數據
在瀏覽器控制台執行：
\`\`\`javascript
// 清除所有 localStorage 中的測驗數據
Object.keys(localStorage).forEach(key => {
  if (key.includes('quiz') || key.includes('recommendations')) {
    console.log('清除:', key)
    localStorage.removeItem(key)
  }
})
\`\`\`

### 2. 重新完成測驗
1. 訪問 `/quiz`
2. 完成所有 7 個問題
3. 觀察控制台日誌

### 3. 預期日誌

#### 測驗完成時（quiz/page.tsx）:
\`\`\`
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
\`\`\`

#### 在伺服器端（user-data-service.ts）:
\`\`\`
💾 Attempting to save user profile for ID: xxx
📝 Profile data: {
  "id": "xxx",
  "quiz_answers": {
    "gender": "neutral",
    "scent": "fresh",
    "complexity": "balanced",
    "intensity": "moderate",
    "character": "contemporary",
    "mood": "calm",
    "occasion": "casual"
  }
}
📦 準備儲存到資料庫的數據: {...}
✅ User profile saved and verified successfully
\`\`\`

#### 在推薦頁面（recommendations/page.tsx）:
\`\`\`
✅ 從資料庫載入測驗答案: {
  gender: "neutral",
  scent: "fresh",
  complexity: "balanced",
  ...
}
📊 答案欄位檢查: {
  hasGender: true,
  hasScent: true,
  hasComplexity: true,
  hasIntensity: true,
  hasCharacter: true,
  hasMood: true,
  hasOccasion: true
}
\`\`\`

## 🔧 如果仍然失敗

### 檢查資料庫欄位
在 Supabase SQL Editor 執行：
\`\`\`sql
-- 檢查 quiz_answers 欄位是否存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'quiz_answers';
\`\`\`

應該看到：
\`\`\`
column_name   | data_type
quiz_answers  | jsonb
\`\`\`

### 如果欄位不存在
執行以下 SQL：
\`\`\`sql
ALTER TABLE user_profiles 
ADD COLUMN quiz_answers JSONB;
\`\`\`

## ✅ 完成！

現在測驗答案應該可以正確儲存到資料庫：
- ✅ 添加詳細日誌追蹤
- ✅ 確保 JSONB 格式正確
- ✅ 自動檢測並清除舊格式數據
- ✅ 明確的 upsert 衝突處理

請清除 localStorage 並重新完成測驗，查看控制台日誌！
