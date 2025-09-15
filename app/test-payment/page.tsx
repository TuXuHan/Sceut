"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const testPayment = async () => {
    setLoading(true)
    setError("")
    setResult(null)

    console.log("🧪 Testing payment process...")

    try {
      const testData = {
        ProdDesc: "測試付款",
        PeriodAmt: 599,
        PeriodType: "M",
        PeriodPoint: "05",
        PeriodStartType: "2",
        PeriodTimes: 99,
        Language: "ZH-TW",
      }

      console.log("📋 Test data:", testData)

      const response = await fetch("/api/newebpay/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      console.log("📡 Response status:", response.status)
      const data = await response.json()
      console.log("📡 Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create test payment")
      }

      setResult(data)

      // Test form creation
      if (data.formHtml) {
        console.log("✅ Form HTML received, length:", data.formHtml.length)
        console.log("📄 Form HTML preview:", data.formHtml.substring(0, 200) + "...")
      } else {
        console.error("❌ No form HTML received")
      }
    } catch (err) {
      console.error("❌ Test payment error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>付款流程測試</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testPayment} disabled={loading}>
              {loading ? "測試中..." : "測試付款流程"}
            </Button>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <h3 className="font-semibold">錯誤：</h3>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                <h3 className="font-semibold">成功：</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>商店訂單編號:</strong> {result.merchantTradeNo}</p>
                  <p><strong>表單 HTML 長度:</strong> {result.formHtml?.length || 0}</p>
                  <p><strong>表單 HTML 預覽:</strong></p>
                  <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-40">
                    {result.formHtml?.substring(0, 500) || "無表單 HTML"}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">調試說明：</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 點擊「測試付款流程」按鈕來測試 NeWebPay API</li>
                <li>• 檢查瀏覽器控制台查看詳細的調試信息</li>
                <li>• 如果成功，會顯示表單 HTML 的預覽</li>
                <li>• 如果失敗，會顯示具體的錯誤信息</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
