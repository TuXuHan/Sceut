"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Package, Star, MapPin, X } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useDebouncedLoading } from "@/hooks/use-debounced-loading"
import { createClient } from "@/lib/supabase/client"

interface Order {
  id: string
  shopify_order_id: string
  customer_email: string
  total_price: string
  currency: string
  order_status: string
  paid_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  subscriber_name: string
  ratings: {
    rating?: number
    comment?: string
    rated_at?: string
    rated_by?: string
  } | null
}

interface UserProfile {
  id: string
  name: string
  email: string
}

export default function ShippingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [submittingRating, setSubmittingRating] = useState<string | null>(null)
  const [ratingData, setRatingData] = useState<{ [key: string]: { rating: number; comment: string } }>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [currentRatingOrderId, setCurrentRatingOrderId] = useState<string | null>(null)
  const { loading, startLoading, stopLoading, shouldSkipLoad, resetLoadingState } = useDebouncedLoading({
    debounceMs: 500,
    maxRetries: 1
  })

  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const loadUserProfileAndOrders = async (forceReload = false) => {
    if (!user) return

    // 使用智能防抖机制
    if (shouldSkipLoad(forceReload)) {
      stopLoading() // 重置加载状态
      return
    }

    try {
      console.log("📊 載入配送資料...")
      startLoading()

      // 使用 fetch API 查詢用戶資料
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      let userName = ""
      
      if (supabaseUrl && supabaseKey) {
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=id,name,email&id=eq.${user.id}`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (profileData && profileData.length > 0) {
            setUserProfile(profileData[0])
            userName = profileData[0].name || ""
            console.log("✅ 用戶資料載入成功，用戶名稱:", userName)
          }
        }
      }

      // 使用 fetch API 查詢訂單資料（只顯示與當前用戶名稱相符的訂單）
      if (userName) {
        const ordersResponse = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&subscriber_name=eq.${encodeURIComponent(userName)}&order=created_at.desc`, {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          console.log("✅ 訂單資料載入成功:", ordersData)
          setOrders(ordersData || [])
        } else {
          console.log("⚠️ 訂單資料查詢失敗:", ordersResponse.status)
          setOrders([])
        }
      } else {
        console.log("⚠️ 無法取得用戶名稱，無法查詢訂單")
        setOrders([])
      }
    } catch (error) {
      console.error("載入訂單失敗:", error)
      toast({
        variant: "destructive",
        title: "載入失敗",
        description: "載入訂單資料失敗，請稍後再試",
      })
    } finally {
      stopLoading()
    }
  }

  useEffect(() => {
    if (user) {
      resetLoadingState()
      loadUserProfileAndOrders()
    }
  }, [user])

  // 页面可见性变化时重新加载数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        resetLoadingState()
        loadUserProfileAndOrders(true)
      }
    }

    const handleFocus = () => {
      if (user) {
        resetLoadingState()
        loadUserProfileAndOrders(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [user])

  const handleStarClick = (orderId: string) => {
    console.log("[v0] Star clicked for order:", orderId)
    console.log("[v0] Opening rating modal")
    setCurrentRatingOrderId(orderId)
    setRatingModalOpen(true)
    if (!ratingData[orderId]) {
      setRatingData((prev) => ({
        ...prev,
        [orderId]: { rating: 0, comment: "" },
      }))
    }
  }

  const handleModalRatingChange = (rating: number) => {
    if (currentRatingOrderId) {
      setRatingData((prev) => ({
        ...prev,
        [currentRatingOrderId]: {
          ...prev[currentRatingOrderId],
          rating,
        },
      }))
    }
  }

  const handleModalCommentChange = (comment: string) => {
    if (currentRatingOrderId) {
      setRatingData((prev) => ({
        ...prev,
        [currentRatingOrderId]: {
          ...prev[currentRatingOrderId],
          comment,
        },
      }))
    }
  }

  const submitModalRating = async () => {
    if (!currentRatingOrderId) return

    const rating = ratingData[currentRatingOrderId]
    if (!rating || !rating.rating) {
      toast({
        variant: "destructive",
        title: "請選擇評分",
        description: "請先選擇星級評分",
      })
      return
    }

    try {
      setSubmittingRating(currentRatingOrderId)

      const updateData = {
        ratings: {
          rating: rating.rating,
          comment: rating.comment || null,
          rated_at: new Date().toISOString(),
          rated_by: currentRatingOrderId,
        },
        updated_at: new Date().toISOString(),
      }

      const { error } = await (supabase as any)
        .from("orders")
        .update(updateData)
        .eq("id", currentRatingOrderId)

      if (error) {
        throw error
      }

      await loadUserProfileAndOrders()

      toast({
        title: "評分成功",
        description: "感謝您的評分！",
      })

      setRatingData((prev) => {
        const newData = { ...prev }
        delete newData[currentRatingOrderId]
        return newData
      })

      setRatingModalOpen(false)
      setCurrentRatingOrderId(null)
    } catch (error) {
      console.error("提交評分失敗:", error)
      toast({
        variant: "destructive",
        title: "提交失敗",
        description: "提交評分失敗，請稍後再試",
      })
    } finally {
      setSubmittingRating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatPrice = (price: string, currency: string) => {
    return `${currency === "TWD" ? "NT$" : currency} ${price}`
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      processing: "處理中",
      shipped: "已出貨",
      delivered: "已送達",
      cancelled: "已取消",
      created: "已建立",
      pending: "處理中",
      paid: "已付款",
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      processing: "bg-orange-100 text-orange-800 border-orange-200",
      pending: "bg-orange-100 text-orange-800 border-orange-200",
      shipped: "bg-blue-100 text-blue-800 border-blue-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      created: "bg-gray-100 text-gray-800 border-gray-200",
      paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
    }
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const renderStars = (rating: number, interactive = false, orderId?: string) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={
              interactive && orderId
                ? () => {
                    console.log("[v0] Star clicked via renderStars, orderId:", orderId, "star:", star)
                    handleStarClick(orderId)
                  }
                : undefined
            }
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#A69E8B]" />
            <p className="text-gray-600">載入配送資訊中...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extralight text-gray-800 mb-2 tracking-wide">配送資訊</h1>
          <p className="text-gray-600 font-light">查看您的訂單狀態和配送追蹤</p>
          {userProfile && <p className="text-xs text-gray-400 mt-2">當前使用者：{userProfile.name}</p>}
        </div>

        {orders.length > 0 && (
          <Card className="border-[#E8E2D9] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-light text-[#6D5C4A] tracking-wide">配送追蹤</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#FAF8F4] p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">最新訂單狀態</h3>
                <p className="text-gray-600 mb-4">追蹤您最近一期 Sceut 香水的訂單進度。</p>

                {(() => {
                  const latestOrder = orders[0]
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-[#A69E8B]" />
                        <div>
                          <span className="font-medium">訂單編號：{latestOrder.shopify_order_id}</span>
                          <br />
                          <span className="text-sm text-gray-600">
                            金額：{formatPrice(latestOrder.total_price, latestOrder.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">狀態：</span>
                            <span
                              className={`px-2 py-1 text-xs rounded border ${getStatusColor(latestOrder.order_status)}`}
                            >
                              {getStatusText(latestOrder.order_status)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">訂單日期：{formatDate(latestOrder.created_at)}</span>
                          {latestOrder.paid_at && (
                            <>
                              <br />
                              <span className="text-sm text-gray-600">付款日期：{formatDate(latestOrder.paid_at)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#A69E8B]" />
                        <div>
                          <span className="font-medium">收件人：{latestOrder.subscriber_name}</span>
                          <br />
                          <span className="text-sm text-gray-600">聯絡信箱：{latestOrder.customer_email}</span>
                        </div>
                      </div>

                      {!latestOrder.ratings && (
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-5 h-5 text-[#A69E8B]" />
                            <span className="font-medium">訂單評分</span>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">為此訂單評分</p>
                              <div className="flex gap-1 mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="w-6 h-6 text-gray-300 cursor-pointer hover:text-yellow-400 transition-colors"
                                    onClick={() => {
                                      console.log("[v0] Star clicked in latest order, star:", star)
                                      handleStarClick(latestOrder.id)
                                    }}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">點擊星星進行評分</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-[#E8E2D9] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-light text-[#6D5C4A] tracking-wide">歷史訂單記錄</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length <= 1 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">尚無歷史訂單</h3>
                <p className="text-gray-600">您的歷史訂單記錄將顯示在這裡</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(1).map((order) => (
                  <div key={order.id} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className="font-medium">訂單 #{order.shopify_order_id}</span>
                          <span
                            className={`px-2 py-1 bg-green-100 text-green-800 text-xs rounded w-fit ${getStatusColor(order.order_status)}`}
                          >
                            {getStatusText(order.order_status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>訂單日期：{formatDate(order.created_at)}</div>
                          <div>金額：{formatPrice(order.total_price, order.currency)}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end space-y-1 flex-shrink-0">
                        {order.ratings ? (
                          <>
                            <div className="flex gap-1">{renderStars(order.ratings.rating || 0)}</div>
                            <div className="text-xs text-gray-500">已評分</div>
                          </>
                        ) : (
                          <>
                            <div className="flex gap-1">{renderStars(0, true, order.id)}</div>
                            <div className="text-xs text-gray-500">點擊評分</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <DialogTitle className="text-xl font-medium">訂單評分</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  console.log("[v0] Closing rating modal")
                  setRatingModalOpen(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">為此訂單評分</h3>

                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        currentRatingOrderId && star <= (ratingData[currentRatingOrderId]?.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                      onClick={() => handleModalRatingChange(star)}
                    />
                  ))}
                </div>

                <p className="text-sm text-gray-500">請選擇評分</p>
              </div>

              <div>
                <Textarea
                  placeholder="寫下你的評論... (選填)"
                  value={currentRatingOrderId ? ratingData[currentRatingOrderId]?.comment || "" : ""}
                  onChange={(e) => handleModalCommentChange(e.target.value)}
                  className="min-h-[100px] resize-none"
                  rows={4}
                />
              </div>

              <Button
                onClick={submitModalRating}
                disabled={
                  submittingRating === currentRatingOrderId ||
                  !currentRatingOrderId ||
                  !ratingData[currentRatingOrderId]?.rating
                }
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                size="lg"
              >
                {submittingRating === currentRatingOrderId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "提交評分"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
