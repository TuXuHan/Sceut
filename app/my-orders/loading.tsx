import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#A69E8B]" />
        <p className="text-gray-600">載入訂單資料中...</p>
      </div>
    </div>
  )
}
