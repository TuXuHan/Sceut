# 修復舊測驗數據問題

## 問題
頁面顯示的是舊的測驗答案：
- ❌ 選擇了「中性」但顯示「女性化」
- ❌ 顯示 "playful"（舊的問題格式）
- ❌ 只有 3 個偏好而不是 7 個

## 原因
localStorage 中儲存了舊的測驗答案，新的答案沒有覆蓋掉舊數據。

## ✅ 修復方案

### 1. 改進「重新測試」功能
\`\`\`typescript
const handleRetakeQuiz = () => {
  if (user) {
    // 清除本地存儲
    UserStorage.clearQuizAnswers(user.id)
    UserStorage.clearRecommendations(user.id)
    
    // 清除當前頁面狀態
    setUserProfile(null)
    setRecommendations([])
    setAiAnalysis("")
  }
  router.push("/quiz")
}
\`\`\`

### 2. 添加詳細的儲存日誌
在 quiz/page.tsx 中添加日誌，確認儲存的內容：
\`\`\`
📝 準備儲存的答案: {...}
✅ 儲存的內容: {
  gender: "neutral",      // 應該是您選擇的值
  scent: "fresh",
  complexity: "balanced", // 新問題
  intensity: "moderate",  // 新問題
  character: "modern",    // 新問題
  mood: "calm",
  occasion: "casual"      // 新問題
}
\`\`\`

## 🔧 解決步驟

### 方法 1：使用「重新測試」按鈕（推薦）
1. 在推薦頁面點擊「重新測試」按鈕
2. 完成新的 7 個問題測驗
3. 觀察控制台日誌，確認儲存了 7 個欄位
4. 返回推薦頁面，應該顯示正確的結果

### 方法 2：手動清除 localStorage（如果方法 1 無效）
在瀏覽器控制台執行：
\`\`\`javascript
// 查看所有儲存的 key
Object.keys(localStorage).filter(k => k.includes('sceut'))

// 清除測驗答案和推薦
Object.keys(localStorage).forEach(key => {
  if (key.includes('quiz_answers') || key.includes('recommendations')) {
    localStorage.removeItem(key)
  }
})

// 刷新頁面
location.reload()
\`\`\`

### 方法 3：檢查資料庫（驗證是否正確儲存）
在 Supabase SQL Editor 執行：
\`\`\`sql
SELECT id, name, quiz_answers 
FROM user_profiles 
WHERE id = '你的用戶ID';
\`\`\`

應該看到：
\`\`\`json
{
  "gender": "neutral",
  "scent": "fresh",
  "complexity": "balanced",
  "intensity": "moderate",
  "character": "contemporary",
  "mood": "calm",
  "occasion": "casual"
}
\`\`\`

## 🔍 調試檢查清單

### 在控制台查看：
1. **測驗完成時**：
   - [ ] 看到 `📝 準備儲存的答案`
   - [ ] 看到 `✅ 儲存的內容` 包含 7 個欄位
   - [ ] 看到 `✅ 測驗答案已成功保存到數據庫`

2. **推薦頁面載入時**：
   - [ ] 看到 `✅ 從資料庫載入測驗答案` 或 `📱 從本地存儲載入測驗答案`
   - [ ] 看到 `✅ 測驗答案` 包含正確的 7 個欄位值
   - [ ] 看到 `🔍 推薦頁面狀態` 中 userProfile 包含正確的值

### 如果看到舊數據：
- localStorage 優先於資料庫被載入
- 需要清除 localStorage 強制從資料庫重新載入

## ✅ 快速修復

請執行以下步驟：
1. 點擊「重新測試」按鈕
2. 完成所有 7 個新問題
3. 檢查控制台，確認儲存了正確的答案
4. 查看推薦頁面，應該顯示正確的結果

如果還是顯示舊數據，請提供完整的控制台日誌！
