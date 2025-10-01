# 頁面跳轉修復

## 問題
測驗完成後頁面卡在"正在保存您的答案..."，一直轉圈圈，不跳轉到推薦頁面

## 原因
`finally` 區塊在跳轉前執行 `setSaving(false)`，導致頁面狀態混亂

## ✅ 修復內容

### 移除 finally 區塊
**修改前**:
```typescript
try {
  // 保存邏輯
  router.push("/recommendations")
} finally {
  setSaving(false)  // 這會在跳轉前執行
}
```

**修改後**:
```typescript
try {
  // 保存邏輯
  console.log("🚀 跳轉到推薦頁面...")
  router.push("/recommendations")
  // 不設置 setSaving(false)，讓頁面保持 loading 狀態直到跳轉完成
} catch (error) {
  router.push("/recommendations")
}
// 移除 finally 區塊
```

### 改進跳轉邏輯
- ✅ 移除 `setTimeout` 延遲
- ✅ 直接執行 `router.push`
- ✅ 保持 `saving` 狀態直到頁面跳轉
- ✅ 無論儲存成功或失敗都跳轉

## 🎯 工作流程

1. **用戶完成最後一個問題**
2. **設置 `setSaving(true)`** - 顯示"正在保存您的答案..."
3. **保存到 localStorage** - 立即備份
4. **保存到資料庫** - 嘗試持久化
5. **直接跳轉** - `router.push("/recommendations")`
6. **保持 loading 狀態** - 直到新頁面載入

## 📊 預期行為

### 測驗完成時:
```
🎉 測驗完成！開始保存答案...
最終答案: {...}
💾 保存測驗答案...
✅ 答案已保存到 localStorage
🔄 嘗試保存到 Supabase 數據庫...
💾 直接儲存到資料庫: {...}
✅ 測驗答案已成功保存到數據庫
✅ 儲存後的數據: [...]
🚀 跳轉到推薦頁面... (資料庫儲存成功)
```

### 頁面狀態:
1. 顯示"正在保存您的答案..." （轉圈圈）
2. 保存完成
3. 立即跳轉到推薦頁面
4. 不會卡住

## ✅ 完成！

現在測驗完成後應該會：
- ✅ 顯示保存中狀態
- ✅ 快速保存數據
- ✅ 立即跳轉到推薦頁面
- ✅ 不會卡住轉圈圈

請重新測試！
