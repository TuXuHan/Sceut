"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Truck, Star, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { getUserProfile } from "@/lib/user-data-service"

function SubscribeSuccessContent() {
  const [loading, setLoading] = useState(true)
  const [creatingSubscription, setCreatingSubscription] = useState(true)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [selectedPerfume, setSelectedPerfume] = useState<any>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const periodNo = searchParams.get("PeriodNo")
  const authTime = searchParams.get("AuthTime")
  const periodAmt = searchParams.get("PeriodAmt")
  const merchantOrderNo = searchParams.get("MerchantOrderNo")

  console.log(periodNo, authTime, periodAmt)

  useEffect(() => {
    if (!user || !periodNo || !authTime || !periodAmt || !merchantOrderNo) {
      setLoading(false)
      return
    }

    // 獲取選中的香水
    const perfume = localStorage.getItem(`selectedPerfume_${user.id}`)
    if (perfume) {
      setSelectedPerfume(JSON.parse(perfume))
    }

    // 創建訂閱記錄
    createSubscription()
  }, [user, periodNo, authTime, periodAmt, merchantOrderNo])

  const createSubscription = async () => {
    try {
      // 獲取用戶個人資料
      const userProfile = await getUserProfile(user!.id)
      
      // 如果無法獲取用戶資料，使用基本資料
      const profileData = userProfile || {
        name: user?.user_metadata?.name || user?.email?.split("@")[0] || "用戶",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        country: "台灣",
        "711": ""
      }

      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user!.id,
          periodNo,
          authTime,
          periodAmt,
          selectedPerfume,
          userProfile: profileData,
          merchantOrderNo,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create subscription")
      }

      const result = await response.json()
      console.log("Subscription created:", result)

      // 清除localStorage中的選中香水
      if (selectedPerfume) {
        localStorage.removeItem(`selectedPerfume_${user!.id}`)
      }

      setCreatingSubscription(false)
      setPaymentData({
        transaction_id: periodNo,
        auth_time: authTime,
        period_amt: periodAmt,
        demo_mode: false,
        merchant_order_no: merchantOrderNo,
      })
      setLoading(false)
    } catch (error) {
      console.error("Error creating subscription:", error)
      setSubscriptionError("Subscription creation failed")
      setCreatingSubscription(false)
      setPaymentData({
        transaction_id: periodNo,
        auth_time: authTime,
        period_amt: periodAmt,
        demo_mode: false,
        merchant_order_no: merchantOrderNo,
      })
      setLoading(false)
    }
  }

  if (loading || !user || !periodNo || !authTime || !periodAmt || !merchantOrderNo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (creatingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">付款成功，正在建立訂閱資訊</h2>
            <p className="text-gray-600">請稍候，我們正在為您建立訂閱記錄...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center p-8">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">訂閱成功！</h2>
        <p className="text-gray-600 mb-6">恭喜您成功訂閱香水服務！您的第一瓶香水將在 3-5 個工作天內送達。</p>

        {/* 付款資訊 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>付款資訊</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">交易編號：</span>
                <span className="text-gray-600">{paymentData?.transaction_id}</span>
              </div>
              <div>
                <span className="font-medium">付款金額：</span>
                <span className="text-gray-600">NT$ {Number(periodAmt).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium">授權時間：</span>
                <span className="text-gray-600">{authTime}</span>
              </div>
              <div>
                <span className="font-medium">訂閱狀態：</span>
                <span className="text-gray-600">已啟用</span>
              </div>
              <div>
                <span className="font-medium">訂單編號：</span>
                <span className="text-gray-600">{paymentData?.merchant_order_no}</span>
              </div>
            </div>
            {paymentData?.demo_mode && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>演示模式：</strong>此為測試交易，未進行實際扣款
                </p>
              </div>
            )}
            {subscriptionError && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>注意：</strong>付款成功，但訂閱記錄建立時發生問題，請聯絡客服
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 選中的香水資訊 */}
        {selectedPerfume && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>您的香水</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <img
                  src={selectedPerfume.image || "/placeholder.svg?height=80&width=80&query=perfume bottle"}
                  alt={selectedPerfume.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="text-left">
                  <h3 className="text-lg font-medium text-gray-800">{selectedPerfume.name}</h3>
                  <p className="text-gray-600">{selectedPerfume.brand}</p>
                  <Badge className="bg-amber-100 text-amber-800">{selectedPerfume.match_percentage}% 匹配</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 後續步驟 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>接下來會發生什麼？</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium">香水準備</h4>
                  <p className="text-sm text-gray-600">我們將為您精心包裝選中的香水</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Truck className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">配送安排</h4>
                  <p className="text-sm text-gray-600">3-5 個工作天內送達您指定的地址</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-medium">體驗回饋</h4>
                  <p className="text-sm text-gray-600">使用後請分享您的體驗，幫助我們改善推薦</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push("/member-center/profile")} className="bg-green-600 hover:bg-green-700">
            前往會員中心
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            返回首頁
          </Button>
        </div>
      </div>
    </div>
  )
}

function SubscribeSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
}

export default function SubscribeSuccessPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Suspense fallback={<SubscribeSuccessLoading />}>
        <SubscribeSuccessContent />
      </Suspense>
    </AuthGuard>
  )
}
