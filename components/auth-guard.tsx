"use client"

import type React from "react"
import { useAuth } from "@/app/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = true, redirectTo = "/login" }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (requireAuth && !isAuthenticated) {
      console.log("用戶未認證，重定向到:", redirectTo)
      router.push(redirectTo)
      return
    }

    if (!requireAuth && isAuthenticated && redirectTo === "/login") {
      router.push("/")
    }
  }, [isAuthenticated, loading, requireAuth, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-[#8A7B6C]" />
          <p className="mt-2 text-sm text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// 同時提供默認導出
export default AuthGuard
