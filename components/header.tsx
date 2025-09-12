"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/auth-provider"
import { User, LogOut, LogIn, Edit3, Menu } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()

  // 獲取用戶顯示名稱的函數
  const getUserDisplayName = () => {
    if (!user) return ""

    // 優先使用 user_metadata 中的 name
    if (user.user_metadata?.name) {
      return user.user_metadata.name
    }

    // 如果沒有名稱，使用郵箱的用戶名部分
    if (user.email) {
      return user.email.split("@")[0]
    }

    return "用戶"
  }

  // 強制登出函數 - 確保一次點擊就完全登出並跳轉到登入頁面
  const handleForceLogout = async () => {
    if (isLoggingOut) return // 防止重複點擊

    setIsLoggingOut(true)
    console.log("=== 開始強制登出流程 ===")

    try {
      // 1. 立即清除所有本地存儲數據
      console.log("清除本地存儲...")
      try {
        // 清除所有可能的 localStorage keys
        const keysToRemove = [
          "quizAnswers",
          "selectedPerfume",
          "subscriptionData",
          "recommendations",
          "userQuizData",
          "perfumeRecommendations",
          "sb-supabase-auth-token",
        ]

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        })

        // 清除所有以特定前綴開頭的 keys
        const prefixes = ["user_", "sb-", "supabase"]
        Object.keys(localStorage).forEach((key) => {
          if (prefixes.some((prefix) => key.startsWith(prefix))) {
            localStorage.removeItem(key)
          }
        })

        Object.keys(sessionStorage).forEach((key) => {
          if (prefixes.some((prefix) => key.startsWith(prefix))) {
            sessionStorage.removeItem(key)
          }
        })

        console.log("本地存儲已清除")
      } catch (e) {
        console.warn("清除本地存儲時發生錯誤:", e)
      }

      // 2. 調用 auth provider 的登出函數
      console.log("執行認證登出...")
      try {
        await logout()
        console.log("認證登出完成")
      } catch (e) {
        console.warn("認證登出時發生錯誤:", e)
      }

      // 3. 等待一小段時間確保狀態更新
      await new Promise((resolve) => setTimeout(resolve, 300))

      // 4. 強制跳轉到登入頁面
      console.log("跳轉到登入頁面...")
      router.push("/login")

      // 5. 如果路由跳轉失敗，使用 window.location
      setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
      }, 500)
    } catch (error) {
      console.error("登出過程中發生錯誤:", error)
      // 即使發生錯誤也要強制跳轉到登入頁面
      router.push("/login")
      setTimeout(() => {
        window.location.href = "/login"
      }, 500)
    } finally {
      // 重置登出狀態
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="py-4 md:py-6 px-4 md:px-6 lg:px-10 flex items-center justify-between border-b border-[#EFEFEF] bg-white sticky top-0 z-50">
      <Link href="/" className="text-xl md:text-2xl font-light tracking-widest text-gray-800 uppercase">
        Sceut
      </Link>

      {!isMobile && (
        <nav className="flex items-center gap-4 md:gap-6">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden md:inline">歡迎，{getUserDisplayName()}</span>
              <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:text-gray-900">
                <Link href="/member-center/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  會員中心
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForceLogout}
                disabled={isLoggingOut}
                className="text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "登出中..." : "登出"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-gray-700 hover:text-gray-900 text-sm font-light">
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-1 md:mr-2" />
                  登入
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gray-800 hover:bg-black text-white rounded-none h-9 px-4 md:px-6 text-xs font-light tracking-widest uppercase"
              >
                <Link href="/register">
                  <Edit3 className="w-3 h-3 mr-1 md:mr-2" />
                  立即註冊
                </Link>
              </Button>
            </>
          )}
        </nav>
      )}

      {isMobile && (
        <>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-[#FAF8F4] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-800" />
          </button>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
              {/* Menu */}
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-[#EFEFEF] shadow-lg z-50 rounded-lg overflow-hidden">
                <div className="p-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="text-sm text-gray-600 pb-2 border-b border-[#EFEFEF]">
                        歡迎，{getUserDisplayName()}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full justify-start text-gray-700 hover:text-gray-900"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/member-center/dashboard">
                          <User className="w-4 h-4 mr-2" />
                          會員中心
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          handleForceLogout()
                        }}
                        disabled={isLoggingOut}
                        className="w-full justify-start text-gray-700 hover:text-gray-900"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {isLoggingOut ? "登出中..." : "登出"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-start text-gray-700 hover:text-gray-900 text-sm font-light"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/login">
                          <LogIn className="w-4 h-4 mr-2" />
                          登入
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full justify-start bg-gray-800 hover:bg-black text-white rounded-none h-9 text-xs font-light tracking-widest uppercase"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/register">
                          <Edit3 className="w-3 h-3 mr-2" />
                          立即註冊
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </header>
  )
}
