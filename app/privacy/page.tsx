"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  Database,
  Eye,
  Lock,
  Users,
  Settings,
  FileText,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
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
              <h1 className="text-2xl font-extralight text-gray-800 tracking-wide">隱私政策</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm border border-[#E8E2D9] p-8">
          {/* Introduction */}
          <div className="mb-8 text-center">
            <Shield className="w-12 h-12 text-[#C2B8A3] mx-auto mb-4" />
            <h2 className="text-xl font-light text-[#6D5C4A] mb-2">SCEUT 隱私政策</h2>
            <p className="text-sm text-gray-600 font-light">最後更新日期：2025年1月1日</p>
            <p className="text-sm text-gray-600 font-light mt-2">我們重視您的隱私權，致力於保護您的個人資料安全。</p>
          </div>

          <div className="space-y-8">
            {/* 1. 政策概述 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    1
                  </span>
                  政策概述
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>本隱私政策說明 SCEUT（以下簡稱「本公司」、「我們」）如何收集、使用、儲存及保護您的個人資料。</p>
                <p>使用我們的服務即表示您同意本隱私政策的內容。我們承諾：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>僅收集提供服務所必需的資料</li>
                  <li>不會將您的資料出售給第三方</li>
                  <li>採用業界標準的安全措施保護資料</li>
                  <li>尊重您對個人資料的控制權</li>
                </ul>
              </CardContent>
            </Card>

            {/* 2. 收集的資料類型 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Database className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    2
                  </span>
                  收集的資料類型
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-4 font-light">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">個人識別資料：</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>姓名、電子郵件地址</li>
                    <li>電話號碼</li>
                    <li>配送地址</li>
                    <li>付款資訊（透過第三方支付處理）</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">偏好與行為資料：</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>香氣偏好測驗結果</li>
                    <li>產品評價與回饋</li>
                    <li>網站使用行為</li>
                    <li>購買歷史記錄</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">技術資料：</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>IP 地址、瀏覽器類型</li>
                    <li>裝置資訊</li>
                    <li>Cookie 和類似技術</li>
                    <li>網站分析資料</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 3. 資料收集方式 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    3
                  </span>
                  資料收集方式
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>我們透過以下方式收集您的資料：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong>直接收集：</strong>註冊帳戶、填寫表單、進行測驗時
                  </li>
                  <li>
                    <strong>自動收集：</strong>使用網站時的技術資料
                  </li>
                  <li>
                    <strong>第三方來源：</strong>社群媒體登入、支付處理商
                  </li>
                  <li>
                    <strong>互動收集：</strong>客服聯繫、問卷調查
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. 資料使用目的 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Eye className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    4
                  </span>
                  資料使用目的
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>我們使用您的資料用於：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong>服務提供：</strong>處理訂單、配送產品、客戶服務
                  </li>
                  <li>
                    <strong>個人化：</strong>香水推薦、客製化體驗
                  </li>
                  <li>
                    <strong>溝通：</strong>服務通知、行銷資訊（經同意）
                  </li>
                  <li>
                    <strong>改善服務：</strong>分析使用模式、優化網站功能
                  </li>
                  <li>
                    <strong>法律遵循：</strong>滿足法律義務、防範詐欺
                  </li>
                  <li>
                    <strong>安全維護：</strong>保護帳戶安全、防止濫用
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 5. 資料分享與揭露 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Users className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    5
                  </span>
                  資料分享與揭露
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-4 font-light">
                <p>我們僅在以下情況分享您的資料：</p>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">服務提供商：</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>物流配送公司</li>
                    <li>支付處理服務商</li>
                    <li>雲端服務提供商</li>
                    <li>客戶服務平台</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">法律要求：</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>法院命令或法律程序</li>
                    <li>政府機關合法要求</li>
                    <li>保護權利和安全的必要情況</li>
                  </ul>
                </div>
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>重要承諾：</strong>我們絕不會為了商業利益而出售您的個人資料給第三方。
                </p>
              </CardContent>
            </Card>

            {/* 6. 資料安全措施 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Lock className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    6
                  </span>
                  資料安全措施
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-4 font-light">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">技術安全措施：</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>SSL/TLS 加密傳輸</li>
                    <li>資料庫加密儲存</li>
                    <li>定期安全更新與修補</li>
                    <li>防火牆和入侵偵測系統</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">管理安全措施：</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>員工資料保護培訓</li>
                    <li>最小權限存取原則</li>
                    <li>定期安全稽核</li>
                    <li>事故應變計畫</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 7. Cookie 政策 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Settings className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    7
                  </span>
                  Cookie 政策
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>我們使用 Cookie 和類似技術來：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong>必要 Cookie：</strong>維持登入狀態、購物車功能
                  </li>
                  <li>
                    <strong>功能 Cookie：</strong>記住偏好設定、語言選擇
                  </li>
                  <li>
                    <strong>分析 Cookie：</strong>了解網站使用情況（Google Analytics）
                  </li>
                  <li>
                    <strong>行銷 Cookie：</strong>個人化廣告（需經同意）
                  </li>
                </ul>
                <p>您可以透過瀏覽器設定管理 Cookie 偏好。</p>
              </CardContent>
            </Card>

            {/* 8. 資料保存期限 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    8
                  </span>
                  資料保存期限
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>我們保存您的資料期限如下：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong>帳戶資料：</strong>帳戶存續期間及刪除後1年
                  </li>
                  <li>
                    <strong>交易記錄：</strong>法律要求的最短期限（通常5年）
                  </li>
                  <li>
                    <strong>行銷資料：</strong>取消同意後立即刪除
                  </li>
                  <li>
                    <strong>技術日誌：</strong>最多保存2年
                  </li>
                </ul>
                <p>超過保存期限的資料將被安全刪除或匿名化處理。</p>
              </CardContent>
            </Card>

            {/* 9. 您的權利 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <FileText className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    9
                  </span>
                  您的權利
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>根據個人資料保護法，您享有以下權利：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong>查詢權：</strong>要求查閱您的個人資料
                  </li>
                  <li>
                    <strong>更正權：</strong>要求更正不正確的資料
                  </li>
                  <li>
                    <strong>刪除權：</strong>要求刪除您的個人資料
                  </li>
                  <li>
                    <strong>停止處理權：</strong>要求停止處理您的資料
                  </li>
                  <li>
                    <strong>資料可攜權：</strong>要求以結構化格式提供資料
                  </li>
                  <li>
                    <strong>撤回同意權：</strong>隨時撤回先前給予的同意
                  </li>
                </ul>
                <p>如需行使這些權利，請聯繫我們的客服團隊。</p>
              </CardContent>
            </Card>

            {/* 10. 兒童隱私保護 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <AlertCircle className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    10
                  </span>
                  兒童隱私保護
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-3 font-light">
                <p>我們重視兒童隱私保護：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>本服務僅供18歲以上人士使用</li>
                  <li>不會故意收集未滿18歲兒童的個人資料</li>
                  <li>如發現誤收兒童資料，將立即刪除</li>
                  <li>家長可聯繫我們處理相關問題</li>
                </ul>
              </CardContent>
            </Card>

            {/* 11. 政策更新與聯繫方式 */}
            <Card className="border-[#E8E2D9]">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-light text-[#6D5C4A]">
                  <Phone className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                  <span className="bg-[#C2B8A3] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                    11
                  </span>
                  政策更新與聯繫方式
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-4 font-light">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">政策更新：</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>重大變更將提前30天通知</li>
                    <li>更新內容將在網站上公告</li>
                    <li>繼續使用服務視為同意更新後的政策</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">聯繫我們：</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-[#C2B8A3]" />
                      <span>隱私問題專線：Sceut.tw@gmail.com</span>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#E8E2D9] text-center">
            <p className="text-xs text-gray-500 font-light mb-4">
              我們承諾保護您的隱私權，如有任何疑問，歡迎隨時聯繫我們。
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
