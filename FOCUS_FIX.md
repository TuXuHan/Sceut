# 輸入框失焦問題修復

## 問題分析
您說得完全正確！整個欄位選擇邏輯有問題。

### 問題原因：
1. 每次在輸入框中輸入字符
2. `handleAddressFormChange` 更新 `profile` 狀態
3. `profile` 更新觸發 `useMemo` 重新計算 `initialData`
4. `AddressForm` 檢測到 `initialData` 變化
5. `useEffect` 重新設置 `formData`
6. 輸入框失去焦點，焦點跳到 BODY

## ✅ 修復方案

使用 `originalProfile` 而不是 `profile` 作為 `initialData` 的依賴：

```typescript
// 使用 useMemo 穩定 AddressForm 的 initialData
// 只在組件首次加載時設置，之後不再更新，避免失焦
const addressFormInitialData = useMemo(() => ({
  deliveryMethod: "" as "" | "711" | "home",
  city: originalProfile.city,
  store711: originalProfile["711"] || "",
  fullAddress: originalProfile.address || "",
  postalCode: originalProfile.postal_code,
}), [originalProfile.city, originalProfile["711"], originalProfile.address, originalProfile.postal_code])
```

### 為什麼這樣可以解決問題：
- `originalProfile` 只在數據從服務器加載時更新
- 用戶在輸入框中輸入時，只更新 `profile`，不更新 `originalProfile`
- 因此 `initialData` 保持穩定，不會觸發 `AddressForm` 重新設置
- 輸入框保持焦點

## 🎯 預期結果

- ✅ 在輸入框中可以連續輸入
- ✅ 在輸入框中可以連續按 Backspace 刪除
- ✅ 焦點保持在輸入框中
- ✅ 不會跳出欄位

現在應該可以正常編輯了！
