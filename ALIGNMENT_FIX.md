# 網頁對齊修復

## ✅ 修復內容

### 1. 刪除圖片圖示
- ❌ 移除了所有 `Image` 組件
- ❌ 移除了 `import Image from "next/image"`
- ✅ 恢復使用 CSS 圖示

### 2. Header 對齊修復
**修改前**:
```tsx
<header className="... flex items-center justify-between ...">
  <button>返回</button>
  <div className="text-center">標題</div>
  {currentStep > 0 && <div>步驟</div>}
</header>
```

**問題**: 第一步時右側沒有元素，導致標題偏左

**修改後**:
```tsx
<header className="... flex items-center justify-between ...">
  <button>返回</button>
  <div className="text-center flex-1">標題</div>
  <div className="w-10 h-10 ...">
    {currentStep > 0 ? `步驟` : ''}
  </div>
</header>
```

**改進**:
- ✅ 左側：固定寬度按鈕 (w-10/w-12)
- ✅ 中間：`flex-1` 讓標題佔據剩餘空間並居中
- ✅ 右側：固定寬度容器 (w-10/w-12)，永遠存在，只是第一步時是空的
- ✅ 左右對稱，標題完美居中

## 🎯 對齊邏輯

### Header 結構:
```
[返回按鈕 40px] [標題 flex-1 居中] [步驟顯示 40px]
```

### 所有頁面狀態:
- **第一步**: `[返回] [標題] [空]` - 左右寬度一樣
- **其他步驟**: `[返回] [標題] [1/7]` - 左右寬度一樣

### 內容區域:
- ✅ 使用 `flex items-center justify-center` 垂直居中
- ✅ 內容容器 `max-w-6xl` 限制寬度
- ✅ 選項網格自動居中

## ✅ 完成！

現在左右寬度完全一樣，標題完美居中！🎉
