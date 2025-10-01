"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { UserStorage } from "@/lib/client-storage"
import { GuestStorage } from "@/lib/guest-storage"
import { Loader2, Check, X, AlertTriangle, RefreshCw, Database, Trash2 } from "lucide-react"

export default function DebugQuizPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [logs, setLogs] = useState<string[]>([])
  const [localData, setLocalData] = useState<any>(null)
  const [guestData, setGuestData] = useState<any>(null)
  const [dbData, setDbData] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const logsEndRef = useRef<HTMLDivElement>(null)

  // 添加日志
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '📝'
    setLogs(prev => [...prev, `[${timestamp}] ${icon} ${message}`])
  }

  // 自动滚动到最新日志
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // 加载所有数据
  const loadAllData = async () => {
    addLog("开始加载数据...")
    setStatus('loading')

    try {
      // 1. 加载localStorage数据
      if (user) {
        const local = UserStorage.getQuizAnswers(user.id)
        setLocalData(local)
        if (local) {
          addLog(`✅ LocalStorage有数据: ${Object.keys(local).length}个字段`, 'success')
        } else {
          addLog("⚠️ LocalStorage无数据", 'error')
        }
      }

      // 2. 加载guest数据
      const guest = GuestStorage.getGuestQuizAnswers()
      setGuestData(guest)
      if (guest) {
        addLog(`📱 Guest数据存在: ${Object.keys(guest).length}个字段`, 'info')
      }

      // 3. 加载数据库数据
      if (user) {
        addLog("正在读取数据库...")
        try {
          const response = await fetch(`/api/profile/get?userId=${user.id}`)
          addLog(`API响应状态: ${response.status}`)
          
          if (response.ok) {
            const data = await response.json()
            const quizAnswers = data.profile?.quiz_answers
            setDbData(quizAnswers)
            
            if (quizAnswers) {
              addLog(`✅ 数据库有数据: ${Object.keys(quizAnswers).length}个字段`, 'success')
            } else {
              addLog("⚠️ 数据库无quiz_answers字段", 'error')
            }
          } else {
            addLog(`❌ API请求失败: ${response.status}`, 'error')
            setDbData(null)
          }
        } catch (error) {
          addLog(`❌ 读取数据库失败: ${(error as Error).message}`, 'error')
          setDbData(null)
        }
      }

      setStatus('success')
      addLog("数据加载完成", 'success')
    } catch (error) {
      setStatus('error')
      addLog(`❌ 加载失败: ${(error as Error).message}`, 'error')
    }
  }

  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [user])

  // 手动同步到数据库
  const handleSync = async () => {
    if (!user || !localData) {
      addLog("❌ 没有数据可以同步", 'error')
      return
    }

    setSyncing(true)
    addLog("开始同步到数据库...")

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const dataToSave = {
        id: user.id,
        quiz_answers: localData,
        updated_at: new Date().toISOString(),
      }

      addLog(`准备保存: user_id=${user.id}`)
      addLog(`数据: ${JSON.stringify(Object.keys(localData))}`)

      // 添加超时
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('超时：5秒内未完成')), 5000)
      )

      const savePromise = supabase
        .from("user_profiles")
        .upsert(dataToSave, { onConflict: 'id' })
        .select()

      const result = await Promise.race([savePromise, timeoutPromise]) as any

      if (result.error) {
        throw result.error
      }

      addLog("✅ 同步成功！", 'success')
      
      // 重新加载确认
      setTimeout(() => {
        addLog("重新验证数据库...")
        loadAllData()
      }, 1000)
    } catch (error) {
      addLog(`❌ 同步失败: ${(error as Error).message}`, 'error')
    } finally {
      setSyncing(false)
    }
  }

  // 清除日志
  const clearLogs = () => {
    setLogs([])
    addLog("日志已清除")
  }

  // 测试数据库连接
  const testConnection = async () => {
    addLog("测试数据库连接...")
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      
      const { data, error } = await supabase.from("user_profiles").select("id").limit(1)
      
      if (error) {
        addLog(`❌ 连接失败: ${error.message}`, 'error')
      } else {
        addLog("✅ 数据库连接正常", 'success')
      }
    } catch (error) {
      addLog(`❌ 连接测试失败: ${(error as Error).message}`, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-4 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* 头部 */}
        <div className="mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← 返回
          </Button>
          <h1 className="text-2xl font-light text-gray-800 mb-1">移动端调试工具</h1>
          <p className="text-sm text-gray-600">实时查看数据状态和日志</p>
        </div>

        {/* 用户信息 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">用户信息</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>User ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user?.id || '未登录'}</code></div>
            <div>Email: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user?.email || '未登录'}</code></div>
          </CardContent>
        </Card>

        {/* 数据状态 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              数据状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <span>LocalStorage</span>
              {localData ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {Object.keys(localData).length}题
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  无数据
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <span>数据库</span>
              {dbData ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {Object.keys(dbData).length}题
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  未同步
                </span>
              )}
            </div>

            {guestData && (
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded text-sm">
                <span>Guest数据</span>
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {Object.keys(guestData).length}题
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button 
            onClick={loadAllData}
            variant="outline"
            className="w-full"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            刷新
          </Button>
          
          <Button 
            onClick={handleSync}
            disabled={syncing || !localData}
            className="w-full bg-gray-800 hover:bg-black text-white"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                同步中
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                同步
              </>
            )}
          </Button>

          <Button 
            onClick={testConnection}
            variant="outline"
            className="w-full"
          >
            测试连接
          </Button>

          <Button 
            onClick={clearLogs}
            variant="outline"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清除日志
          </Button>
        </div>

        {/* 数据预览 */}
        {localData && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">LocalStorage数据</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(localData, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 实时日志 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">实时日志 ({logs.length}条)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">暂无日志...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 leading-relaxed">
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* 说明 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <p className="font-medium mb-1">💡 使用说明：</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>完成测验后，数据会先保存到LocalStorage</li>
            <li>如果"数据库"显示"未同步"，点击"同步"按钮</li>
            <li>日志会实时显示所有操作和错误信息</li>
            <li>手机上可以查看完整的调试信息</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
