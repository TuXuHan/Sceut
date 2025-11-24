"use client"

import type { ReactNode } from "react"
import { Package, Heart, CreditCard, User, Menu, X, Home, Truck, History } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { useAuth } from "@/app/auth-provider"

export default function MemberCenterLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("[v0] Member center access denied - redirecting to login")
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (!user) {
      setHasActiveSubscription(false)
      return
    }

    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch("/api/member-center/has-active-subscription")

        if (!response.ok) {
          setHasActiveSubscription(false)
          return
        }

        const data = await response.json()
        setHasActiveSubscription(Boolean(data?.hasActiveSubscription))
      } catch (error) {
        console.error("Failed to check subscription status:", error)
        setHasActiveSubscription(false)
      }
    }

    checkSubscriptionStatus()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6D5C4A] mx-auto mb-4"></div>
          <p className="text-[#8A7B6C]">載入中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const baseNavigationItems = [
    {
      href: "/member-center/profile",
      icon: User,
      label: "個人資料",
    },
    {
      href: "/member-center/subscription",
      icon: Package,
      label: "訂閱管理",
    },
    {
      href: "/member-center/preferences",
      icon: Heart,
      label: "偏好設定",
    },
    {
      href: "/member-center/shipping",
      icon: Truck,
      label: "配送資訊",
    },
    {
      href: "/subscribe",
      icon: CreditCard,
      label: "付款方式",
    },
  ]

  const navigationItems = hasActiveSubscription
    ? [
        ...baseNavigationItems,
        {
          href: "/my-orders",
          icon: History,
          label: "歷史訂單",
        },
      ]
    : baseNavigationItems

  const NavigationLink = ({ item, onClick }: { item: (typeof navigationItems)[0]; onClick?: () => void }) => {
    const Icon = item.icon
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center px-4 py-3 text-sm font-light rounded-none transition-colors ${
          pathname === item.href
            ? "bg-[#FAF8F4] text-[#6D5C4A] border-r-2 border-[#A69E8B]"
            : "text-[#8A7B6C] hover:bg-[#FAF8F4] hover:text-[#6D5C4A]"
        }`}
      >
        <Icon className="w-4 h-4 mr-3" />
        {item.label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {!isMobile && (
          <div className="w-64 min-h-screen border-r border-[#E4E0DA] bg-white">
            <div className="p-6">
              <div className="font-bold text-lg mb-6 text-gray-800">會員中心</div>
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <NavigationLink key={item.href} item={item} />
                ))}
              </nav>
            </div>
          </div>
        )}

        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E4E0DA] px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-[#FAF8F4] rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-800" /> : <Menu className="w-5 h-5 text-gray-800" />}
            </button>
            <div className="font-bold text-lg text-gray-800">會員中心</div>
            <Link href="/" className="p-2 hover:bg-[#FAF8F4] rounded-lg transition-colors" title="回到主頁">
              <Home className="w-5 h-5 text-gray-800" />
            </Link>
          </div>
        )}

        {isMobile && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
            {/* Drawer */}
            <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 border-r border-[#E4E0DA] transform transition-transform duration-300">
              <div className="p-6 pt-16">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-sm font-light rounded-none transition-colors text-[#8A7B6C] hover:bg-[#FAF8F4] hover:text-[#6D5C4A] mb-4 border-b border-[#E4E0DA]"
                >
                  <Home className="w-4 h-4 mr-3" />
                  回到主頁
                </Link>
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <NavigationLink key={item.href} item={item} onClick={() => setIsMobileMenuOpen(false)} />
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}

        <div className={`flex-1 min-h-screen overflow-auto ${isMobile ? "pt-16" : ""}`}>
          <div className={`p-4 md:p-6 max-w-6xl mx-auto`}>{children}</div>
        </div>
      </div>
    </div>
  )
}
