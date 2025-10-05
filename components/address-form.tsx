"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MapPin, Store, Truck } from "lucide-react"

interface AddressFormData {
  deliveryMethod: "711" | "home" | ""
  city: string
  store711: string
  fullAddress: string
  postalCode: string
}

interface AddressFormProps {
  initialData?: Partial<AddressFormData>
  onDataChange?: (data: AddressFormData, isValid: boolean) => void
  showTitle?: boolean
}

export default function AddressForm({ 
  initialData = {}, 
  onDataChange,
  showTitle = true 
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    deliveryMethod: "",
    city: "",
    store711: "",
    fullAddress: "",
    postalCode: "",
  })

  const [hasInitialized, setHasInitialized] = useState(false) // 標記是否已初始化

  // 驗證表單是否完整
  const validateForm = (data: AddressFormData): boolean => {
    if (!data.deliveryMethod) return false
    
    if (data.deliveryMethod === "711") {
      // 7-11配送：必填縣市和門市名稱
      return !!(data.city.trim() && data.store711.trim())
    } else if (data.deliveryMethod === "home") {
      // 宅配：必填完整地址（郵遞區號為選填）
      return !!(data.fullAddress.trim())
    }
    
    return false
  }

  // 只在首次掛載時，如果有 initialData 就初始化（只執行一次）
  useEffect(() => {
    if (!hasInitialized && initialData.deliveryMethod) {
      setFormData({
        deliveryMethod: initialData.deliveryMethod || "",
        city: initialData.city || "",
        store711: initialData.store711 || "",
        fullAddress: initialData.fullAddress || "",
        postalCode: initialData.postalCode || "",
      })
      setHasInitialized(true)
    }
  }, []) // 空依賴 - 只在掛載時檢查一次

  // 當表單資料變更時，通知父組件
  useEffect(() => {
    const isValid = validateForm(formData)
    onDataChange?.(formData, isValid)
  }, [formData]) // 移除 onDataChange 依賴項

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDeliveryMethodChange = (value: string) => {
    const method = value as "711" | "home"
    setFormData(prev => ({
      ...prev,
      deliveryMethod: method
    }))
  }

  const isFormValid = validateForm(formData)

  return (
    <Card className="border-[#E8E2D9] shadow-sm">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-light text-[#6D5C4A] tracking-wide">
            <MapPin className="w-5 h-5 mr-2" />
            配送地址設定
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {/* 配送方式選擇 */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            選擇配送方式 *
          </Label>
          <RadioGroup
            value={formData.deliveryMethod}
            onValueChange={handleDeliveryMethodChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="711" id="delivery-711" />
              <Label htmlFor="delivery-711" className="flex items-center space-x-3 cursor-pointer flex-1">
                <Store className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">7-11 超商取貨</div>
                  <div className="text-sm text-gray-500">請填寫縣市和門市名稱</div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="home" id="delivery-home" />
              <Label htmlFor="delivery-home" className="flex items-center space-x-3 cursor-pointer flex-1">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">宅配到府</div>
                  <div className="text-sm text-gray-500">請填寫完整配送地址</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* 7-11 配送表單 */}
        {formData.deliveryMethod === "711" && (
          <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Store className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">7-11 超商取貨資訊</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-light text-gray-700">
                  縣市 *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="請輸入縣市名稱"
                  className="rounded-none border-gray-300"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="store711" className="text-sm font-light text-gray-700">
                  7-11 門市名稱 *
                </Label>
                <Input
                  id="store711"
                  value={formData.store711}
                  onChange={(e) => handleInputChange("store711", e.target.value)}
                  placeholder="請輸入7-11門市名稱"
                  className="rounded-none border-gray-300"
                  required
                />
              </div>
            </div>
            
            <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
              💡 請確認門市名稱正確，以確保包裹能順利送達
            </div>
          </div>
        )}

        {/* 宅配表單 */}
        {formData.deliveryMethod === "home" && (
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">宅配地址資訊</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullAddress" className="text-sm font-light text-gray-700">
                  完整配送地址 *
                </Label>
                <Input
                  id="fullAddress"
                  value={formData.fullAddress}
                  onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                  placeholder="請輸入完整的配送地址（包含縣市、區域、街道、門牌號碼）"
                  className="rounded-none border-gray-300"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-light text-gray-700">
                  郵遞區號
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder="郵遞區號（選填）"
                  className="rounded-none border-gray-300"
                />
              </div>
            </div>
            
            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
              💡 請填寫完整且正確的地址，以確保包裹能順利送達
            </div>
          </div>
        )}

        {/* 表單狀態指示 */}
        {formData.deliveryMethod && (
          <div className={`p-3 rounded-lg text-sm ${
            isFormValid 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            {isFormValid ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>地址資訊完整，可以進行下一步</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>
                  {formData.deliveryMethod === "711" 
                    ? "請填寫縣市和7-11門市名稱" 
                    : "請填寫完整配送地址"}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
