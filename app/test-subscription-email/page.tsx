"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, Send, Loader2, AlertCircle, User } from "lucide-react"
import { useAuth } from "@/app/auth-provider"

export default function TestSubscriptionEmailPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    subscriptionId: "SUB-" + Date.now().toString().slice(-6),
    periodNo: "PER" + Date.now().toString().slice(-9),
    monthlyFee: 599,
    perfumeName: "Chanel No.5",
    perfumeBrand: "Chanel"
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  // 自動獲取當前登入者資訊
  useEffect(() => {
    if (user) {
      const userEmail = user.email || user.user_metadata?.email || ""
      const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "用戶"
      
      setFormData(prev => ({
        ...prev,
        email: userEmail,
        userName: userName
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyFee' ? parseInt(value) || 0 : value
    }))
  }

  const handleSendEmail = async () => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      console.log("🧪 開始發送測試郵件...")
      console.log("郵件資料:", formData)

      const response = await fetch("/api/test-subscription-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("郵件發送結果:", data)

      if (!response.ok) {
        throw new Error(data.error || "郵件發送失敗")
      }

      setResult(data)
    } catch (err) {
      console.error("郵件發送錯誤:", err)
      setError(err instanceof Error ? err.message : "發送失敗")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickTest = () => {
    if (user) {
      const userEmail = user.email || user.user_metadata?.email || "sceut.tw@gmail.com"
      const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "測試用戶"
      
      setFormData({
        email: userEmail,
        userName: userName,
        subscriptionId: "SUB-" + Date.now().toString().slice(-6),
        periodNo: "PER" + Date.now().toString().slice(-9),
        monthlyFee: 599,
        perfumeName: "Chanel No.5",
        perfumeBrand: "Chanel"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📧 訂閱成功郵件測試
          </h1>
          <p className="text-gray-600">
            測試訂閱成功時發送的確認郵件功能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：郵件資料表單 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                郵件資料設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 當前登入者資訊顯示 */}
              {user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">當前登入者資訊</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p><strong>電子郵件：</strong>{user.email || user.user_metadata?.email || "未設定"}</p>
                    <p><strong>姓名：</strong>{user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "未設定"}</p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">收件人電子郵件</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <Label htmlFor="userName">用戶姓名</Label>
                <Input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="王小明"
                />
              </div>

              <div>
                <Label htmlFor="subscriptionId">訂閱編號</Label>
                <Input
                  id="subscriptionId"
                  name="subscriptionId"
                  value={formData.subscriptionId}
                  onChange={handleInputChange}
                  placeholder="SUB-123456"
                />
              </div>

              <div>
                <Label htmlFor="periodNo">定期定額編號</Label>
                <Input
                  id="periodNo"
                  name="periodNo"
                  value={formData.periodNo}
                  onChange={handleInputChange}
                  placeholder="PER123456789"
                />
              </div>

              <div>
                <Label htmlFor="monthlyFee">月費 (NT$)</Label>
                <Input
                  id="monthlyFee"
                  name="monthlyFee"
                  type="number"
                  value={formData.monthlyFee}
                  onChange={handleInputChange}
                  placeholder="599"
                />
              </div>

              <div>
                <Label htmlFor="perfumeName">香水名稱</Label>
                <Input
                  id="perfumeName"
                  name="perfumeName"
                  value={formData.perfumeName}
                  onChange={handleInputChange}
                  placeholder="Chanel No.5"
                />
              </div>

              <div>
                <Label htmlFor="perfumeBrand">香水品牌</Label>
                <Input
                  id="perfumeBrand"
                  name="perfumeBrand"
                  value={formData.perfumeBrand}
                  onChange={handleInputChange}
                  placeholder="Chanel"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSendEmail} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      發送中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      發送測試郵件
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleQuickTest}
                  variant="outline"
                >
                  快速測試
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 右側：結果顯示 */}
          <div className="space-y-6">
            {/* 郵件預覽 */}
            <Card>
              <CardHeader>
                <CardTitle>郵件預覽</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-4 text-sm">
                  <div className="mb-4">
                    <strong>主旨:</strong> Sceut 訂閱成功通知
                  </div>
                  <div className="mb-4">
                    <strong>發件人:</strong> Sceut &lt;noreply@sceut.com&gt;
                  </div>
                  <div className="mb-4">
                    <strong>收件人:</strong> {formData.email}
                  </div>
                  <hr className="my-4" />
                  <div className="space-y-3">
                    <p>Dear <strong>{formData.userName}</strong>,</p>
                    <p>您已成功訂閱Sceut的服務，誠摯感謝您成為我們香氣旅程中的同行者...</p>
                    <p>感謝您選擇了 Sceut，對我們而言，每一次相遇都值得被記住...</p>
                    <p>歡迎追蹤我們的 Instagram (@Sceut_tw)，獲得第一手品牌消息與香水知識。</p>
                    <p>屬於您的香氣之旅，正式啟程。</p>
                    <p>祝您一切安好，<br/>Sceut 香氣團隊 敬上</p>
                    <p className="text-xs text-gray-500">sceut.tw@gmail.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 發送結果 */}
            {result && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    郵件發送成功
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>郵件 ID:</strong> 
                      <Badge variant="secondary" className="ml-2">
                        {result.result?.data?.id || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <strong>發送到:</strong> {result.sentTo}
                    </div>
                    <div>
                      <strong>發送時間:</strong> {new Date().toLocaleString()}
                    </div>
                    <div>
                      <strong>狀態:</strong> 
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        已發送
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ 郵件已成功發送！請檢查收件箱（包括垃圾郵件資料夾）。
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 錯誤資訊 */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    發送失敗
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-800">
                      ❌ {error}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 使用說明 */}
            <Card>
              <CardHeader>
                <CardTitle>使用說明</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>1. <strong>填寫郵件資料</strong>：設定收件人、用戶資訊等</p>
                <p>2. <strong>點擊發送</strong>：測試郵件發送功能</p>
                <p>3. <strong>檢查郵箱</strong>：查看收到的郵件內容和格式</p>
                <p>4. <strong>快速測試</strong>：使用預設資料快速測試</p>
                <hr className="my-3" />
                <p className="text-blue-600">
                  💡 這個測試頁面模擬了實際訂閱成功時的郵件發送過程
                </p>
                <p className="text-green-600">
                  ✨ 系統會自動抓取當前登入者的電子郵件和姓名
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}