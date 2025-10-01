# 清除舊數據完整指南

## 問題確認
從終端日誌可以看出，AI 收到的是舊的測驗答案：
\`\`\`javascript
{
  feel: 'playful',      // 舊格式
  mood: 'playful',      // 舊格式
  vibe: 'soft',         // 舊格式
  scent: 'fresh',
  gender: 'feminine'
}
\`\`\`

**新格式應該是**：
\`\`\`javascript
{
  gender: "neutral",
  scent: "fresh",
  complexity: "balanced",  // 新問題
  intensity: "moderate",   // 新問題
  character: "modern",     // 新問題
  mood: "calm",
  occasion: "casual"       // 新問題
}
\`\`\`

## 🔧 解決方案

### 步驟 1: 清除所有舊數據

**在瀏覽器控制台（F12）執行**：
\`\`\`javascript
// 1. 查看所有 localStorage 的 key
console.log("所有 localStorage keys:")
Object.keys(localStorage).forEach(k => console.log(k))

// 2. 清除所有 sceut 相關的數據
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sceut_')) {
    console.log('清除:', key)
    localStorage.removeItem(key)
  }
})

// 3. 確認清除成功
console.log("清除後剩餘的 keys:")
Object.keys(localStorage).forEach(k => console.log(k))

// 4. 刷新頁面
location.href = '/quiz'
\`\`\`

### 步驟 2: 完成新測驗

1. 頁面會自動跳轉到 `/quiz`
2. 完成所有 7 個新問題
3. **仔細觀察控制台日誌**

### 步驟 3: 檢查日誌

#### 測驗完成時應該看到：
\`\`\`
🎉 測驗完成！開始保存答案...
最終答案: {
  gender: "neutral",      // 您選擇的值
  scent: "fresh",         // 您選擇的值
  complexity: "balanced", // 您選擇的值
  intensity: "moderate",  // 您選擇的值
  character: "modern",    // 您選擇的值
  mood: "calm",          // 您選擇的值
  occasion: "casual"     // 您選擇的值
}
💾 保存測驗答案...
✅ 答案已保存到 localStorage
🔄 嘗試保存到 Supabase 數據庫...
📝 準備儲存的答案: {...} // 應該包含 7 個欄位
\`\`\`

#### 在伺服器端（終端）應該看到：
\`\`\`
💾 Attempting to save user profile for ID: xxx
📝 Profile data: {
  "id": "xxx",
  "quiz_answers": {
    "gender": "neutral",
    "scent": "fresh",
    "complexity": "balanced",
    "intensity": "moderate",
    "character": "modern",
    "mood": "calm",
    "occasion": "casual"
  }
}
📦 準備儲存到資料庫的數據: {...}
✅ User profile saved and verified successfully
\`\`\`

#### 在推薦頁面應該看到：
\`\`\`
🔍 嘗試從資料庫載入...
📡 API 回應狀態: 200
📥 API 返回的完整數據: {...}
📦 quiz_answers 欄位: {
  gender: "neutral",
  scent: "fresh",
  complexity: "balanced",
  ...
}
✅ 從資料庫載入測驗答案: {...}
📊 答案欄位檢查: {
  dataSource: "資料庫",
  hasGender: true,
  hasScent: true,
  hasComplexity: true,
  hasIntensity: true,
  hasCharacter: true,
  hasMood: true,
  hasOccasion: true,
  allFields: ["gender", "scent", "complexity", "intensity", "character", "mood", "occasion"]
}
\`\`\`

### 步驟 4: 如果還是舊數據

**請提供以下完整日誌**：

1. **測驗完成時的日誌** - 從 "🎉 測驗完成" 開始的所有日誌
2. **伺服器端日誌** - 終端中的 saveUserProfile 相關日誌
3. **推薦頁面載入日誌** - 從 "🔍 載入推薦結果" 開始的所有日誌

## ✅ 執行步驟

**請現在就執行步驟 1（清除 localStorage）**：

1. 按 F12 打開控制台
2. 複製貼上上面的 JavaScript 代碼
3. 執行
4. 重新完成測驗
5. 提供完整的控制台日誌和終端日誌

這樣我可以精確找出問題所在！
