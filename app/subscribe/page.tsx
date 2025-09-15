"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Package, Truck, Shield, Star, User, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { UserStorage } from "@/lib/client-storage"
import { AuthGuard } from "@/components/auth-guard"
import PeriodicPaymentForm from "@/components/periodicPaymentForm"
import { getUserProfile } from "@/lib/user-data-service"
import { createClient } from "@/lib/supabase/client"
import { parseProfileData, isProfileComplete } from "@/lib/profile-data-parser"
import { forceReadFromSupabase } from "@/lib/direct-supabase-reader"

const SUBSCRIPTION_PRICE = process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE || "599"

interface SubscriptionData {
  id?: string
  user_id?: string
  subscription_status?: string
  monthly_fee?: number
  payment_status?: string
  last_payment_date?: string
  next_payment_date?: string
  created_at?: string
}

export default function SubscribePage() {
  const [selectedPerfume, setSelectedPerfume] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)

  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    // 獲取選中的香水
    const perfume = UserStorage.getSelectedPerfume(user.id)
    if (perfume) {
      setSelectedPerfume(perfume)
    }

    // 檢查個人資料是否完整和訂閱狀態
    checkProfileCompletion()
    checkSubscriptionStatus()
  }, [user])

  const checkProfileCompletion = async () => {
    if (!user) return

    try {
      // 檢查用戶郵箱（來自 user metadata）
      const userEmail = user.email || user.user_metadata?.email
      const hasEmail = !!userEmail

      let profileData = null
      let profileSource = "客戶端存儲"

      // 嘗試從 Supabase 獲取資料
      try {
        // 先嘗試使用原始函數
        profileData = await getUserProfile(user.id)
        if (profileData) {
          profileSource = "Supabase"
          console.log("✅ 成功從 Supabase 獲取資料")
        } else {
          console.log("⚠️ 原始函數返回 null，嘗試直接讀取")
          // 如果原始函數失敗，嘗試直接讀取
          profileData = await forceReadFromSupabase(user.id)
          if (profileData) {
            profileSource = "Supabase (直接讀取)"
            console.log("✅ 直接讀取 Supabase 成功")
          }
        }
      } catch (supabaseError) {
        console.warn("❌ Supabase 獲取個人資料失敗:", supabaseError)
        // 嘗試直接讀取作為備用方案
        try {
          profileData = await forceReadFromSupabase(user.id)
          if (profileData) {
            profileSource = "Supabase (直接讀取)"
            console.log("✅ 直接讀取 Supabase 成功 (備用方案)")
          }
        } catch (directError) {
          console.warn("❌ 直接讀取也失敗:", directError)
        }
      }

      // 如果 Supabase 沒有資料，嘗試從客戶端存儲獲取
      if (!profileData) {
        console.log("🔄 嘗試從客戶端存儲獲取資料")
        profileData = UserStorage.getUserProfile(user.id)
        if (profileData) {
          profileSource = "客戶端存儲"
          console.log("✅ 成功從客戶端存儲獲取資料")
        }
      }

      // 使用智能解析器處理資料庫欄位錯亂的情況
      const parsedData = parseProfileData(profileData)
      const profileComplete = isProfileComplete(parsedData)

      console.log("個人資料檢查結果:", {
        hasEmail,
        profileComplete,
        profileSource,
        userEmail: userEmail ? "已設定" : "未設定",
        profileData: profileData ? "有資料" : "無資料",
        parsedData,
        rawData: profileData // 顯示原始資料以便調試
      })

      // 所有必要欄位都必須填寫
      setProfileComplete(hasEmail && profileComplete)
    } catch (error) {
      console.error("檢查個人資料完整性失敗:", error)
      setProfileComplete(false)
    }
  }

  const checkSubscriptionStatus = async () => {
    if (!user) return

    try {
      const supabase = createClient()

      console.log("🔍 Checking subscription status for user:", user.id)

      const { data, error } = await supabase
        .from("subscribers")
        .select("*")
        .eq("user_id", user.id)
        .eq("subscription_status", "active")
        .maybeSingle()

      console.log("📋 Subscription query result:", { data, error })

      if (error) {
        console.error("Error checking subscription status:", error)
        setSubscription(null)
        setIsAlreadySubscribed(false)
      } else if (data) {
        setSubscription(data)
        setIsAlreadySubscribed(data.subscription_status === "active")
      } else {
        setSubscription(null)
        setIsAlreadySubscribed(false)
      }
    } catch (error) {
      console.error("Error checking subscription status:", error)
      setSubscription(null)
      setIsAlreadySubscribed(false)
    } finally {
      setLoading(false)
    }
  }

  // 移除 paymentSuccess 相關的處理函數，因為現在會重定向到 success 頁面
  // const handlePaymentSuccess = (data: any) => { ... }
  // const handlePaymentError = (error: string) => { ... }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // 檢查個人資料是否完整
  if (profileComplete === false) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">需要完善個人資料</h2>
              <p className="text-gray-600 mb-6">
                為了確保您的訂閱服務能夠順利進行，請先完成個人資料設定，包括電子郵件、電話號碼和收貨地址。
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-amber-800 mb-2">需要填寫的資料：</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• 姓名</li>
                  <li>• 電子郵件地址</li>
                  <li>• 聯絡電話號碼</li>
                  <li>• 收貨地址</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push("/member-center/profile")}
                  variant="outline"
                >
                  <User className="w-4 h-4 mr-2" />
                  前往會員中心
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回上一頁
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // 檢查是否已經訂閱
  if (isAlreadySubscribed && subscription) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">您已經訂閱了！</h2>
              <p className="text-gray-600 mb-6">您目前已經有有效的訂閱方案，無需重複訂閱。</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-800 mb-2">您的訂閱詳情：</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 訂閱狀態：{subscription.subscription_status === "active" ? "訂閱中" : "已取消"}</li>
                  <li>• 月費：NT$ {subscription.monthly_fee?.toLocaleString() || SUBSCRIPTION_PRICE}</li>
                  <li>
                    • 下次扣款：
                    {subscription.next_payment_date
                      ? new Date(subscription.next_payment_date).toLocaleDateString("zh-TW")
                      : "未設定"}
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push("/member-center/subscription")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  管理訂閱
                </Button>
                <Button variant="outline" onClick={() => router.push("/member-center/dashboard")}>
                  <User className="w-4 h-4 mr-2" />
                  會員中心
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // 移除 paymentSuccess 狀態，因為現在會重定向到 success 頁面
  // if (paymentSuccess) { ... }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* 返回按鈕 */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側：選中的香水資訊和訂閱詳情 */}
            <div className="space-y-6">
              {/* 選中的香水 */}
              {selectedPerfume && (
                <Card>
                  <CardHeader>
                    <CardTitle>您選擇的香水</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <img
                        src={selectedPerfume.image || "/placeholder.svg?height=120&width=120&query=perfume bottle"}
                        alt={selectedPerfume.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800">{selectedPerfume.name}</h3>
                        <p className="text-gray-600 mb-2">{selectedPerfume.brand}</p>
                        <Badge className="bg-amber-100 text-amber-800 mb-2">
                          {selectedPerfume.match_percentage}% 匹配
                        </Badge>
                        <p className="text-sm text-gray-500">月費訂閱服務</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 訂閱方案詳情 */}
              <Card>
                <CardHeader>
                  <CardTitle>訂閱方案</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">月費方案</span>
                      <span className="font-semibold">NT$ 599</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">配送費</span>
                      <span className="font-semibold text-green-600">免費</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium">總計</span>
                      <span className="font-bold">NT$ 599</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 服務保障 */}
              <Card>
                <CardHeader>
                  <CardTitle>服務保障</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">7 天無條件退換貨</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-green-500" />
                      <span className="text-sm">全台免費配送</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">隨時可暫停或取消訂閱</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">專業香水顧問諮詢</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右側：定期定額付款表單 */}
            <div className="space-y-6">
              <PeriodicPaymentForm />

              {/* 安全提示 */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">安全支付保障</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 使用定期定額付款系統，符合 PCI DSS 安全標準</li>
                        <li>• 信用卡資訊經過 SSL 加密傳輸</li>
                        <li>• 支援 Visa、MasterCard、JCB、American Express</li>
                        <li>• 目前為測試環境，不會進行實際扣款</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
