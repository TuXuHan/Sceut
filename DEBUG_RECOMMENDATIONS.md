# 推薦結果調試指南

## 問題
- 測驗結果只顯示 3 個偏好（應該顯示 7 個）
- 推薦香水沒有顯示在頁面上（但伺服器端有 Log）

## 🔍 調試步驟

### 1. 檢查瀏覽器控制台
重新載入推薦頁面，應該看到以下日誌：

\`\`\`
🔍 載入推薦結果...
✅ 從資料庫載入測驗答案: {...}  或
📱 從本地存儲載入測驗答案

✅ 測驗答案: {
  gender: "...",
  scent: "...",
  complexity: "...",  // 這個欄位應該存在
  intensity: "...",   // 這個欄位應該存在
  character: "...",   // 這個欄位應該存在
  mood: "...",
  occasion: "..."     // 這個欄位應該存在
}

🔄 沒有有效推薦結果，生成新的推薦...
📞 調用 generateRecommendations...
🤖 開始AI分析，生成個人化推薦...
📥 API 返回數據: {...}
✅ AI 推薦生成成功: 3 個
📋 推薦詳情: [...]
📦 收到推薦結果: [...]
📊 推薦數量: 3
✅ 推薦狀態已更新

🔍 推薦頁面狀態: {
  hasUserProfile: true,
  userProfile: {...},
  recommendationsCount: 3,
  recommendations: [...]
}
\`\`\`

### 2. 檢查測驗答案
如果測驗答案中缺少新欄位（complexity, intensity, character, occasion），表示：

**原因**: 使用的是舊的測驗答案

**解決方案**: 重新完成測驗
1. 點擊「重新測試」按鈕
2. 完成新的 7 個問題測驗
3. 查看是否正確儲存

### 3. 檢查推薦結果
如果 `recommendationsCount: 0`，表示：

**可能原因**:
- API 返回格式不正確
- AI 生成失敗且備用推薦也失敗
- 狀態更新失敗

**檢查**:
- 查看 `📥 API 返回數據` 的內容
- 查看是否有錯誤訊息
- 查看 `📦 收到推薦結果` 是否為空

## 🔧 可能的問題和解決方案

### 問題 1: 測驗答案格式舊
**症狀**: 只顯示 3 個偏好，mood 顯示 "playful"

**解決**: 重新完成測驗
\`\`\`
1. 點擊「重新測試」
2. 完成所有 7 個新問題
3. 答案會包含所有新欄位
\`\`\`

### 問題 2: API 返回格式不對
**症狀**: 伺服器有 Log 但頁面沒顯示

**檢查**: 
\`\`\`typescript
// API 應該返回這個格式
{
  success: true,
  recommendations: [
    {
      id: string,
      name: string,
      brand: string,
      description: string,
      notes: { top: [], middle: [], base: [] },
      personality: [],
      image: string,
      price: number,
      rating: number,
      match_percentage: number
    }
  ]
}
\`\`\`

### 問題 3: localStorage 快取問題
**症狀**: 使用舊的快取數據

**解決**: 清除快取
\`\`\`typescript
// 在控制台執行
localStorage.removeItem('sceut_[userId]_recommendations')
localStorage.removeItem('sceut_[userId]_quiz_answers')
\`\`\`

## 📋 請提供以下信息

1. **完整的控制台日誌** - 從頁面載入到顯示的所有日誌
2. **測驗答案內容** - `userProfile` 的完整內容
3. **推薦結果內容** - `recommendations` 陣列的內容
4. **是否有錯誤訊息** - 紅色的錯誤日誌

根據這些信息，我可以精準定位問題並修復！
