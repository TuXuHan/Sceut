"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { UserStorage } from "@/lib/client-storage"
import { GuestStorage } from "@/lib/guest-storage"
import { AuthGuard } from "@/components/auth-guard"
import { Loader2, Database, CheckCircle, AlertCircle, RefreshCw, Trash2 } from "lucide-react"

export default function SyncDataPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [localData, setLocalData] = useState<any>(null)
  const [guestData, setGuestData] = useState<any>(null)
  const [dbData, setDbData] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  // 加载数据
  const loadData = async () => {
    setLoading(true)
    setMessage(null)

    try {
      if (user) {
        // 读取localStorage数据
        const local = UserStorage.getQuizAnswers(user.id)
        setLocalData(local)

        // 读取guest数据（如果有）
        const guest = GuestStorage.getGuestQuizAnswers()
        setGuestData(guest)

        // 读取数据库数据
        try {
          const response = await fetch(`/api/profile/get?userId=${user.id}`)
          if (response.ok) {
            const data = await response.json()
            setDbData(data.profile?.quiz_answers || null)
          } else {
            setDbData(null)
          }
        } catch (error) {
          console.error("读取数据库失败:", error)
          setDbData(null)
        }
      }
    } catch (error) {
      console.error("加载数据失败:", error)
      setMessage({ type: 'error', text: '加载数据失败: ' + (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  // 手动同步到数据库
  const handleSync = async () => {
    if (!user || !localData) {
      setMessage({ type: 'error', text: '没有数据可以同步' })
      return
    }

    setSyncing(true)
    setMessage(null)

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const dataToSave = {
        id: user.id,
        quiz_answers: localData,
        updated_at: new Date().toISOString(),
      }

      console.log("手动同步数据到数据库:", dataToSave)

      const { data, error } = await supabase
        .from("user_profiles")
        .upsert(dataToSave, { onConflict: 'id' })
        .select()

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: '✅ 数据已成功同步到数据库！' })
      
      // 重新加载数据以确认
      setTimeout(() => {
        loadData()
      }, 1000)
    } catch (error) {
      console.error("同步失败:", error)
      setMessage({ type: 'error', text: '❌ 同步失败: ' + (error as Error).message })
    } finally {
      setSyncing(false)
    }
  }

  // 清除guest数据
  const handleClearGuest = () => {
    if (confirm('确定要清除guest数据吗？')) {
      GuestStorage.clearGuestQuizAnswers()
      setMessage({ type: 'success', text: 'Guest数据已清除' })
      loadData()
    }
  }

  // 合并guest数据到用户数据
  const handleMergeGuest = async () => {
    if (!user || !guestData) return

    if (confirm('确定要将guest数据合并到用户数据吗？')) {
      const merged = {
        ...guestData,
        ...localData,
      }

      UserStorage.setQuizAnswers(user.id, merged)
      setMessage({ type: 'success', text: 'Guest数据已合并到用户数据' })
      loadData()
    }
  }

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-800 mx-auto mb-4" />
            <p className="text-gray-600">加载数据中...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-[#F5F2ED] py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              ← 返回
            </Button>
          </div>

          <h1 className="text-3xl font-light text-gray-800 mb-2">数据同步工具</h1>
          <p className="text-gray-600 mb-8">查看和管理您的测验数据</p>

          {message && (
            <Alert className={`mb-6 ${
              message.type === 'success' ? 'bg-green-50 border-green-200' :
              message.type === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <AlertDescription className={
                message.type === 'success' ? 'text-green-800' :
                message.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* localStorage数据 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                LocalStorage 数据（本地）
              </CardTitle>
              <CardDescription>
                保存在浏览器中的数据，即使网络断开也不会丢失
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localData ? (
                <>
                  <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
                    <pre className="text-sm">{JSON.stringify(localData, null, 2)}</pre>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSync} 
                      disabled={syncing}
                      className="bg-gray-800 hover:bg-black text-white"
                    >
                      {syncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          同步中...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          同步到数据库
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">暂无本地数据</p>
              )}
            </CardContent>
          </Card>

          {/* 数据库数据 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                数据库数据（Supabase）
              </CardTitle>
              <CardDescription>
                保存在服务器中的数据，可以在不同设备间同步
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dbData ? (
                <>
                  <div className="flex items-center gap-2 mb-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">数据已同步到数据库</span>
                  </div>
                  <div className="bg-gray-100 p-4 rounded overflow-auto">
                    <pre className="text-sm">{JSON.stringify(dbData, null, 2)}</pre>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>数据库中暂无数据，请点击上方"同步到数据库"按钮</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guest数据 */}
          {guestData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Guest 数据（临时）
                </CardTitle>
                <CardDescription>
                  注册前完成的测验数据，注册后应该被合并
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 p-4 rounded mb-4 overflow-auto">
                  <pre className="text-sm">{JSON.stringify(guestData, null, 2)}</pre>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleMergeGuest}
                    variant="outline"
                  >
                    合并到用户数据
                  </Button>
                  <Button 
                    onClick={handleClearGuest}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清除Guest数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 数据对比 */}
          <Card>
            <CardHeader>
              <CardTitle>数据状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>本地数据 (localStorage)</span>
                  {localData ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      已保存
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      未保存
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>数据库 (Supabase)</span>
                  {dbData ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      已同步
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      未同步
                    </span>
                  )}
                </div>

                {guestData && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Guest数据</span>
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      待处理
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button 
                  onClick={loadData}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新数据
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
