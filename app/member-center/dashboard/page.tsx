"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Calendar, CreditCard, User, Settings, LogOut } from "lucide-react"
import { getSubscriptions } from "@/lib/actions"
import type { Subscription } from "@/types/subscription"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log("載入用戶儀表板數據...")

        // 載入訂閱資料
        const userSubscriptions = await getSubscriptions(user.id)
        setSubscriptions(userSubscriptions || [])

        console.log("儀表板數據載入完成")
      } catch (err) {
        console.error("載入用戶資料失敗:", err)
        setError("載入用戶資料失敗，請稍後再試")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("登出失敗:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>重新載入</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">請先登入</p>
          <Button onClick={() => (window.location.href = "/login")}>前往登入</Button>
        </div>
      </div>
    )
  }

  const activeSubscriptions = subscriptions.filter((sub) => sub.subscription_status === "active")
  const totalSubscriptions = subscriptions.length

  return (
    <div className="min-h-screen bg-[#F5F2ED]">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-800 mb-2">會員中心</h1>
            <p className="text-gray-600">歡迎回來，{user.user_metadata?.name || user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            登出
          </Button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活躍訂閱</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
              <p className="text-xs text-muted-foreground">共 {totalSubscriptions} 個訂閱</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">會員等級</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">標準會員</div>
              <p className="text-xs text-muted-foreground">享受專屬優惠</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">下次配送</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions.length > 0 ? "7天後" : "無"}</div>
              <p className="text-xs text-muted-foreground">
                {activeSubscriptions.length > 0 ? "預計配送時間" : "暫無活躍訂閱"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 訂閱列表 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              我的訂閱
            </CardTitle>
            <CardDescription>管理您的香水訂閱服務</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">您還沒有任何訂閱</p>
                <Button onClick={() => (window.location.href = "/quiz")}>開始香氣測驗</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription, index) => (
                  <div key={subscription.id || index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{subscription.plan_type === "monthly" ? "月度訂閱" : "季度訂閱"}</h3>
                      <Badge variant={subscription.subscription_status === "active" ? "default" : "secondary"}>
                        {subscription.subscription_status === "active"
                          ? "活躍"
                          : subscription.subscription_status === "cancelled"
                            ? "已取消"
                            : "暫停"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>香水: {subscription.perfume_name || "未指定"}</p>
                      <p>價格: NT$ {subscription.monthly_fee || 0}</p>
                      <p>
                        開始日期:{" "}
                        {subscription.created_at
                          ? new Date(subscription.created_at).toLocaleDateString("zh-TW")
                          : "未知"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
            onClick={() => (window.location.href = "/member-center/profile")}
          >
            <User className="w-6 h-6" />
            個人資料
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
            onClick={() => (window.location.href = "/member-center/subscription")}
          >
            <Package className="w-6 h-6" />
            訂閱管理
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
            onClick={() => (window.location.href = "/member-center/payment")}
          >
            <CreditCard className="w-6 h-6" />
            付款方式
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
            onClick={() => (window.location.href = "/member-center/preferences")}
          >
            <Settings className="w-6 h-6" />
            偏好設定
          </Button>
        </div>
      </div>
    </div>
  )
}
