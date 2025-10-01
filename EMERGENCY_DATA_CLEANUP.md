# 緊急數據清理指南

## 問題確認
舊的測驗答案（feel, mood, vibe, scent, gender）一直存在，新的測驗答案無法覆蓋。

## 🚨 緊急修復步驟

### 步驟 1: 清除資料庫中的舊數據

**在 Supabase SQL Editor 中執行**：
```sql
-- 清除所有用戶的舊測驗答案
UPDATE user_profiles 
SET quiz_answers = NULL
WHERE quiz_answers IS NOT NULL;

-- 驗證清除結果
SELECT id, name, quiz_answers 
FROM user_profiles;
```

或者直接執行：`scripts/24-clear-old-quiz-answers.sql`

### 步驟 2: 清除瀏覽器 localStorage

**在瀏覽器控制台（F12）執行**：
```javascript
// 清除所有 sceut 相關數據
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sceut_')) {
    console.log('清除:', key)
    localStorage.removeItem(key)
  }
})

// 刷新頁面
location.reload()
```

### 步驟 3: 重新完成測驗

1. 訪問 `/quiz`
2. 完成所有 7 個問題：
   - 性別光譜
   - 香調家族
   - 香氣複雜度
   - 香氣強度
   - 風格特質
   - 情緒氛圍
   - 使用場合

3. **觀察控制台日誌**

### 步驟 4: 驗證儲存

#### 在瀏覽器控制台應該看到：
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
🔄 嘗試保存到 Supabase 數據庫...
📝 準備儲存的答案: {...}
✅ 測驗答案已成功保存到數據庫
```

#### 在終端應該看到：
```
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
```

#### 在推薦頁面應該看到：
```
✅ 測驗答案（來源: 資料庫）: {
  gender: "neutral",
  scent: "fresh",
  complexity: "balanced",
  ...
}
📊 答案欄位檢查: {
  dataSource: "資料庫",
  hasComplexity: true,
  hasIntensity: true,
  hasCharacter: true,
  hasOccasion: true,
  allFields: ["gender", "scent", "complexity", "intensity", "character", "mood", "occasion"]
}
```

## 🎯 執行順序

**請按順序執行**：

1. ✅ **步驟 1**: 在 Supabase 清除資料庫
2. ✅ **步驟 2**: 在瀏覽器清除 localStorage  
3. ✅ **步驟 3**: 重新完成測驗
4. ✅ **步驟 4**: 查看推薦結果

## 📋 檢查清單

完成後請確認：
- [ ] 資料庫中的 `quiz_answers` 欄位包含 7 個新欄位
- [ ] 推薦頁面顯示 7 個香氣偏好（不是 3-5 個）
- [ ] 顯示正確的性別選擇（中性而不是女性化）
- [ ] 沒有顯示 "playful", "feel", "vibe" 等舊欄位
- [ ] AI 推薦正確顯示
- [ ] 顏色使用莫蘭迪色調

## ⚠️ 重要提醒

**必須兩個都清除**：
- 資料庫中的舊數據
- localStorage 中的舊數據

如果只清除一個，另一個的舊數據仍會被載入！

## 🔍 如果還是失敗

請提供：
1. 執行步驟 1 後，Supabase 的查詢結果
2. 執行步驟 2 後，控制台顯示清除了哪些 key
3. 執行步驟 3 時，完整的控制台日誌
4. 執行步驟 3 時，完整的終端日誌

立即開始步驟 1！在 Supabase SQL Editor 執行清除腳本！
