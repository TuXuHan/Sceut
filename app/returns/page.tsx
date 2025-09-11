"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ReturnsPage() {
  const router = useRouter()

  const handleBackToHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 flex items-center justify-between border-b border-[#EFEFEF]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-light tracking-widest text-gray-800 uppercase">退換貨政策</h1>
        </div>
        <div className="w-10 h-10"></div> {/* Placeholder for balance */}
      </header>

      {/* Content */}
      <div className="container max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-sm max-w-none">
          <h2 className="text-xl font-light mb-6">Sceut 退換貨政策</h2>
          <p className="text-sm text-gray-600 mb-4">最後更新日期：2025年6月25日</p>

          <p className="text-sm text-gray-600 mb-4">
            我們致力於提供令您滿意的香氣體驗。若您對收到的商品有任何疑慮，請參考以下退換貨政策。
          </p>

          <h3 className="text-lg font-light mt-8 mb-4">1. 退貨條件</h3>
          <p className="text-sm text-gray-600 mb-4">
            1.1 <strong>商品瑕疵或損壞</strong>
            ：若您收到的商品有瑕疵、損壞或與訂單不符，請於收到商品後的7天內與我們聯繫。我們將協助您進行退貨或換貨處理。
            <br />
            1.2 <strong>未開封商品</strong>
            ：對於未開封且包裝完好的香水樣品，若您改變心意，可在收到商品後的7天內申請退貨。退回的商品必須保持原始狀態，不得影響二次銷售。
            <br />
            1.3 <strong>已開封商品</strong>
            ：基於衛生考量，已開封或已使用的香水樣品，除非商品本身存在瑕疵，否則恕不接受退貨。
          </p>

          <h3 className="text-lg font-light mt-8 mb-4">2. 換貨條件</h3>
          <p className="text-sm text-gray-600 mb-4">
            2.1 <strong>商品瑕疵或損壞</strong>：若您收到的商品有瑕疵或損壞，我們將為您更換相同商品。
            <br />
            2.2 <strong>香氣不適</strong>
            ：我們理解香氣的個人偏好差異。若您對當月收到的香水樣品香氣不適應，雖然已開封商品原則上不予退換，但我們鼓勵您與客服聯繫，我們將視情況提供協助或未來選香建議。
          </p>

          <h3 className="text-lg font-light mt-8 mb-4">3. 退換貨流程</h3>
          <p className="text-sm text-gray-600 mb-4">
            3.1 請通過電子郵件 Sceut.tw@gmail.com
            與我們的客服團隊聯繫，並提供您的訂單號碼、商品照片（若為瑕疵品）及退換貨原因。
            <br />
            3.2 客服團隊將在1-2個工作日內回覆您的請求，並指導您完成後續步驟。
            <br />
            3.3 退貨商品寄回的運費需由顧客自行負擔，除非退貨原因是商品瑕疵或我方失誤。
            <br />
            3.4 收到並確認退回商品符合退貨條件後，我們將在7-10個工作日內處理退款或寄出換貨商品。
          </p>

          <h3 className="text-lg font-light mt-8 mb-4">4. 退款說明</h3>
          <p className="text-sm text-gray-600 mb-4">
            4.1 退款將依照您原先的付款方式進行。
            <br />
            4.2 若您符合退款條件，退款金額將為商品原價，不包含原始運費（若有）。
          </p>

          <h3 className="text-lg font-light mt-8 mb-4">5. 注意事項</h3>
          <p className="text-sm text-gray-600 mb-4">
            5.1 Sceut 保留修改本退換貨政策之權利，任何修改將於網站公告後生效。
            <br />
            5.2 若有任何爭議，Sceut 保留最終決定權。
          </p>

          <h3 className="text-lg font-light mt-8 mb-4">6. 聯繫我們</h3>
          <p className="text-sm text-gray-600 mb-4">
            若您對退換貨政策有任何疑問，歡迎隨時聯繫我們：
            <br />
            電子郵件：Sceut.tw@gmail.com
          </p>
        </div>

        <div className="mt-12 text-center">
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
  )
}
