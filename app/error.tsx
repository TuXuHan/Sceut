"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Home, Mail } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const handleEmailContact = () => {
    try {
      const errorInfo = `錯誤訊息: ${error.message}\n錯誤時間: ${new Date().toLocaleString()}\n頁面URL: ${window.location.href}`
      window.open(`mailto:Sceut.tw@gmail.com?subject=網站錯誤回報&body=${encodeURIComponent(errorInfo)}`, "_blank")
    } catch (e) {
      alert("請發送郵件至：Sceut.tw@gmail.com 並描述您遇到的問題")
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#F5F2ED] rounded-full flex items-center justify-center">
            <div className="text-2xl text-[#C2B8A3]">⚠️</div>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-gray-800 mb-4">發生了一些問題</h1>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            很抱歉，頁面載入時發生錯誤。
            <br />
            請嘗試重新載入頁面，或聯絡我們的客服團隊。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={reset}
            className="bg-gray-800 hover:bg-black text-white rounded-none h-10 px-6 text-xs font-light tracking-widest uppercase flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重新載入
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-none h-10 px-6 text-xs font-light tracking-widest uppercase flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            回到首頁
          </Button>
        </div>

        <div className="pt-8 border-t border-[#E8E2D9]">
          <p className="text-xs text-gray-500 font-light mb-4">問題持續發生？</p>
          <Button
            onClick={handleEmailContact}
            variant="ghost"
            className="text-xs font-light text-[#8A7B6C] hover:text-[#6D5C4A] flex items-center mx-auto"
          >
            <Mail className="w-4 h-4 mr-2" />
            回報問題給客服
          </Button>
        </div>
      </div>
    </div>
  )
}
