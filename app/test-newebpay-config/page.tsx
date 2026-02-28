"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard } from "lucide-react"

function TestNewebpayConfigContent() {
  const searchParams = useSearchParams()
  const [config, setConfig] = useState({
    merchantId: "MS1815263328",
    hashKey: "rDGd3Xvs3qGXUGXdVJJAbHTlzxqEsNeR",
    hashIV: "PkxxI20wU5YFThBC",
    env: "production" as "sandbox" | "production",
  })
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
    email: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  // Read error from URL params
  useEffect(() => {
    const errorParam = searchParams.get("error")
    const statusParam = searchParams.get("status")
    if (errorParam) {
      const errorMessage = statusParam 
        ? `[${statusParam}] ${errorParam}`
        : errorParam
      setError(errorMessage)
      // Clear URL params after reading
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname)
      }
    }
  }, [searchParams])

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

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

  const handleCardInfoChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value)
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value)
    } else if (field === "cvc") {
      formattedValue = value.replace(/[^0-9]/g, "").substring(0, 4)
    }

    setCardInfo(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const testPayment = async () => {
    setLoading(true)
    setError("")
    setResult(null)

    // Validate inputs
    if (!config.merchantId || !config.hashKey || !config.hashIV) {
      setError("請填寫所有必填欄位")
      setLoading(false)
      return
    }

    if (config.hashKey.length !== 32) {
      setError("Hash Key 必須為 32 個字元")
      setLoading(false)
      return
    }

    if (config.hashIV.length !== 16) {
      setError("Hash IV 必須為 16 個字元")
      setLoading(false)
      return
    }

    console.log("🧪 Testing payment with custom config...")
    console.log("📋 Config:", {
      merchantId: config.merchantId,
      hashKeyLength: config.hashKey.length,
      hashIVLength: config.hashIV.length,
      env: config.env,
    })

    try {
      const response = await fetch("/api/newebpay/test-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchantId: config.merchantId,
          hashKey: config.hashKey,
          hashIV: config.hashIV,
          env: config.env,
          email: cardInfo.email,
        }),
      })

      console.log("📡 Response status:", response.status)
      const data = await response.json()
      console.log("📡 Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create test payment")
      }

      setResult(data)

      // Auto-submit the form to NeWebPay
      if (data.formHtml) {
        console.log("✅ Form HTML received, auto-submitting...")
        const div = document.createElement("div")
        div.innerHTML = data.formHtml
        document.body.appendChild(div)
        const form = div.querySelector("form")
        if (form) {
          console.log("✅ Form found, submitting to NeWebPay...")
          form.submit()
        } else {
          console.error("❌ Form not found in HTML")
          setError("表單提交失敗 - 找不到表單")
        }
      } else {
        console.error("❌ No form HTML received")
        setError("表單提交失敗 - 沒有收到表單 HTML")
      }
    } catch (err) {
      console.error("❌ Test payment error:", err)
      setError(err instanceof Error ? err.message : "發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>NeWebPay 配置測試</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchantId">商店代號 (Merchant ID)</Label>
              <Input
                id="merchantId"
                type="text"
                placeholder="例如: MS123456789"
                value={config.merchantId}
                onChange={(e) => handleConfigChange("merchantId", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashKey">Hash Key (32 個字元)</Label>
              <Input
                id="hashKey"
                type="text"
                placeholder="例如: IaWudQJsuOT994cpHRWzv7Ge67yC1cE3"
                value={config.hashKey}
                onChange={(e) => handleConfigChange("hashKey", e.target.value)}
                disabled={loading}
                maxLength={32}
              />
              <p className="text-xs text-gray-500">
                目前長度: {config.hashKey.length} / 32
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashIV">Hash IV (16 個字元)</Label>
              <Input
                id="hashIV"
                type="text"
                placeholder="例如: C1dLm3nxZRVlmBSP"
                value={config.hashIV}
                onChange={(e) => handleConfigChange("hashIV", e.target.value)}
                disabled={loading}
                maxLength={16}
              />
              <p className="text-xs text-gray-500">
                目前長度: {config.hashIV.length} / 16
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="env">環境</Label>
              <select
                id="env"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={config.env}
                onChange={(e) => handleConfigChange("env", e.target.value)}
                disabled={loading}
              >
                <option value="sandbox">測試環境 (Sandbox)</option>
                <option value="production">正式環境 (Production)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">信用卡資訊</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">信用卡號碼</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardInfo.cardNumber}
                      onChange={(e) => handleCardInfoChange("cardNumber", e.target.value)}
                      disabled={loading}
                      maxLength={19}
                      className="pl-10"
                    />
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    測試卡號: 4000-2211-1111-1111 (Visa)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">到期日期</Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={cardInfo.expiryDate}
                      onChange={(e) => handleCardInfoChange("expiryDate", e.target.value)}
                      disabled={loading}
                      maxLength={5}
                    />
                    <p className="text-xs text-gray-500">
                      例如: 12/25
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvc">安全碼 (CVC)</Label>
                    <Input
                      id="cvc"
                      type="text"
                      placeholder="123"
                      value={cardInfo.cvc}
                      onChange={(e) => handleCardInfoChange("cvc", e.target.value)}
                      disabled={loading}
                      maxLength={4}
                    />
                    <p className="text-xs text-gray-500">
                      卡片背面3-4碼
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">持卡人姓名</Label>
                  <Input
                    id="cardholderName"
                    type="text"
                    placeholder="例如: 王小明"
                    value={cardInfo.cardholderName}
                    onChange={(e) => handleCardInfoChange("cardholderName", e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">電子郵件</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="例如: test@example.com"
                    value={cardInfo.email}
                    onChange={(e) => handleCardInfoChange("email", e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    用於接收付款通知
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={testPayment} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "測試中..." : "測試付款 (1元1期)"}
            </Button>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <h3 className="font-semibold">錯誤：</h3>
                <p className="mb-2">{error}</p>
                {error.includes("商店代號停用") && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded text-sm">
                    <p className="font-semibold mb-1">解決方法：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>檢查 NeWebPay 後台，確認商店代號是否正確</li>
                      <li>確認商店代號是否已啟用</li>
                      <li>檢查是否使用了正確的環境（測試/正式）</li>
                      <li>聯繫 NeWebPay 客服確認商店狀態</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                <h3 className="font-semibold">成功：</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>商店訂單編號:</strong> {result.merchantTradeNo}</p>
                  <p><strong>付款金額:</strong> {result.paymentData?.amount} 元</p>
                  <p><strong>期數:</strong> {result.paymentData?.periods} 期</p>
                  <p><strong>環境:</strong> {result.config?.env}</p>
                  <p><strong>商店代號:</strong> {result.config?.merchantId}</p>
                  <p className="mt-2 text-xs">
                    表單已自動提交到 NeWebPay 付款頁面...
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">使用說明：</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 填寫您的 NeWebPay 商店代號、Hash Key 和 Hash IV</li>
                <li>• Hash Key 必須為 32 個字元</li>
                <li>• Hash IV 必須為 16 個字元</li>
                <li>• 選擇測試環境或正式環境</li>
                <li>• 填寫信用卡資訊（卡號、到期日期、CVC、持卡人姓名、電子郵件）</li>
                <li>• 點擊「測試付款」按鈕會建立 1元1期 的測試付款</li>
                <li>• 表單會自動提交到 NeWebPay 付款頁面，您可以在 NeWebPay 頁面確認或修改信用卡資訊</li>
                <li>• 檢查瀏覽器控制台查看詳細的調試信息</li>
                <li className="mt-2 font-semibold">測試環境測試卡號：</li>
                <li>• Visa: 4000-2211-1111-1111</li>
                <li>• MasterCard: 5453-0100-0000-0001</li>
                <li>• 到期日期: 任意未來日期 (如 12/25)</li>
                <li>• CVC: 任意3-4碼 (如 123)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function TestNewebpayConfigPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <TestNewebpayConfigContent />
    </Suspense>
  )
}
