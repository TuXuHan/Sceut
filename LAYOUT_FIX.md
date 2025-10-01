# 測驗頁面排版修復

## ✅ 修復內容

### 1. 垂直水平置中
**修改前**:
\`\`\`tsx
<div className="flex-1 px-4 md:px-6 pb-8 md:pb-12 flex flex-col">
  <div className="h-full flex flex-col flex-1">
    ...
  </div>
</div>
\`\`\`

**修改後**:
\`\`\`tsx
<div className="flex-1 px-4 md:px-6 pb-8 md:pb-12 flex items-center justify-center">
  <div className="w-full max-w-6xl">
    ...
  </div>
</div>
\`\`\`

### 2. 改進網格佈局
**修改前**:
\`\`\`tsx
className={cn(
  "grid gap-4 md:gap-6 max-w-6xl mx-auto w-full",
  currentStepData.options.length > 2
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
    : "grid-cols-1 sm:grid-cols-2",
)}
\`\`\`

**修改後**:
\`\`\`tsx
className={cn(
  "grid gap-4 md:gap-6 w-full",
  currentStepData.options.length > 2
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto",
)}
\`\`\`

## 🎯 改進說明

### 垂直置中：
- ✅ 使用 `flex items-center justify-center`
- ✅ 內容在頁面中垂直居中
- ✅ 更好的視覺平衡

### 水平置中：
- ✅ 內容容器 `max-w-6xl` 限制最大寬度
- ✅ 2 個選項時使用 `max-w-2xl mx-auto` 更緊湊
- ✅ 選項網格自動居中

### 響應式佈局：
- **2 個選項**: 1 列（手機）→ 2 列（平板+）
- **3-4 個選項**: 2 列（手機）→ 3 列（平板）→ 4 列（桌面）

## ✅ 完成！

所有選項現在都垂直水平置中了！🎉
