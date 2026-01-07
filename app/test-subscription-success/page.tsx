"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Truck, Star } from "lucide-react"

const mockPaymentData = {
  transaction_id: "PER20251123001",
  period_amt: 599,
  auth_time: "2025-11-27 10:30:00",
  merchant_order_no: "perfumetest0001",
}

const mockPerfume = {
  name: "Noir Lumière",
  brand: "Maison Sceut",
  match_percentage: 92,
  image: "/placeholder.svg?height=120&width=120&text=Perfume",
  description: "琥珀與白麝香交織的煙燻甜感，是秋冬夜晚的低語。",
}

export default function TestSubscriptionSuccessPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-light text-[#4A3B2F] tracking-wide">訂閱成功畫面測試</h1>
        <p className="text-[#6D5C4A] leading-relaxed">
          點擊下方「開始測試」即可立即查看訂閱成功畫面。畫面使用預設的成功交易資料，方便 Demo 或 QA
          驗證。關閉彈窗即可回到此頁面，重複測試不會對真實資料造成影響。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" className="bg-[#6D5C4A] hover:bg-[#5A4A3A]" onClick={() => setOpen(true)}>
            開始測試
          </Button>
          <Button variant="outline" onClick={() => setOpen(true)}>
            直接預覽
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          * 此頁僅為前端展示測試，不會呼叫 NewebPay 或建立實際訂閱紀錄。
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 border-none bg-transparent shadow-none sm:max-w-4xl max-h-[92vh]">
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <DialogClose
              className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-gray-500 shadow hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              aria-label="關閉成功畫面"
            >
              ✕
            </DialogClose>

            <div className="p-6 sm:p-10 text-center space-y-4">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              <h2 className="text-3xl font-semibold text-gray-900">訂閱成功！</h2>
              <p className="text-gray-600">
                恭喜您成功訂閱 Sceut 香水服務，您的第一瓶將在 3-5 個工作天內送達。
              </p>
            </div>

            <div className="px-4 sm:px-8 pb-6 space-y-6 overflow-y-auto flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>付款資訊</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">交易編號：</span>
                    {mockPaymentData.transaction_id}
                  </div>
                  <div>
                    <span className="font-medium">付款金額：</span>
                    NT$ {mockPaymentData.period_amt.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">授權時間：</span>
                    {mockPaymentData.auth_time}
                  </div>
                  <div>
                    <span className="font-medium">訂單編號：</span>
                    {mockPaymentData.merchant_order_no}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>您的香水</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={mockPerfume.image}
                    alt={mockPerfume.name}
                    className="w-28 h-28 object-cover rounded-lg shadow"
                  />
                  <div className="text-left">
                    <h3 className="text-xl font-medium text-gray-900">{mockPerfume.name}</h3>
                    <p className="text-gray-600">{mockPerfume.brand}</p>
                    <Badge className="mt-2 bg-amber-100 text-amber-800">
                      {mockPerfume.match_percentage}% 匹配
                    </Badge>
                    <p className="text-sm text-gray-500 mt-3">{mockPerfume.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>接下來會發生什麼？</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-600">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800">香水準備</h4>
                      <p className="text-sm">我們會為您精心包裝第一瓶專屬香水。</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800">物流配送</h4>
                      <p className="text-sm">3-5 個工作天送達，完成後會寄送追蹤通知。</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-800">體驗回饋</h4>
                      <p className="text-sm">使用後可在會員中心留下評價，幫助我們優化推薦。</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setOpen(false)}>
                  返回測試頁
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/member-center/subscription")}>
                  前往訂閱管理
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
