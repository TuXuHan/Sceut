"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CreditCard, Lock } from "lucide-react"

interface PaymentFormProps {
  onPaymentDataChange?: (isValid: boolean, data: any) => void
  className?: string
}

export function PaymentForm({ onPaymentDataChange, className }: PaymentFormProps) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 格式化信用卡號碼
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  // 格式化到期日期
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  // 驗證信用卡號碼
  const validateCardNumber = (number: string) => {
    const cleanNumber = number.replace(/\s/g, "")
    return cleanNumber.length >= 13 && cleanNumber.length <= 19
  }

  // 驗證到期日期
  const validateExpiryDate = (date: string) => {
    const [month, year] = date.split("/")
    if (!month || !year) return false

    const monthNum = Number.parseInt(month)
    const yearNum = Number.parseInt("20" + year)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    return (
      monthNum >= 1 && monthNum <= 12 && yearNum >= currentYear && (yearNum > currentYear || monthNum >= currentMonth)
    )
  }

  // 驗證 CVC
  const validateCVC = (cvc: string) => {
    return cvc.length >= 3 && cvc.length <= 4
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value)
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value)
    } else if (field === "cvc") {
      formattedValue = value.replace(/[^0-9]/g, "").substring(0, 4)
    }

    const newPaymentData = { ...paymentData, [field]: formattedValue }
    setPaymentData(newPaymentData)

    // 驗證
    const newErrors = { ...errors }
    if (field === "cardNumber") {
      if (formattedValue && !validateCardNumber(formattedValue)) {
        newErrors.cardNumber = "請輸入有效的信用卡號碼"
      } else {
        delete newErrors.cardNumber
      }
    } else if (field === "expiryDate") {
      if (formattedValue && !validateExpiryDate(formattedValue)) {
        newErrors.expiryDate = "請輸入有效的到期日期"
      } else {
        delete newErrors.expiryDate
      }
    } else if (field === "cvc") {
      if (formattedValue && !validateCVC(formattedValue)) {
        newErrors.cvc = "請輸入有效的安全碼"
      } else {
        delete newErrors.cvc
      }
    } else if (field === "cardholderName") {
      if (formattedValue && formattedValue.length < 2) {
        newErrors.cardholderName = "請輸入持卡人姓名"
      } else {
        delete newErrors.cardholderName
      }
    }

    setErrors(newErrors)

    // 檢查表單是否有效
    const isValid =
      validateCardNumber(newPaymentData.cardNumber) &&
      validateExpiryDate(newPaymentData.expiryDate) &&
      validateCVC(newPaymentData.cvc) &&
      newPaymentData.cardholderName.length >= 2 &&
      Object.keys(newErrors).length === 0

    onPaymentDataChange?.(isValid, newPaymentData)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 font-light">安全加密付款</span>
      </div>

      <div className="space-y-4">
        <div>
          <Label
            htmlFor="cardholderName"
            className={cn(
              "text-xs font-light tracking-wide uppercase transition-colors duration-300",
              focusedField === "cardholderName" ? "text-gray-800" : "text-gray-500",
            )}
          >
            持卡人姓名
          </Label>
          <Input
            id="cardholderName"
            type="text"
            value={paymentData.cardholderName}
            onChange={(e) => handleInputChange("cardholderName", e.target.value)}
            onFocus={() => setFocusedField("cardholderName")}
            onBlur={() => setFocusedField(null)}
            placeholder="請輸入持卡人姓名"
            className="rounded-none border-[#E8E2D9] focus:border-gray-800 focus:ring-0 h-10 text-sm font-light bg-transparent"
          />
          {errors.cardholderName && <p className="text-xs text-red-500 mt-1">{errors.cardholderName}</p>}
        </div>

        <div>
          <Label
            htmlFor="cardNumber"
            className={cn(
              "text-xs font-light tracking-wide uppercase transition-colors duration-300",
              focusedField === "cardNumber" ? "text-gray-800" : "text-gray-500",
            )}
          >
            信用卡號碼
          </Label>
          <div className="relative">
            <Input
              id="cardNumber"
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              onFocus={() => setFocusedField("cardNumber")}
              onBlur={() => setFocusedField(null)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="rounded-none border-[#E8E2D9] focus:border-gray-800 focus:ring-0 h-10 text-sm font-light bg-transparent pl-10"
            />
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="expiryDate"
              className={cn(
                "text-xs font-light tracking-wide uppercase transition-colors duration-300",
                focusedField === "expiryDate" ? "text-gray-800" : "text-gray-500",
              )}
            >
              到期日期
            </Label>
            <Input
              id="expiryDate"
              type="text"
              value={paymentData.expiryDate}
              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              onFocus={() => setFocusedField("expiryDate")}
              onBlur={() => setFocusedField(null)}
              placeholder="MM/YY"
              maxLength={5}
              className="rounded-none border-[#E8E2D9] focus:border-gray-800 focus:ring-0 h-10 text-sm font-light bg-transparent"
            />
            {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate}</p>}
          </div>

          <div>
            <Label
              htmlFor="cvc"
              className={cn(
                "text-xs font-light tracking-wide uppercase transition-colors duration-300",
                focusedField === "cvc" ? "text-gray-800" : "text-gray-500",
              )}
            >
              安全碼
            </Label>
            <Input
              id="cvc"
              type="text"
              value={paymentData.cvc}
              onChange={(e) => handleInputChange("cvc", e.target.value)}
              onFocus={() => setFocusedField("cvc")}
              onBlur={() => setFocusedField(null)}
              placeholder="123"
              maxLength={4}
              className="rounded-none border-[#E8E2D9] focus:border-gray-800 focus:ring-0 h-10 text-sm font-light bg-transparent"
            />
            {errors.cvc && <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4 flex items-center gap-2">
        <Lock className="w-3 h-3" />
        <span>您的付款資訊經過加密保護，我們不會儲存您的信用卡資訊</span>
      </div>
    </div>
  )
}
