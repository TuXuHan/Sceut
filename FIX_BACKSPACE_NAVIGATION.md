# 修復 Backspace 跳頁問題

## 問題
按下 Backspace 刪除字符時會跳到上一頁

## ✅ 修復方案

### 核心邏輯：
1. **在輸入框中**：允許刪除，但阻止事件冒泡
2. **在頁面其他地方**：完全阻止 Backspace

### 修復代碼：
\`\`\`typescript
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Backspace') {
    const target = event.target as HTMLElement
    
    // 檢查是否在可編輯元素中
    const isInput = target instanceof HTMLInputElement
    const isTextArea = target instanceof HTMLTextAreaElement
    const isContentEditable = target.contentEditable === 'true' || target.isContentEditable
    
    const isEditable = isInput || isTextArea || isContentEditable
    
    if (isEditable) {
      // 在可編輯元素中，允許正常刪除，但阻止事件冒泡
      event.stopPropagation()
      return
    } else {
      // 不在可編輯元素中，完全阻止
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      return false
    }
  }
}
\`\`\`

## 🎯 現在的行為

- ✅ **在輸入框中**：可以正常刪除文字，不會跳頁
- ❌ **在頁面其他地方**：不會跳頁

## 🔍 測試

1. 在輸入框中按 Backspace → 應該刪除文字，不跳頁
2. 在頁面其他地方按 Backspace → 不跳頁

問題應該解決了！
