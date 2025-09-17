"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/app/auth-provider"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useDebouncedLoading } from "@/hooks/use-debounced-loading"

interface SubscriptionData {
  id?: string
  user_id?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  subscription_status?: string
  monthly_fee?: number
  payment_method?: string
  payment_status?: string
  last_payment_date?: string
  next_payment_date?: string
  payment_data?: any
  created_at?: string
  updated_at?: string
}

export default function SubscriptionManagementPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isActive, setIsActive] = useState(false)
  const { loading, startLoading, stopLoading, shouldSkipLoad, resetLoadingState } = useDebouncedLoading({
    debounceMs: 500,
    maxRetries: 1
  })

  const loadSubscription = async (forceReload = false) => {
    if (!user) {
      setSubscription(null)
      setIsActive(false)
      stopLoading()
      return
    }

    // 使用智能防抖机制
    if (shouldSkipLoad(forceReload)) {
      stopLoading() // 重置加载状态
      return
    }

    try {
      console.log("[v0] Loading subscription for user:", user.id)
      startLoading()

      const supabase = createClient()

      const { data, error } = await supabase
        .from("subscribers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log("[v0] Subscription query result:", { data, error })

      if (error) {
        console.error("[v0] Error loading subscription:", error)
        setSubscription(null)
        setIsActive(false)
      } else if (data) {
        setSubscription(data)
        setIsActive((data as any).subscription_status === "active")
      } else {
        setSubscription(null)
        setIsActive(false)
      }
    } catch (error) {
      console.error("[v0] Error loading subscription data:", error)
      setSubscription(null)
      setIsActive(false)
    } finally {
      stopLoading()
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("[v0] Subscription page access denied - redirecting to login")
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  // 加载用户订阅数据
  useEffect(() => {
    if (user) {
      console.log("🔄 useEffect: 用戶已準備好，開始載入資料")
      resetLoadingState() // 重置加载状态
      loadSubscription()
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
        loadSubscription(true) // 强制重新加载
      }
    }

    const handleFocus = () => {
      if (user) {
        console.log("🔄 頁面重新獲得焦點，重新載入資料")
        // 重置状态后重新加载
        resetLoadingState()
        loadSubscription(true) // 强制重新加载
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [user])

  const handleCancelSubscription = async () => {
    if (!subscription || !user) return

    if (window.confirm("您確定要取消訂閱嗎？此操作將立即終止您的定期付款。")) {
      try {
        const response = await fetch("/api/newebpay/terminate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          setIsActive(false)
          setSubscription((prev) =>
            prev
              ? {
                  ...prev,
                  subscription_status: "terminated",
                  payment_status: "terminated",
                }
              : null,
          )
          alert("您的訂閱已成功取消。")
        } else {
          console.error("Error terminating subscription:", result)
          alert(`取消訂閱時發生錯誤：${result.error || "未知錯誤"}`)
        }
      } catch (error) {
        console.error("Error cancelling subscription:", error)
        alert("取消訂閱時發生錯誤，請稍後再試。")
      }
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-8">
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

  return (
    <div>
      <h1 className="text-3xl font-extralight text-gray-800 mb-8 tracking-wide">訂閱管理</h1>
      <Card className="border-[#E8E2D9] shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-light text-[#6D5C4A] tracking-wide">您的訂閱方案</CardTitle>
          <CardDescription className="font-light">查看並管理您的 Sceut 香水訂閱詳情。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">載入中...</p>
            </div>
          ) : subscription ? (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">方案狀態</h3>
                <Badge
                  variant={isActive ? "default" : "destructive"}
                  className={isActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {isActive ? "訂閱中" : subscription.subscription_status === "terminated" ? "已取消" : "非活躍"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">方案類型</h3>
                <p className="text-sm text-gray-700">每月精選香水</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">每月價格</h3>
                <p className="text-sm text-gray-700">NT${subscription.monthly_fee?.toLocaleString() || 599}</p>
              </div>
              {isActive && (
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-1">下次扣款日期</h3>
                  <p className="text-sm text-gray-700">
                    {subscription.next_payment_date
                      ? new Date(subscription.next_payment_date).toLocaleDateString("zh-TW")
                      : "2025年7月15日 (此為示意)"}
                  </p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">訂閱起始日</h3>
                <p className="text-sm text-gray-700">
                  {subscription.created_at
                    ? new Date(subscription.created_at).toLocaleDateString("zh-TW")
                    : new Date().toLocaleDateString("zh-TW")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">付款方式</h3>
                <p className="text-sm text-gray-700">{subscription.payment_method || "信用卡"}</p>
              </div>
              {isActive && (
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  className="rounded-none text-xs font-light tracking-widest uppercase"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  取消訂閱
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">您目前沒有任何訂閱記錄</p>
              <Button onClick={() => router.push("/quiz")} className="bg-[#6D5C4A] hover:bg-[#5A4A3A]">
                開始香氣測驗
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
