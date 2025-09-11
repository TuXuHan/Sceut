"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useEffect } from "react"

export default function FAQPage() {
  const router = useRouter()

  // 頁面載入時自動滾動到頂部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const faqs = [
    {
      question: "Sceut 是如何運作的？",
      answer:
        "Sceut 是一個香水訂閱服務。您首先完成一個香氣測驗，告訴我們您的偏好。然後，根據您的測驗結果，我們會每月為您精心挑選一款來自全球頂級品牌或小眾品牌的香水試用裝（通常為8ml，約可使用一個月），直接寄送到您家。",
    },
    {
      question: "訂閱費用是多少？包含哪些內容？",
      answer:
        "我們的標準訂閱費用是每月 NT$599。此費用包含一款由專家根據您的偏好挑選的香水試用裝、精美的包裝以及台灣本島的免運費服務。",
    },
    {
      question: "我可以選擇自己想要的香水嗎？",
      answer:
        "Sceut 的核心理念是幫助您探索和發現新的香氣。因此，我們主要根據您的香氣測驗結果和持續的反饋為您推薦香水。不過，我們未來可能會推出讓會員指定部分香水的選項，敬請期待！",
    },
    {
      question: "香水試用裝有多大？大概能用多久？",
      answer:
        "我們提供的香水試用裝通常是 8ml 的規格。這樣的容量大約足夠您每天使用，持續一個月左右（約120-150次噴灑）。",
    },
    {
      question: "如果我不喜歡收到的香水怎麼辦？",
      answer:
        "香氣的體驗非常個人。如果您對某個月的香水不太滿意，我們鼓勵您在會員中心的「香氣偏好」中更新您的反饋，這將幫助我們未來為您做出更精準的推薦。關於退換貨，請參考我們的「退換貨政策」頁面。",
    },
    {
      question: "如何取消或暫停我的訂閱？",
      answer:
        "您可以隨時在會員中心的「訂閱管理」頁面操作取消或暫停您的訂閱。取消訂閱將在您當前已付款的訂閱週期結束後生效。暫停訂閱則可以讓您跳過特定月份的配送。",
    },
    {
      question: "配送需要多久時間？",
      answer:
        "在您完成訂閱並付款後，我們會開始準備您的香水。通常，您會在每月固定的日期（例如月中）收到您的香水包裹。我們會提前通過電子郵件通知您預計的配送時間。",
    },
    {
      question: "Sceut 的香水是正品嗎？",
      answer:
        "是的，我們保證所有提供的香水均為100%正品。我們直接從品牌授權的供應商或品牌方採購，確保您體驗到的是最真實的香氣。",
    },
  ]

  const handleEmailContact = () => {
    try {
      window.open("mailto:Sceut.tw@gmail.com?subject=Sceut客服諮詢&body=您好，我想詢問關於Sceut的問題：", "_blank")
    } catch (error) {
      // Fallback: copy email to clipboard
      navigator.clipboard
        .writeText("Sceut.tw@gmail.com")
        .then(() => {
          alert("電子郵件地址已複製到剪貼板：Sceut.tw@gmail.com")
        })
        .catch(() => {
          alert("請發送郵件至：Sceut.tw@gmail.com")
        })
    }
  }

  const handleInstagramContact = () => {
    try {
      window.open(
        "https://www.instagram.com/sceut_tw?utm_source=ig_web_button_share_sheet&igsh=bXY0NXMzaDB4NXRx",
        "_blank",
      )
    } catch (error) {
      alert("請前往 Instagram 搜尋：sceut_tw")
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 flex items-center justify-between border-b border-[#EFEFEF]">
        <button
          onClick={handleBackToHome}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-light tracking-widest text-gray-800 uppercase">常見問題</h1>
        </div>
        <div className="w-10 h-10"></div>
      </header>

      {/* Content */}
      <div className="container max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-xl font-light text-center mb-2 text-gray-800">有任何疑問嗎？</h2>
          <p className="text-center text-sm text-gray-600 font-light">我們在這裡為您解答。</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-[#E8E2D9] bg-white shadow-sm rounded-md"
            >
              <AccordionTrigger className="px-6 py-4 text-sm font-medium text-gray-700 hover:bg-[#F5F2ED] transition-colors text-left rounded-t-md">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-2 text-sm text-gray-600 font-light leading-relaxed bg-white rounded-b-md">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-6 font-light">找不到您要的答案嗎？</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleEmailContact}
              className="bg-gray-800 hover:bg-black text-white rounded-none h-10 px-6 text-xs font-light tracking-widest uppercase flex items-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              電子郵件聯絡
            </Button>

            <Button
              onClick={handleInstagramContact}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-none h-10 px-6 text-xs font-light tracking-widest uppercase flex items-center bg-transparent"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Instagram 私訊
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4 font-light">
            * Instagram 私訊回覆時間可能較長，如需即時協助請優先使用電子郵件聯絡
          </p>
        </div>
      </div>
    </div>
  )
}
