"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, Send, Loader2, AlertCircle, User, CreditCard, Package } from "lucide-react"
import { useAuth } from "@/app/auth-provider"

export default function TestRealSubscriptionPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const handleTestRealSubscription = async () => {
    if (!user) {
      setError("請先登入")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      console.log("🧪 開始真實訂閱流程測試...")
      console.log("👤 當前用戶:", user.id)

      const response = await fetch("/api/test-real-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id
        }),
      })

      const data = await response.json()
      console.log("📊 測試結果:", data)

      if (!response.ok) {
        throw new Error(data.error || "測試失敗")
      }

      setResult(data)
    } catch (err) {
      console.error("❌ 測試錯誤:", err)
      setError(err instanceof Error ? err.message : "測試失敗")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧪 真實訂閱流程測試
          </h1>
          <p className="text-gray-600">
            模擬實際訂閱成功時的完整流程，包括獲取用戶真實個人資料並發送確認郵件
          </p>
        </div>

        {/* 當前用戶資訊 */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                當前登入用戶
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>用戶 ID:</strong> {user.id}</p>
                  <p><strong>電子郵件:</strong> {user.email || "未設定"}</p>
                  <p><strong>姓名:</strong> {user.user_metadata?.name || user.user_metadata?.full_name || "未設定"}</p>
                </div>
                <div>
                  <p><strong>註冊時間:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : "未知"}</p>
                  <p><strong>最後登入:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "未知"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 測試按鈕 */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleTestRealSubscription} 
            disabled={loading || !user}
            size="lg"
            className="px-8 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                測試中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                開始真實訂閱流程測試
              </>
            )}
          </Button>
          {!user && (
            <p className="text-red-600 mt-2">請先登入以進行測試</p>
          )}
        </div>

        {/* 測試結果 */}
        {result && (
          <div className="space-y-6">
            {/* 用戶資料結果 */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <User className="w-5 h-5" />
                  用戶個人資料獲取結果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>資料狀態:</strong> 
                      <Badge className={`ml-2 ${result.testResults.userProfile.found ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {result.testResults.userProfile.found ? '已找到' : '未找到'}
                      </Badge>
                    </p>
                    <p><strong>姓名:</strong> {result.testResults.userProfile.name}</p>
                    <p><strong>電子郵件:</strong> {result.testResults.userProfile.email}</p>
                    <p><strong>電話:</strong> {result.testResults.userProfile.phone}</p>
                  </div>
                  <div>
                    <p><strong>地址:</strong> {result.testResults.userProfile.address}</p>
                    <p><strong>城市:</strong> {result.testResults.userProfile.city}</p>
                    <p><strong>郵遞區號:</strong> {result.testResults.userProfile.postal_code}</p>
                    <p><strong>國家:</strong> {result.testResults.userProfile.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 付款資料 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  模擬付款資料
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>定期定額編號:</strong> {result.testResults.paymentData.periodNo}</p>
                    <p><strong>授權時間:</strong> {result.testResults.paymentData.authTime}</p>
                    <p><strong>金額:</strong> NT$ {result.testResults.paymentData.periodAmt}</p>
                    <p><strong>訂單編號:</strong> {result.testResults.paymentData.merchantOrderNo}</p>
                  </div>
                  <div>
                    <p><strong>上次付款日期:</strong> {new Date(result.testResults.paymentData.lastPaymentDate).toLocaleString()}</p>
                    <p><strong>下次付款日期:</strong> {new Date(result.testResults.paymentData.nextPaymentDate).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 選擇的香水 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  選擇的香水
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div>
                    <p><strong>品牌:</strong> {result.testResults.selectedPerfume.brand}</p>
                    <p><strong>名稱:</strong> {result.testResults.selectedPerfume.name}</p>
                    <p><strong>價格:</strong> NT$ {result.testResults.selectedPerfume.price}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{result.testResults.selectedPerfume.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 郵件發送結果 */}
            <Card className={`${result.testResults.emailResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${result.testResults.emailResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.testResults.emailResult.success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  訂閱確認郵件發送結果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>發送狀態:</strong> 
                    <Badge className={`ml-2 ${result.testResults.emailResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {result.testResults.emailResult.success ? '成功' : '失敗'}
                    </Badge>
                  </p>
                  {result.testResults.emailResult.success ? (
                    <>
                      <p><strong>郵件 ID:</strong> {result.testResults.emailResult.emailId}</p>
                      <p><strong>收件人:</strong> {result.testResults.subscriptionData.userEmail}</p>
                      <p><strong>收件人姓名:</strong> {result.testResults.subscriptionData.userName}</p>
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800">
                          ✅ 訂閱確認郵件已成功發送到用戶的電子郵件地址！
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 p-3 bg-red-100 rounded-lg">
                      <p className="text-sm text-red-800">
                        ❌ 郵件發送失敗: {result.testResults.emailResult.error}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 訂閱資料摘要 */}
            <Card>
              <CardHeader>
                <CardTitle>訂閱資料摘要</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>用戶姓名:</strong> {result.testResults.subscriptionData.userName}</p>
                    <p><strong>用戶電子郵件:</strong> {result.testResults.subscriptionData.userEmail}</p>
                    <p><strong>月費:</strong> NT$ {result.testResults.subscriptionData.monthlyFee}</p>
                  </div>
                  <div>
                    <p><strong>訂閱狀態:</strong> 
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        {result.testResults.subscriptionData.status}
                      </Badge>
                    </p>
                    <p><strong>測試時間:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 錯誤資訊 */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                測試失敗
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-800">
                  ❌ {error}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 使用說明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>測試說明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>1. <strong>用戶資料獲取</strong>：從 Supabase 資料庫獲取當前登入用戶的真實個人資料</p>
            <p>2. <strong>付款模擬</strong>：模擬 NeWebPay 付款成功的完整資料結構</p>
            <p>3. <strong>訂閱資料準備</strong>：按照真實 API 的格式準備訂閱資料</p>
            <p>4. <strong>郵件發送</strong>：使用真實的郵件發送功能發送訂閱確認郵件</p>
            <hr className="my-3" />
            <p className="text-blue-600">
              💡 這個測試完全模擬了實際訂閱成功時的完整流程
            </p>
            <p className="text-green-600">
              ✨ 會使用用戶的真實個人資料發送郵件
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
