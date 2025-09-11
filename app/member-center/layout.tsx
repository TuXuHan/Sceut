"use client"

import type { ReactNode } from "react"
import { LayoutDashboard, Package, Heart, MapPin, CreditCard, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MemberCenterLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen border-r border-[#E4E0DA] bg-white">
          <div className="p-6">
            <div className="font-bold text-lg mb-6 text-gray-800">會員中心</div>
            <nav className="space-y-1">
              <Link
                href="/member-center/dashboard"
                className={`flex items-center px-4 py-3 text-sm font-light rounded-none transition-colors ${
                  pathname === "/member-center/dashboard"
                    ? "bg-[#FAF8F4] text-[#6D5C4A] border-r-2 border-[#A69E8B]"
                    : "text-[#8A7B6C] hover:bg-[#FAF8F4] hover:text-[#6D5C4A]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                總覽
              </Link>

              <Link
                href="/member-center/profile"
                className={`flex items-center px-4 py-3 text-sm font-light rounded-none transition-colors ${
                  pathname === "/member-center/profile"
                    ? "bg-[#FAF8F4] text-[#6D5C4A] border-r-2 border-[#A69E8B]"
                    : "text-[#8A7B6C] hover:bg-[#FAF8F4] hover:text-[#6D5C4A]"
                }`}
              >
                <User className="w-4 h-4 mr-3" />
                個人資料
              </Link>

              <Link
                href="/member-center/subscription"
                className={`flex items-center px-4 py-3 text-sm font-light rounded-none transition-colors ${
                  pathname === "/member-center/subscription"
                    ? "bg-[#FAF8F4] text-[#6D5C4A] border-r-2 border-[#A69E8B]"
                    : "text-[#8A7B6C] hover:bg-[#FAF8F4] hover:text-[#6D5C4A]"
                }`}
              >
                <Package className="w-4 h-4 mr-3" />
                訂閱管理
              </Link>

              <Link
                href="/member-center/preferences"
                className={`flex items-center px-4 py-3 text-sm font-light rounded-none transition-colors ${
                  pathname === "/member-center/preferences"
                    ? "bg-[#FAF8F4] text-[#6D5C4A] border-r-2 border-[#A69E8B]"
                    : "text-[#8A7B6C] hover:bg-[#FAF8F4] hover:text-[#6D5C4A]"
                }`}
              >
                <Heart className="w-4 h-4 mr-3" />
                偏好設定
              </Link>

              <Link
                href="/member-center/shipping"
                className={`flex items-center px-4 py-3 text-sm font-light rounded-none transition-colors ${
                  pathname === "/member-center/shipping"
                    ? "bg-[#FAF8F4] text-[#6D5C4A] border-r-2 border-[#A69E8B]"
                    : "text-[#8A7B6C] hover:bg-[#FAF8F4] hover:text-[#6D5C4A]"
                }`}
              >
                <MapPin className="w-4 h-4 mr-3" />
                配送資訊
              </Link>

              <Link
                href="/member-center/payment"
                className={`flex items-center px-4 py-3 text-sm font-light rounded-none transition-colors ${
                  pathname === "/member-center/payment"
                    ? "bg-[#FAF8F4] text-[#6D5C4A] border-r-2 border-[#A69E8B]"
                    : "text-[#8A7B6C] hover:bg-[#FAF8F4] hover:text-[#6D5C4A]"
                }`}
              >
                <CreditCard className="w-4 h-4 mr-3" />
                付款方式
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen overflow-auto">
          <div className="p-6 max-w-6xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
