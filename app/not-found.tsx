"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#F5F2ED] rounded-full flex items-center justify-center">
            <div className="text-4xl text-[#C2B8A3]">404</div>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-gray-800 mb-4">頁面不存在</h1>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            抱歉，您要尋找的頁面可能已被移動或不存在。
            <br />
            讓我們幫您回到正確的地方。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-none h-10 px-6 text-xs font-light tracking-widest uppercase flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上頁
          </Button>

          <Button
            asChild
            className="bg-gray-800 hover:bg-black text-white rounded-none h-10 px-6 text-xs font-light tracking-widest uppercase flex items-center"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              回到首頁
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-[#E8E2D9]">
          <p className="text-xs text-gray-500 font-light mb-4">需要協助嗎？</p>
          <Button
            onClick={() => {
              try {
                window.open("mailto:Sceut.tw@gmail.com?subject=網站問題回報&body=我在瀏覽網站時遇到了問題：", "_blank")
              } catch (error) {
                alert("請發送郵件至：Sceut.tw@gmail.com")
              }
            }}
            variant="ghost"
            className="text-xs font-light text-[#8A7B6C] hover:text-[#6D5C4A]"
          >
            聯絡客服
          </Button>
        </div>
      </div>
    </div>
  )
}
