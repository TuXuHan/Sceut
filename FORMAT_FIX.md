# API 格式修復

## 問題診斷

從日誌可以看出問題：
```
📋 推薦詳情: {
  brands: Array(3),      // 推薦在這裡
  analysis: "..."        // AI 分析文字
}
📊 推薦數量: undefined   // 因為沒有 .length 屬性
```

## ✅ 修復內容

### 1. API 格式轉換
**文件**: `/app/api/recommendations/route.ts`

**問題**: `getGeminiRecommendations` 返回:
```javascript
{
  brands: [{...}, {...}, {...}],
  analysis: "..."
}
```

**前端期望**:
```javascript
{
  success: true,
  recommendations: [{...}, {...}, {...}]
}
```

**修復**: 在 API 中轉換格式
```typescript
const result = await getGeminiRecommendations(quizAnswers)

// 轉換格式
const recommendations = result.brands?.map((brand: any) => ({
  id: brand.id || brand.name,
  name: brand.name,
  brand: brand.name,
  description: brand.reason || brand.description || "",
  notes: brand.notes || { top: [], middle: [], base: [] },
  personality: brand.personality || [],
  image: brand.image || "/images/perfume-default.png",
  price: brand.price || 0,
  rating: brand.rating || 0,
  match_percentage: brand.match_percentage || 85,
})) || []

return NextResponse.json({
  success: true,
  recommendations,
  analysis: result.analysis
})
```

### 2. 顯示 AI 分析文字
**文件**: `/app/recommendations/page.tsx`

**新增**:
- ✅ `aiAnalysis` 狀態
- ✅ 從 API 獲取分析文字
- ✅ 在頁面上顯示 AI 分析

```tsx
{aiAnalysis && (
  <div className="mb-12">
    <h3>AI 香氣分析</h3>
    <p>{aiAnalysis}</p>
  </div>
)}
```

## 🎯 預期結果

重新載入頁面後應該看到：

### 控制台日誌:
```
📊 推薦結果格式: {
  hasBrands: true,
  brandsCount: 3,
  hasAnalysis: true
}
✅ AI 推薦生成成功: 3 個
📋 推薦詳情: [
  { id: "...", name: "...", brand: "Calvin Klein", ... },
  { id: "...", name: "...", brand: "蒂普提克", ... },
  { id: "...", name: "...", brand: "Aesop", ... }
]
📊 推薦數量: 3
```

### 頁面顯示:
1. **您的香氣偏好** - 測驗結果（應該顯示所有有值的欄位）
2. **AI 香氣分析** - AI 生成的分析文字
3. **為您精選的香水品牌** - 3 個推薦卡片
   - Calvin Klein
   - 蒂普提克
   - Aesop

## ✅ 完成！

現在 AI 推薦應該可以正確顯示了！請重新載入頁面測試。
