# 測驗答案資料庫儲存功能

## ✅ 完成的功能

### 1. 資料庫遷移
**文件**: `scripts/23-add-quiz-answers.sql`

添加 `quiz_answers` 欄位到 `user_profiles` 表：
\`\`\`sql
ALTER TABLE user_profiles 
ADD COLUMN quiz_answers JSONB;
\`\`\`

### 2. Quiz 頁面儲存
**文件**: `app/quiz/page.tsx`

測驗完成時：
1. ✅ 保存到 localStorage（現有功能，保持不變）
2. ✅ 調用 `saveUserProfile` 保存到資料庫
3. ✅ 跳轉到推薦頁面

\`\`\`typescript
// 保存新的測驗答案到用戶存儲
UserStorage.setQuizAnswers(user.id, newAnswers)

// 保存到 Supabase 數據庫
const result = await saveUserProfile({
  id: user.id,
  quiz_answers: newAnswers,
})
\`\`\`

### 3. Recommendations 頁面載入
**文件**: `app/recommendations/page.tsx`

載入答案時的優先順序：
1. **優先從資料庫載入** - 調用 `/api/profile/get`
2. **備用從 localStorage 載入** - 如果資料庫沒有
3. **同步到 localStorage** - 資料庫載入成功後同步

\`\`\`typescript
// 優先從資料庫獲取用戶的測驗答案
const response = await fetch(`/api/profile/get?userId=${user.id}`)
if (response.ok) {
  const data = await response.json()
  if (data.profile?.quiz_answers) {
    storedProfile = data.profile.quiz_answers
    // 同步到 localStorage
    UserStorage.setQuizAnswers(user.id, storedProfile)
  }
}

// 如果資料庫沒有，從 localStorage 載入
if (!storedProfile) {
  storedProfile = UserStorage.getQuizAnswers(user.id)
}
\`\`\`

### 4. API 更新
**文件**: `app/api/profile/update/route.ts`

支持更新 `quiz_answers` 欄位：
\`\`\`typescript
if (profileData.quiz_answers !== undefined) {
  updateData.quiz_answers = profileData.quiz_answers
}
\`\`\`

## 🎯 完整流程

### 測驗 → 儲存 → 推薦流程：

1. **用戶完成測驗**
   - 在 `/quiz` 頁面回答所有問題
   
2. **儲存答案**
   - ✅ 保存到 localStorage（即時備份）
   - ✅ 保存到資料庫 `user_profiles.quiz_answers`
   
3. **跳轉到推薦頁面**
   - 自動跳轉到 `/recommendations`
   
4. **載入答案**
   - ✅ 優先從資料庫載入
   - ✅ 備用從 localStorage 載入
   - ✅ 同步到 localStorage
   
5. **生成推薦**
   - ✅ 調用 `/api/recommendations` API
   - ✅ 傳入測驗答案
   - ✅ AI 分析並生成個性化推薦
   
6. **顯示結果**
   - 顯示 AI 生成的香水推薦

## 📊 數據格式

### quiz_answers 欄位（JSONB）:
\`\`\`json
{
  "gender": "feminine",
  "scent": "floral",
  "complexity": "balanced",
  "intensity": "moderate",
  "character": "contemporary",
  "mood": "calm",
  "occasion": "formal"
}
\`\`\`

## 🔄 雙重儲存策略

### 為什麼使用雙重儲存：
1. **localStorage**:
   - ✅ 即時備份
   - ✅ 離線可用
   - ✅ 快速讀取

2. **Supabase 資料庫**:
   - ✅ 持久化儲存
   - ✅ 跨設備同步
   - ✅ 數據安全

## 📝 使用步驟

### 步驟 1: 執行資料庫遷移
在 Supabase SQL Editor 中執行：
\`\`\`sql
-- scripts/23-add-quiz-answers.sql
\`\`\`

### 步驟 2: 測試功能
1. 訪問 `/quiz` 完成測驗
2. 觀察控制台日誌：
   \`\`\`
   💾 保存測驗答案...
   ✅ 答案已保存到 localStorage
   🔄 嘗試保存到 Supabase 數據庫...
   ✅ 測驗答案已成功保存到數據庫
   🚀 跳轉到推薦頁面...
   \`\`\`

3. 在推薦頁面觀察日誌：
   \`\`\`
   🔍 載入推薦結果...
   ✅ 從資料庫載入測驗答案: {...}
   🤖 開始AI分析，生成個人化推薦...
   \`\`\`

### 步驟 3: 驗證資料庫
執行 SQL 查詢：
\`\`\`sql
SELECT id, name, quiz_answers 
FROM user_profiles 
WHERE id = '你的用戶ID';
\`\`\`

應該看到 `quiz_answers` 欄位包含測驗答案的 JSON 數據。

## ✅ 完成！

測驗答案現在會：
- ✅ 儲存到資料庫（持久化）
- ✅ 從資料庫載入（跨設備同步）
- ✅ 傳給 AI 推薦生成個性化結果
- ✅ 雙重儲存策略（資料庫 + localStorage）

完整的測驗和推薦流程已經建立！🎉
