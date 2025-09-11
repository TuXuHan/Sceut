"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, ExternalLink } from "lucide-react"

export default function SuccessPage() {
  const [quizAnswers, setQuizAnswers] = useState(null)

  // 頁面載入時自動滾動到頂部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // 安全地從 localStorage 獲取測驗答案
    try {
      if (typeof window !== "undefined") {
        const storedAnswers = localStorage.getItem("quizAnswers")
        if (storedAnswers) {
          setQuizAnswers(JSON.parse(storedAnswers))
        }
      }
    } catch (error) {
      console.error("Error retrieving quiz answers:", error)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C2B8A3] flex items-center justify-center text-white">
            <Check className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl font-extralight mb-4 tracking-wide">登記成功</h1>
        <p className="text-gray-600 mb-8 text-sm font-light leading-relaxed">
          感謝您登記成為我們的用戶。我們已收到您的資訊和香水偏好，您將很快收到確認電子郵件。
          <br />
          <br />
          我們的團隊將會透過您提供的電子郵件地址與您聯繫，提供個性化的香水訂閱方案和相關詳情。
        </p>

        <div className="bg-white border border-[#E8E2D9] p-6 mb-8 text-left shadow-sm">
          <h3 className="font-light text-sm mb-4 tracking-wide uppercase">接下來會發生什麼？</h3>
          <ul className="space-y-3 text-xs text-gray-600 font-light">
            <li className="flex items-start">
              <span className="mr-2 text-[#C2B8A3]">•</span>
              <span>我們將透過電子郵件發送登記確認和香水訂閱方案介紹</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#C2B8A3]">•</span>
              <span>我們的香水顧問將根據您的測驗結果為您量身定制訂閱計劃</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#C2B8A3]">•</span>
              <span>確認訂閱方案後，我們將處理您的第一個香水樣品</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#C2B8A3]">•</span>
              <span>您的香水樣品將在確認訂閱後 7-10 個工作日內送達</span>
            </li>
          </ul>
        </div>

        {/* 問卷調查表單區塊 */}
        <div className="bg-[#EAE5DC] border border-[#D8D2C9] p-6 mb-8 text-left shadow-sm">
          <h3 className="font-light text-sm mb-3 tracking-wide uppercase">幫助我們提供更好的服務</h3>
          <p className="text-xs text-gray-600 font-light mb-4">
            填寫我們的問卷調查，幫助我們了解您的香水偏好，讓我們能夠為您提供更精準的推薦。
            <span className="block mt-2 font-medium text-gray-700">
              我們將從填寫問卷的用戶中抽取三位幸運兒，贈送首月免費訂閱！
            </span>
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeDeNp-Kl7IPdfLzhF7WMeqhU0UtWLmRmGTx1gfluVeN5rIAg/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-light text-gray-800 hover:text-gray-600 transition-colors bg-white px-4 py-2 border border-[#D8D2C9]"
          >
            <span>填寫問卷</span>
            <ExternalLink className="ml-2 w-3 h-3" />
          </a>
        </div>

        <div className="flex justify-center">
          <Button
            asChild
            className="bg-[#C2B8A3] hover:bg-[#A69E8B] text-white rounded-none h-12 px-8 text-xs font-light tracking-widest uppercase relative z-10 overflow-hidden group"
          >
            <Link href="/">
              <span className="relative z-10">返回首頁</span>
              <span className="absolute inset-0 bg-[#A69E8B] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
