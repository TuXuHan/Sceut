"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, CreditCard, User, Settings, LogOut, AlertCircle, Database } from "lucide-react"
import { getSubscriptions } from "@/lib/actions"
import { useDebouncedLoading } from "@/hooks/use-debounced-loading"
import type { Subscription } from "@/types/subscription"

export default function DashboardPage() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDatabaseConfigured, setIsDatabaseConfigured] = useState(true)
  const { loading, startLoading, stopLoading, shouldSkipLoad, resetLoadingState } = useDebouncedLoading({
    debounceMs: 500,
    maxRetries: 1
  })

  const loadUserData = async (forceReload = false) => {
    if (!user) {
      stopLoading()
      return
    }

    // 使用智能防抖机制
    if (shouldSkipLoad(forceReload)) {
      stopLoading() // 重置加载状态
      return
    }

    try {
      console.log("[v0] Loading dashboard data for user:", user.id)
      startLoading()
      setError(null)

      // Load subscription data
      const userSubscriptions = await getSubscriptions(user.id)
      setSubscriptions(userSubscriptions || [])

      console.log("[v0] Dashboard data loaded successfully")
    } catch (err) {
      console.error("[v0] Failed to load user data:", err)
      const errorMessage = err instanceof Error ? err.message : "載入用戶資料失敗，請稍後再試"
      if (errorMessage.includes("Database not configured") || errorMessage.includes("Supabase")) {
        setIsDatabaseConfigured(false)
        setError("資料庫尚未配置，部分功能暫時無法使用")
      } else {
        setError(errorMessage)
      }
    } finally {
      stopLoading()
    }
  }

  // 认证检查
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("[v0] Dashboard access denied - redirecting to login")
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  // 加载用户数据
  useEffect(() => {
    if (user) {
      console.log("🔄 useEffect: 用戶已準備好，開始載入資料")
      resetLoadingState() // 重置加载状态
      loadUserData()
    } else {
      console.log("⏳ useEffect: 等待用戶準備好")
    }
  }, [user])

  // 页面可见性变化时重新加载数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log("📱 頁面重新可見，重新載入資料")
        // 重置状态后重新加载
        resetLoadingState()
        loadUserData(true) // 强制重新加载
      }
    }

    const handleFocus = () => {
      if (user) {
        console.log("🔄 頁面重新獲得焦點，重新載入資料")
        // 重置状态后重新加载
        resetLoadingState()
        loadUserData(true) // 强制重新加载
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("登出失敗:", error)
    }
  }

  const handleRetry = () => {
    setError(null)
    startLoading()
    window.location.reload()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const activeSubscriptions = subscriptions.filter((sub) => (sub as any).subscription_status === "active")
  const totalSubscriptions = subscriptions.length

  return (
    <div className="min-h-screen bg-[#F5F2ED]">
      <div className="container mx-auto px-4 py-8">
        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-800 mb-2">會員中心</h1>
            <p className="text-gray-600">歡迎回來，{user?.user_metadata?.name || user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            登出
          </Button>
        </div>

        {!isDatabaseConfigured && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <Database className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              資料庫尚未配置。請在專案設定中添加 Supabase 整合以啟用完整功能。
              <Button
                variant="link"
                className="p-0 h-auto text-amber-800 underline ml-2"
                onClick={() => window.open("https://vercel.com/docs/integrations/supabase", "_blank")}
              >
                了解如何設定
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {error && isDatabaseConfigured && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button variant="link" className="p-0 h-auto text-red-800 underline ml-2" onClick={handleRetry}>
                重新載入
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
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
        </div>

        {/* Subscription list */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              我的訂閱
            </CardTitle>
            <CardDescription>管理您的香水訂閱服務</CardDescription>
          </CardHeader>
          <CardContent>
            {!isDatabaseConfigured ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">資料庫尚未配置</p>
                <p className="text-sm text-gray-500 mb-4">請在專案設定中添加 Supabase 整合以查看訂閱資料</p>
                <Button
                  variant="outline"
                  onClick={() => window.open("https://vercel.com/docs/integrations/supabase", "_blank")}
                >
                  查看設定指南
                </Button>
              </div>
            ) : subscriptions.length === 0 ? (
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
                      <h3 className="font-medium">{(subscription as any).plan_type === "monthly" ? "月度訂閱" : "季度訂閱"}</h3>
                      <Badge variant={(subscription as any).subscription_status === "active" ? "default" : "secondary"}>
                        {(subscription as any).subscription_status === "active"
                          ? "活躍"
                          : (subscription as any).subscription_status === "cancelled"
                            ? "已取消"
                            : "暫停"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>香水: {(subscription as any).perfume_name || "未指定"}</p>
                      <p>價格: NT$ {(subscription as any).monthly_fee || 0}</p>
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

        {/* Quick actions */}
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
            disabled={!isDatabaseConfigured}
          >
            <Package className="w-6 h-6" />
            訂閱管理
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
            onClick={() => (window.location.href = "/subscribe")}
            disabled={!isDatabaseConfigured}
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
