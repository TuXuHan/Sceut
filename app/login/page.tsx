"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { EmailVerificationDialog } from "@/components/email-verification-dialog"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")

  const redirectPath = searchParams.get("redirect") || "/member-center/dashboard"

  // 如果已經登入，重定向到目標頁面
  useEffect(() => {
    if (isAuthenticated) {
      console.log("用戶已登入，重定向到:", redirectPath)
      router.push(redirectPath)
    }
  }, [isAuthenticated, router, redirectPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return

    // 基本驗證
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError("請輸入電子郵件和密碼")
      return
    }

    // 郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError("請輸入有效的電子郵件地址")
      return
    }

    if (trimmedPassword.length < 6) {
      setError("密碼長度至少需要6位")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("嘗試登入:", trimmedEmail)
      const result = await login(trimmedEmail, trimmedPassword)

      if (result.success) {
        console.log("登入成功，準備重定向")
        // 不需要手動重定向，useEffect 會處理
      } else {
        console.error("登入失敗:", result.error)
        setError(result.error || "登入失敗")

        if (result.needsVerification) {
          setVerificationEmail(trimmedEmail)
          setShowVerificationDialog(true)
        }
      }
    } catch (error) {
      console.error("登入過程中發生錯誤:", error)
      setError("登入過程中發生錯誤，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  // 如果已經登入，顯示重定向訊息
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C2B8A3] mx-auto mb-4" />
          <p className="text-[#8A7B6C] font-light">已登入，正在跳轉...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-[#E8E2D9] shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-light text-gray-900">歡迎回來</CardTitle>
          <CardDescription className="text-[#8A7B6C]">登入您的帳戶以繼續</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                電子郵件
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C2B8A3] w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="請輸入您的電子郵件"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 border-[#E8E2D9] focus:border-[#C2B8A3] focus:ring-[#C2B8A3]"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                密碼
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C2B8A3] w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="請輸入您的密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 border-[#E8E2D9] focus:border-[#C2B8A3] focus:ring-[#C2B8A3]"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C2B8A3] hover:text-[#8A7B6C]"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-[#8A7B6C] hover:text-[#C2B8A3] font-light">
                忘記密碼？
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full bg-[#A69E8B] hover:bg-[#8A7B6C] text-white font-light py-2.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登入中...
                </>
              ) : (
                "登入"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#8A7B6C]">
              還沒有帳戶？{" "}
              <Link href="/register" className="text-[#A69E8B] hover:text-[#8A7B6C] font-medium">
                立即註冊
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <EmailVerificationDialog
        isOpen={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        email={verificationEmail}
      />
    </div>
  )
}
