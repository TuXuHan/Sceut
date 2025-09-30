"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Package, Calendar, DollarSign, MapPin, Phone, Mail, RefreshCw } from "lucide-react"
import { useAuth } from "@/app/auth-provider"

interface Order {
  id: string
  shopify_order_id: string
  subscriber_name: string
  customer_email: string
  customer_phone?: string
  shipping_address?: string
  city?: string
  "711"?: string
  total_price: number
  currency: string
  order_status: string
  perfume_name?: string
  notes?: string
  user_id?: string
  created_at: string
  updated_at: string
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800", 
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
}

const statusLabels = {
  pending: "待處理",
  processing: "處理中",
  shipped: "已出貨", 
  delivered: "已送達",
  cancelled: "已取消"
}

export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  // 載入訂單資料
  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 檢查用戶是否已登入
      if (!isAuthenticated || !user) {
        setError("請先登入以查看訂單")
        return
      }
      
      // 獲取使用者資訊
      const userEmail = user.email
      const userName = user.user_metadata?.name || user.email?.split("@")[0] || ""
      const userId = user.id

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      }

      if (userId) headers["x-user-id"] = userId
      if (userEmail) headers["x-user-email"] = userEmail
      if (userName) headers["x-user-name"] = encodeURIComponent(userName)

      const response = await fetch("/api/orders/my-orders", {
        headers
      })

      const result = await response.json()

      if (result.success) {
        setOrders(result.orders)
        setFilteredOrders(result.orders)
      } else {
        setError(result.error || "載入訂單失敗")
      }
    } catch (error) {
      console.error("載入訂單時發生錯誤:", error)
      setError("載入訂單時發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  // 搜尋訂單
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const filtered = orders.filter(order => 
        order.shopify_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.perfume_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.subscriber_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOrders(filtered)
    }
  }, [searchTerm, orders])

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // 格式化金額
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: currency || "TWD"
    }).format(price)
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrders()
    } else if (!isAuthenticated) {
      setLoading(false)
      setError("請先登入以查看訂單")
    }
  }, [isAuthenticated, user])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>載入訂單中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadOrders} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新載入
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">我的訂單</h1>
        <p className="text-gray-600">查看您的訂單歷史和狀態</p>
      </div>

      {/* 搜尋欄 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜尋訂單號、香水名稱或狀態..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 訂單統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">總訂單數</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">待處理</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.order_status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">已出貨</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.order_status === "shipped").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">總金額</p>
                <p className="text-2xl font-bold">
                  {formatPrice(
                    orders.reduce((sum, order) => sum + (order.total_price || 0), 0),
                    "TWD"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 訂單列表 */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "沒有找到符合條件的訂單" : "您還沒有任何訂單"}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? "請嘗試其他搜尋條件" : "當您下訂單後，訂單資訊會顯示在這裡"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    訂單 #{order.shopify_order_id || order.id.slice(-8)}
                  </CardTitle>
                  <Badge className={statusColors[order.order_status as keyof typeof statusColors]}>
                    {statusLabels[order.order_status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatPrice(order.total_price, order.currency)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 訂單資訊 */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">訂單資訊</h4>
                    {order.perfume_name && (
                      <p className="text-sm">
                        <span className="text-gray-600">香水名稱：</span>
                        {order.perfume_name}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="text-gray-600">訂購人：</span>
                      {order.subscriber_name}
                    </p>
                    {order.notes && (
                      <p className="text-sm">
                        <span className="text-gray-600">備註：</span>
                        {order.notes}
                      </p>
                    )}
                  </div>

                  {/* 聯絡資訊 */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">聯絡資訊</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {order.customer_email}
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {order.customer_phone}
                      </div>
                    )}
                    {order.shipping_address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p>{order.shipping_address}</p>
                          {order.city && <p>{order.city}</p>}
                          {order["711"] && <p>7-11門市：{order["711"]}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
