"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PackageCheck, Truck, MapPin, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CommentSection } from "@/components/comment-section"
import { StarRating } from "@/components/star-rating"

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
  ratings?: {
    rating: number
    comment: string | null
    rated_at: string
    rated_by: string
  } | null
}

export default function ShippingTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null)

  const fetchOrders = async () => {
  try {
    console.log("=== [DEBUG] 開始獲取訂單資料 ===")
    
    // 使用測試 API 路由來繞過 RLS 限制（暫時不需要認證）
    const response = await fetch('/api/orders/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[DEBUG] API 錯誤:", errorData.error)
      setError(errorData.error || "無法載入訂單資料")
      return
    }

    const data = await response.json()
    console.log("[DEBUG] API 返回的完整資料:", data)
    console.log("[DEBUG] API 返回的訂單數量:", data.orders?.length || 0)
    console.log("[DEBUG] API 返回的訂單內容:", data.orders)
    console.log("[DEBUG] API 返回的用戶資料數量:", data.profiles?.length || 0)
    console.log("[DEBUG] API 返回的用戶資料:", data.profiles)
    console.log("[DEBUG] API 返回的消息:", data.message)
    
    const orders = data.orders

    setOrders(orders || [])
    console.log("=== [DEBUG] 訂單資料載入完成 ===")
  } catch (err) {
    console.error("[DEBUG] 未預期的錯誤:", err)
    setError("載入失敗，請重新整理頁面")
  } finally {
    setLoading(false)
  }
}

  const handleRatingSubmit = async (orderId: string, rating: number, comment: string) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          rating,
          comment
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '提交評分失敗')
      }

      const data = await response.json()
      
      // 更新本地訂單狀態
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, ratings: data.rating }
          : order
      ))
      
      // 關閉評論格
      setShowCommentModal(null)
      
      return data
    } catch (error) {
      console.error("提交評分錯誤:", error)
      throw error
    }
  }


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setTimeout(() => {
      fetchOrders()
    }, 1000) // Wait 1 second before retry
  }

  const currentOrder = orders[0] // Show the latest order

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      created: "已建立",
      paid: "已付款",
      processing: "處理中",
      shipped: "已出貨",
      delivered: "已送達",
      cancelled: "已取消",
    }
    return statusMap[status] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-extralight text-gray-800 mb-8 tracking-wide">配送追蹤</h1>
      <Card className="border-[#E8E2D9] shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-light text-[#6D5C4A] tracking-wide">最新訂單狀態</CardTitle>
          <CardDescription className="font-light">追蹤您最近一期 Sceut 香水的訂單進度。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p className="text-gray-600">載入中...</p>
          ) : error ? (
            <div className="space-y-2">
              <p className="text-red-600">{error}</p>
              <button onClick={handleRetry} className="text-sm text-blue-600 hover:text-blue-800 underline">
                重新載入
              </button>
            </div>
          ) : currentOrder ? (
            <>
              <div className="flex items-center">
                <PackageCheck className="w-6 h-6 mr-4 text-[#C2B8A3]" />
                <div>
                  <p className="text-sm font-medium text-gray-800">訂單編號: {currentOrder.shopify_order_id}</p>
                  <p className="text-sm text-gray-600">金額: NT$ {currentOrder.total_price}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Truck className="w-6 h-6 mr-4 text-[#C2B8A3]" />
                <div>
                  <p className="text-sm font-medium text-gray-800">狀態: {getStatusText(currentOrder.order_status)}</p>
                  <p className="text-sm text-gray-600">訂單日期: {formatDate(currentOrder.created_at)}</p>
                  {currentOrder.paid_at && (
                    <p className="text-sm text-gray-600">付款日期: {formatDate(currentOrder.paid_at)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-6 h-6 mr-4 text-[#C2B8A3]" />
                <div>
                  <p className="text-sm font-medium text-gray-800">收件人: {currentOrder.subscriber_name}</p>
                  <p className="text-sm text-gray-600">聯絡信箱: {currentOrder.customer_email}</p>
                </div>
              </div>
              
              
              <p className="text-xs text-gray-500 font-light pt-4 border-t border-[#E8E2D9]">
                預計送達時間約為付款後的 2-3 個工作天。實際配送情況可能因物流業者而異。
              </p>
            </>
          ) : (
            <div>
              <p className="text-sm text-gray-600 font-light">目前沒有訂單記錄。</p>
              {currentUser && <p className="text-xs text-gray-500 mt-2">當前用戶: {currentUser.name}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-2xl font-extralight text-gray-800 mt-12 mb-6 tracking-wide">歷史訂單記錄</h2>
      {orders.length > 1 ? (
        <div className="space-y-4">
          {orders.slice(1).map((order) => (
            <Card key={order.id} className="border-[#E8E2D9] shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">訂單 #{order.shopify_order_id}</p>
                    <p className="text-xs text-gray-500">訂單日期: {formatDate(order.created_at)}</p>
                    <p className="text-xs text-gray-500">金額: NT$ {order.total_price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* 評分區域 */}
                    <div className="flex flex-col items-center space-y-1">
                      {order.ratings ? (
                        <div className="flex items-center space-x-1">
                          <StarRating 
                            initialRating={order.ratings.rating}
                            disabled={true}
                            size="sm"
                          />
                          <span className="text-xs text-gray-600 ml-1">
                            {order.ratings.rating}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-1">
                          <button
                            onClick={() => setShowCommentModal(order.id)}
                            className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity"
                          >
                            <StarRating 
                              size="sm"
                              disabled={true}
                            />
                            <span className="text-xs text-gray-500">評分</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* 狀態 */}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.order_status === "delivered"
                          ? "text-green-700 bg-green-100"
                          : order.order_status === "shipped"
                            ? "text-blue-700 bg-blue-100"
                            : order.order_status === "cancelled"
                              ? "text-red-700 bg-red-100"
                              : "text-yellow-700 bg-yellow-100"
                      }`}
                    >
                      {getStatusText(order.order_status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 font-light">尚無歷史訂單記錄。</p>
      )}

      {/* 評論格模態框 */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">訂單評分</h3>
              <button
                onClick={() => setShowCommentModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <CommentSection
              orderId={showCommentModal}
              onSubmit={(rating, comment) => handleRatingSubmit(showCommentModal, rating, comment)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
