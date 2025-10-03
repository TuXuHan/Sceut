"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/app/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { Loader2, CheckCircle, XCircle, RefreshCw, Database } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CheckSubscriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkSubscription = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // 檢查 subscribers 表
      const response = await fetch(`/api/subscriptions?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.subscription) {
        setSubscription(data.subscription)
      } else {
        setSubscription(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知錯誤")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSubscription()
  }, [user])

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-[#F5F2ED] py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              ← 返回
            </Button>
          </div>

          <h1 className="text-3xl font-light text-gray-800 mb-2">訂閱狀態檢查</h1>
          <p className="text-gray-600 mb-8">查看您的訂閱記錄</p>

          {/* 用戶信息 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>用戶信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">User ID: </span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user?.id}</code>
              </div>
              <div>
                <span className="font-medium">Email: </span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user?.email}</code>
              </div>
            </CardContent>
          </Card>

          {/* 訂閱狀態 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  訂閱狀態
                </span>
                <Button
                  onClick={checkSubscription}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      刷新
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">檢查中...</p>
                </div>
              ) : error ? (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              ) : subscription ? (
                <>
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ 找到訂閱記錄！
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">訂閱狀態</span>
                      <span className="font-medium">{subscription.subscription_status}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">付款狀態</span>
                      <span className="font-medium">{subscription.payment_status}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">月費</span>
                      <span className="font-medium">NT$ {subscription.monthly_fee}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">週期編號</span>
                      <span className="font-medium text-xs">{subscription.period_no}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">上次付款</span>
                      <span className="font-medium text-xs">
                        {subscription.last_payment_date ? 
                          new Date(subscription.last_payment_date).toLocaleString('zh-TW') : 
                          '無'}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">下次付款</span>
                      <span className="font-medium text-xs">
                        {subscription.next_payment_date ? 
                          new Date(subscription.next_payment_date).toLocaleString('zh-TW') : 
                          '無'}
                      </span>
                    </div>
                    
                    {/* 完整數據 */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        查看完整數據
                      </summary>
                      <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-60">
                        <pre>{JSON.stringify(subscription, null, 2)}</pre>
                      </div>
                    </details>
                  </div>
                </>
              ) : (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertDescription className="text-amber-800">
                    ⚠️ 未找到訂閱記錄
                    <div className="mt-2 text-xs">
                      可能的原因：
                      <ul className="list-disc list-inside mt-1">
                        <li>尚未完成訂閱流程</li>
                        <li>支付尚未完成或處理中</li>
                        <li>數據保存失敗</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 操作按鈕 */}
          {!subscription && (
            <div className="text-center">
              <Button
                onClick={() => router.push("/subscribe")}
                className="bg-gray-800 hover:bg-black text-white"
              >
                前往訂閱頁面
              </Button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

