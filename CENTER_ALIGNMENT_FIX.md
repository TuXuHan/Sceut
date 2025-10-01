# 選項置中修復

## ✅ 修復內容

### 核心改進：添加 `justify-items-center`

**修改前**:
```tsx
<div className={cn(
  "grid gap-4 md:gap-6 w-full",
  currentStepData.options.length > 2
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto",
)}>
```

**問題**: 3 個選項時會左對齊，不居中

**修改後**:
```tsx
<div className={cn(
  "grid gap-4 md:gap-6 w-full justify-items-center",
  currentStepData.options.length === 2
    ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
    : currentStepData.options.length === 3
    ? "grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto",
)}>
```

## 🎯 改進說明

### 1. 添加 `justify-items-center`
- ✅ 讓網格中的每個項目都居中對齊
- ✅ 解決左對齊的問題

### 2. 針對不同選項數量優化
- **2 個選項**: 
  - 手機：1 列
  - 平板+：2 列
  - 最大寬度：2xl
  
- **3 個選項**:
  - 手機：1 列
  - 平板+：3 列
  - 最大寬度：4xl
  
- **4+ 個選項**:
  - 手機：2 列
  - 平板：3 列
  - 桌面：4 列
  - 最大寬度：5xl

### 3. 容器居中
- ✅ 使用 `mx-auto` 讓網格容器居中
- ✅ 根據選項數量調整最大寬度
- ✅ 避免選項過於分散

## ✅ 完成！

現在所有選項都完美居中了：
- ✅ 每個選項卡片居中
- ✅ 整個網格容器居中
- ✅ 標題居中
- ✅ Header 居中

完美的置中效果！🎉
