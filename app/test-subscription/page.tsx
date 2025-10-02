"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/app/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { Loader2, CheckCircle, XCircle, Database, Trash2 } from "lucide-react"

export default function TestSubscriptionPage() {
  const { user } = useAuth()
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  // 测试数据
  const [testData, setTestData] = useState({
    name: "测试用户",
    email: user?.email || "test@example.com",
    phone: "0912345678",
    address: "测试地址123号",
    city: "台北市",
    postal_code: "10001",
    country: "台灣",
    monthly_fee: "599",
  })

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testSubscriptionWrite = async () => {
    setTesting(true)
    setResult(null)
    setError(null)
    setLogs([])

    addLog("🚀 开始测试订阅数据写入...")

    try {
      if (!user) {
        throw new Error("用户未登录")
      }

      addLog(`📝 用户ID: ${user.id}`)
      addLog(`📧 用户邮箱: ${user.email}`)

      // 生成测试用的 PeriodNo 和其他数据
      const testPeriodNo = `TEST_${Date.now()}`
      const now = new Date()
      const authTime = 
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0')

      const merchantOrderNo = `TEST_ORDER_${Date.now()}`

      addLog(`🔢 PeriodNo: ${testPeriodNo}`)
      addLog(`⏰ AuthTime: ${authTime}`)
      addLog(`📦 订单号: ${merchantOrderNo}`)

      const requestData = {
        userId: user.id,
        periodNo: testPeriodNo,
        authTime: authTime,
        periodAmt: testData.monthly_fee,
        selectedPerfume: {
          id: "test-perfume-1",
          name: "测试香水",
          brand: "测试品牌",
          match_percentage: 95
        },
        userProfile: {
          name: testData.name,
          email: testData.email,
          phone: testData.phone,
          address: testData.address,
          city: testData.city,
          postal_code: testData.postal_code,
          country: testData.country,
        },
        merchantOrderNo: merchantOrderNo,
      }

      addLog("📤 发送请求到 /api/subscriptions/create...")
      addLog(`📊 请求数据: ${JSON.stringify(requestData, null, 2)}`)

      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      addLog(`📡 API 响应状态: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        addLog(`❌ API 错误: ${JSON.stringify(errorData)}`)
        throw new Error(`API 请求失败: ${response.status}`)
      }

      const responseData = await response.json()
      addLog("✅ API 响应成功")
      addLog(`📦 响应数据: ${JSON.stringify(responseData, null, 2)}`)

      setResult(responseData)
      addLog("🎉 测试完成！数据已成功写入 subscribers 表")

      // 验证数据是否真的写入了
      addLog("🔍 验证数据是否写入...")
      await verifyData(testPeriodNo)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "未知错误"
      addLog(`❌ 测试失败: ${errorMessage}`)
      setError(errorMessage)
    } finally {
      setTesting(false)
    }
  }

  const verifyData = async (periodNo: string) => {
    try {
      addLog("📡 读取数据库验证...")
      
      const response = await fetch(`/api/subscriptions/verify?periodNo=${periodNo}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.exists) {
          addLog("✅ 验证成功：数据确实存在于数据库中")
          addLog(`📊 数据库记录: ${JSON.stringify(data.subscription, null, 2)}`)
        } else {
          addLog("⚠️ 警告：API返回成功但数据库中未找到记录")
        }
      } else {
        addLog("⚠️ 无法验证数据（可能需要创建验证API）")
      }
    } catch (error) {
      addLog("⚠️ 验证时发生错误（这不影响写入结果）")
    }
  }

  const clearTestData = async () => {
    if (!confirm("确定要清除测试数据吗？这将删除所有以 TEST_ 开头的订阅记录")) {
      return
    }

    addLog("🗑️ 开始清除测试数据...")
    
    try {
      const response = await fetch("/api/subscriptions/cleanup-test", {
        method: "POST",
      })

      if (response.ok) {
        addLog("✅ 测试数据已清除")
      } else {
        addLog("⚠️ 清除失败（可能需要手动从数据库删除）")
      }
    } catch (error) {
      addLog("❌ 清除时发生错误")
    }
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-[#F5F2ED] py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-light text-gray-800 mb-2">订阅数据写入测试</h1>
            <p className="text-gray-600">测试是否能正确写入数据到 Supabase subscribers 表</p>
          </div>

          {/* 用户信息 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                当前用户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">User ID: </span>
                <code className="bg-gray-100 px-2 py-1 rounded">{user?.id}</code>
              </div>
              <div className="text-sm">
                <span className="font-medium">Email: </span>
                <code className="bg-gray-100 px-2 py-1 rounded">{user?.email}</code>
              </div>
            </CardContent>
          </Card>

          {/* 测试数据表单 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>测试数据</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={testData.name}
                    onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    value={testData.email}
                    onChange={(e) => setTestData({ ...testData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">电话</Label>
                  <Input
                    id="phone"
                    value={testData.phone}
                    onChange={(e) => setTestData({ ...testData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">城市</Label>
                  <Input
                    id="city"
                    value={testData.city}
                    onChange={(e) => setTestData({ ...testData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">地址</Label>
                  <Input
                    id="address"
                    value={testData.address}
                    onChange={(e) => setTestData({ ...testData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">邮编</Label>
                  <Input
                    id="postal_code"
                    value={testData.postal_code}
                    onChange={(e) => setTestData({ ...testData, postal_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="country">国家</Label>
                  <Input
                    id="country"
                    value={testData.country}
                    onChange={(e) => setTestData({ ...testData, country: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_fee">月费</Label>
                  <Input
                    id="monthly_fee"
                    value={testData.monthly_fee}
                    onChange={(e) => setTestData({ ...testData, monthly_fee: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={testSubscriptionWrite}
              disabled={testing}
              className="bg-gray-800 hover:bg-black text-white flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  开始测试
                </>
              )}
            </Button>
            
            <Button
              onClick={clearTestData}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清除测试数据
            </Button>
          </div>

          {/* 结果显示 */}
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>错误：</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>成功！</strong> 数据已写入数据库
                <div className="mt-2 bg-white p-3 rounded text-xs overflow-auto max-h-40">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 实时日志 */}
          <Card>
            <CardHeader>
              <CardTitle>测试日志 ({logs.length}条)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">点击"开始测试"查看日志...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1 leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 说明 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <p className="font-medium mb-2">💡 测试说明：</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>此测试使用与真实付款完全相同的 API：<code>/api/subscriptions/create</code></li>
              <li>测试数据的 PeriodNo 会以 "TEST_" 开头，方便识别和清理</li>
              <li>成功写入后会自动验证数据是否存在于数据库中</li>
              <li>查看实时日志了解每个步骤的执行情况</li>
              <li>测试完成后可以点击"清除测试数据"删除测试记录</li>
              <li>也可以直接在 Supabase 数据库中查看 subscribers 表</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
