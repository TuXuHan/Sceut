"use client"

import Link from "next/link"
import {
  ArrowLeft,
  FileText,
  Shield,
  CreditCard,
  Truck,
  RotateCcw,
  AlertTriangle,
  Scale,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  const handleBackToHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E8E2D9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="text-[#8A7B6C] hover:text-[#6D5C4A]">
                <Link href="/" onClick={handleBackToHome}>
                  <ArrowLeft size={20} className="mr-2" />
                  返回首頁
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-extralight text-gray-800 tracking-wide">服務條款</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm border border-[#E8E2D9] p-8">
          {/* Introduction */}
          <div className="mb-8 text-center">
            <FileText className="w-12 h-12 text-[#C2B8A3] mx-auto mb-4" />
            <h2 className="text-xl font-light text-[#6D5C4A] mb-2">SCEUT 服務條款</h2>
            <p className="text-sm text-gray-600 font-light">最後更新日期：2026 年 2 月 13 日</p>
          </div>

          <div className="space-y-8">
            {/* 1. 服務說明 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    1
                  </span>
                  服務說明
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>SCEUT（以下簡稱「本公司」）提供個人化香水訂閱服務，透過專業的香氣測驗為用戶推薦適合的香水產品。</p>
                <p>本服務包括但不限於：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>個人化香氣偏好測驗</li>
                  <li>每月精選香水配送服務</li>
                  <li>專業香氣諮詢與建議</li>
                  <li>會員專屬優惠與活動</li>
                </ul>
              </CardContent>
            </Card>

            {/* 2. 用戶資格與註冊 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    2
                  </span>
                  用戶資格與註冊
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>使用本服務需符合以下條件：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>年滿18歲或經法定代理人同意</li>
                  <li>提供真實、準確的個人資訊</li>
                  <li>擁有有效的電子郵件地址</li>
                  <li>同意遵守本服務條款</li>
                </ul>
                <p>用戶有責任維護帳戶安全，並對帳戶下的所有活動負責。</p>
              </CardContent>
            </Card>

            {/* 3. 訂閱方案與計費 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <CreditCard className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    3
                  </span>
                  訂閱方案與計費
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>訂閱方案詳情：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>每月精選香水方案：NT$599/月</li>
                  <li>自動續約，可隨時取消</li>
                  <li>首次訂閱享有 7 天鑑賞期</li>
                  <li>費用將於每月同一日期自動扣款</li>
                </ul>
                <p>價格可能因促銷活動而調整，調整後的價格僅作用於活動期間加入的用戶。</p>
              </CardContent>
            </Card>

            {/* 4. 配送政策 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Truck className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    4
                  </span>
                  配送政策
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>配送服務說明：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>台灣本島免費配送</li>
                  <li>離島地區酌收運費NT$100</li>
                  <li>預計配送時間：3-5個工作天</li>
                  <li>提供配送追蹤服務</li>
                  <li>需有人簽收，無法投遞至郵政信箱</li>
                  <li>如因個人因素無法取貨，本公司將保管至隔月共同寄出</li>
                </ul>
                <p>如因不可抗力因素導致配送延遲，本公司將主動通知並協助處理。</p>
              </CardContent>
            </Card>

            {/* 5. 退換貨政策 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <RotateCcw className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    5
                  </span>
                  退換貨政策
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>退換貨條件：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>商品收到後7天內可申請退換貨</li>
                  <li>商品需保持原包裝完整</li>
                  <li>香水使用量不得超過10%</li>
                  <li>需提供購買憑證</li>
                </ul>
                <p>退款將於收到退貨商品後5-7個工作天內處理完成。</p>
              </CardContent>
            </Card>

            {/* 6. 取消訂閱 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    6
                  </span>
                  取消訂閱
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>用戶可隨時取消訂閱：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>透過會員中心線上取消</li>
                  <li>聯繫客服協助取消</li>
                  <li>取消後將於下個計費週期生效</li>
                  <li>已付費的當期服務仍可正常使用</li>
                </ul>
              </CardContent>
            </Card>

            {/* 7. 智慧財產權 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Shield className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    7
                  </span>
                  智慧財產權
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>本網站及服務的所有內容，包括但不限於：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>網站設計、文字、圖片、商標</li>
                  <li>香氣測驗演算法</li>
                  <li>推薦系統技術</li>
                  <li>用戶介面設計</li>
                </ul>
                <p>均受智慧財產權法保護，未經授權不得使用。</p>
              </CardContent>
            </Card>

            {/* 8. 免責聲明 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <AlertTriangle className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    8
                  </span>
                  免責聲明
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>本公司不對以下情況承擔責任：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>因個人體質差異導致的過敏反應</li>
                  <li>因不當使用產品造成的損害</li>
                  <li>因網路中斷或系統維護造成的服務暫停</li>
                  <li>因不可抗力因素造成的服務中斷</li>
                </ul>
                <p>建議用戶在使用新香水前先進行皮膚測試。</p>
              </CardContent>
            </Card>

            {/* 9. 適用法律 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Scale className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    9
                  </span>
                  適用法律
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>本服務條款適用中華民國法律。如有爭議，雙方同意以台北地方法院為第一審管轄法院。</p>
                <p>本條款如有部分無效，不影響其他條款的效力。</p>
              </CardContent>
            </Card>

            {/* 10. 條款修改 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    10
                  </span>
                  條款修改
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>本公司保留修改服務條款的權利：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>重大修改將提前30天通知用戶</li>
                  <li>修改內容將在網站上公告</li>
                  <li>繼續使用服務視為同意修改後的條款</li>
                  <li>如不同意修改，可選擇停止使用服務</li>
                </ul>
              </CardContent>
            </Card>

            {/* 11. 聯絡資訊 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Phone className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    11
                  </span>
                  聯絡資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>如對本服務條款有任何疑問，請聯繫我們：</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-[#C2B8A3]" />
                    <span>客服信箱：Sceut.tw@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[#C2B8A3]" />
                    <span>服務時間：週一至週五 09:00-18:00</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#C2B8A3]" />
                    <span>公司地址：台北市文山區久康街24巷36號</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#E8E2D9] text-center">
            <p className="text-xs text-gray-500 font-light mb-4">
              感謝您選擇 SCEUT，我們致力於為您提供最優質的香氣體驗。
            </p>
            <Button
              asChild
              className="bg-[#A69E8B] hover:bg-[#8A7B6C] text-white rounded-none px-8 py-2 text-sm font-light tracking-widest uppercase"
            >
              <Link href="/" onClick={handleBackToHome}>
                返回首頁
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
