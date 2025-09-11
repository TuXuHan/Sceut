"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Construction, Shield, Mail, Clock, CheckCircle, Loader2, AlertCircle, Users, CreditCard } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"

export default function PaymentPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const { user } = useAuth()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitContactRequest = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      toast({
        variant: "destructive",
        title: "請填寫必要資訊",
        description: "請填寫姓名和 Email",
      })
      return
    }

    setSubmitting(true)

    try {
      // 模擬提交延遲
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 儲存申請記錄到 localStorage
      const requestData = {
        ...contactInfo,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        status: "pending",
      }

      localStorage.setItem("payment_contact_request", JSON.stringify(requestData))

      setSubmitted(true)
      toast({
        title: "申請已提交",
        description: "我們將在 24 小時內與您聯絡",
      })
    } catch (error) {
      console.error("提交申請失敗:", error)
      toast({
        variant: "destructive",
        title: "提交失敗",
        description: "請稍後再試",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToForm = () => {
    setSubmitted(false)
    setContactInfo({
      name: "",
      email: user?.email || "",
      phone: "",
      message: "",
    })
  }

  if (submitted) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="space-y-6">
          <div className="text-center space-y-6 py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-800 mb-4">申請已提交！</h2>
              <p className="text-gray-600 font-light mb-6">
                感謝您的申請！我們的專業顧問將在 24 小時內透過 Gmail 與您聯絡，協助您完成付款設定。
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-green-800 mb-2">後續流程</h4>
                  <ul className="text-sm text-green-700 font-light space-y-1">
                    <li>• 專業客服將在 24 小時內聯絡您</li>
                    <li>• 協助設定安全的付款方式</li>
                    <li>• 確認您的訂閱計畫</li>
                    <li>• 解答任何付款相關問題</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 font-light mb-4">
                請留意您的信箱：<span className="font-medium">{contactInfo.email}</span>
              </p>
              <Button
                onClick={handleBackToForm}
                variant="outline"
                className="rounded-none border-gray-300 bg-transparent"
              >
                返回設定頁面
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extralight text-gray-800 mb-2 tracking-wide">付款設定</h1>
          <p className="text-gray-600 font-light">管理您的付款方式和帳單資訊</p>
        </div>

        {/* 系統升級通知 */}
        <Card className="border-[#E8E2D9] shadow-sm">
          <CardContent className="p-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Construction className="w-6 h-6 mr-3" />
                <h2 className="text-xl font-light">付款系統測試中</h2>
              </div>
              <p className="text-white/90 mb-4 font-light">
                為了提供您更安全、便捷的付款體驗，我們的付款系統正在進行全面升級。
                在升級期間，我們提供專業的一對一客製化協助服務。
              </p>
              <div className="flex items-center text-white/90">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-light">專人將在 24 小時內與您聯絡</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：申請專人協助 */}
          <Card className="border-[#E8E2D9] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-light text-[#6D5C4A] tracking-wide">
                <Mail className="w-5 h-5 mr-2" />
                申請付款設定協助
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-2">專人協助服務</h3>
                    <p className="text-blue-700 text-sm font-light leading-relaxed">
                      我們的付款專家將根據您的需求，提供一對一的專業協助，確保您的付款設定安全便捷。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-light text-gray-700">
                    姓名 *
                  </Label>
                  <Input
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="請輸入您的姓名"
                    className="rounded-none border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-light text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email || user?.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="請輸入您的 Gmail 信箱"
                    className="rounded-none border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-light text-gray-700">
                    電話
                  </Label>
                  <Input
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="請輸入您的聯絡電話（選填）"
                    className="rounded-none border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-light text-gray-700">
                    需求說明
                  </Label>
                  <Textarea
                    id="message"
                    value={contactInfo.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="請說明您的付款設定需求或問題（選填）"
                    className="rounded-none border-gray-300 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmitContactRequest}
                disabled={!contactInfo.name || !contactInfo.email || submitting}
                className="w-full bg-[#A69E8B] hover:bg-[#8A7B6C] text-white rounded-none text-sm font-light tracking-widest uppercase"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    申請專人協助
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 右側：服務說明 */}
          <Card className="border-[#E8E2D9] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-light text-[#6D5C4A] tracking-wide">
                <Users className="w-5 h-5 mr-2" />
                專業付款協助服務
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">我們將協助您：</h4>
                  <ul className="space-y-2 text-gray-600 font-light">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      設定安全的付款方式
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      配置自動扣款設定
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      帳單和發票管理
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      付款問題疑難排解
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      訂閱方案調整建議
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">安全保障：</h4>
                  <ul className="space-y-2 text-gray-600 font-light">
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      銀行級加密保護
                    </li>
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      PCI DSS 安全認證
                    </li>
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      24/7 交易監控
                    </li>
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      隨時可取消或修改
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-light">
                    <strong>專業提醒：</strong>
                    我們的付款專家將根據您的需求，推薦最適合的付款方案，確保您的訂閱體驗安全便捷。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 服務流程說明 */}
        <Card className="border-[#E8E2D9] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-light text-[#6D5C4A] tracking-wide">
              <Clock className="w-5 h-5 mr-2" />
              服務流程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#A69E8B] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-semibold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">提交申請</h3>
                <p className="text-sm text-gray-600 font-light">填寫上方表單，提交您的付款設定需求</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#A69E8B] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-semibold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">專員聯繫</h3>
                <p className="text-sm text-gray-600 font-light">24小時內專業客服人員將與您聯繫</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#A69E8B] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-semibold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">完成設定</h3>
                <p className="text-sm text-gray-600 font-light">協助您完成安全的付款方式設定</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 聯絡資訊 */}
        <Card className="border-[#E8E2D9] shadow-sm bg-[#F8F6F2]">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-light text-[#6D5C4A] tracking-wide">
              <CreditCard className="w-5 h-5 mr-2" />
              聯絡我們
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#A69E8B]" />
                <div>
                  <p className="font-medium text-gray-900">客戶服務</p>
                  <p className="text-sm text-gray-600">Sceut.tw@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#A69E8B]" />
                <div>
                  <p className="font-medium text-gray-900">聯絡電話</p>
                  <p className="text-sm text-gray-600">sceut_tw</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>服務時間：</strong>週一至週五 09:00-18:00
                <br />
                我們致力於在24小時內回覆您的申請，並提供最專業的付款設定協助。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
