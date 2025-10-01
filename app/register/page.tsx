"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { EmailVerificationDialog } from "@/components/email-verification-dialog"
import { GuestStorage } from "@/lib/guest-storage"

const supabase = createClient()

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [hasGuestAnswers, setHasGuestAnswers] = useState(false)

  // 滾到頂
  useEffect(() => {
    window.scrollTo(0, 0)
    
    // 檢查是否有guest答案
    const guestAnswers = GuestStorage.hasGuestQuizAnswers()
    setHasGuestAnswers(guestAnswers)
    if (guestAnswers) {
      console.log("✅ 檢測到guest測驗答案，註冊後將引導用戶完成測驗")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // 基本前端驗證
    if (!name.trim()) {
      setError("請輸入姓名")
      setLoading(false)
      return
    }
    if (!email.trim()) {
      setError("請輸入電子郵件")
      setLoading(false)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("請輸入正確電子郵件格式")
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError("密碼長度至少 6 位")
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError("兩次密碼不相符")
      setLoading(false)
      return
    }

    try {
      // 使用正式上線的重定向 URL
      const redirectUrl = "https://sceut.vercel.app/auth/callback"
      
      console.log("使用重定向 URL:", redirectUrl)

      // 使用 Supabase Auth 註冊，將姓名存到 user_metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(), // 確保姓名被正確存儲到 user_metadata
          },
          emailRedirectTo: redirectUrl,
        },
      })

      if (signUpError) {
        console.error("Registration error:", signUpError)
        setError(signUpError.message)
      } else if (data.user) {
        // 註冊成功、驗證信已寄出
        setSuccess("註冊成功！請檢查您的郵箱以完成驗證。")
        setShowVerificationDialog(true)
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("註冊過程發生錯誤，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationComplete = () => {
    setShowVerificationDialog(false)
    
    // 檢查是否有guest答案，決定跳轉目標
    const redirectUrl = hasGuestAnswers 
      ? "/login?message=郵箱驗證成功，請登入以繼續完成測驗&continue=quiz"
      : "/login?message=郵箱驗證成功，請登入您的帳戶"
    
    setSuccess("郵箱驗證成功！2 秒後跳轉到登入頁。")
    setTimeout(() => {
      router.push(redirectUrl)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-lg border border-[#E8E2D9]">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extralight text-gray-800 tracking-wide">建立您的 Sceut 帳戶</h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-light">
            已有帳戶？{" "}
            <Link href="/login" className="font-medium text-[#8A7B6C] hover:text-[#6D5C4A]">
              立即登入
            </Link>
          </p>
          
          {/* 如果有guest答案，顯示提示 */}
          {hasGuestAnswers && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 text-center">
                ✨ 您的測驗進度已保存！註冊後將繼續完成剩餘問題
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-light text-gray-700">
                姓名
              </Label>
              <Input
                id="name"
                type="text"
                required
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="您的姓名"
                className="mt-1 block w-full px-3 py-2 border rounded-none font-light focus:ring-[#C2B8A3]"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-light text-gray-700">
                電子郵件
              </Label>
              <Input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="您的電子郵件地址"
                className="mt-1 block w-full px-3 py-2 border rounded-none font-light focus:ring-[#C2B8A3]"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-light text-gray-700">
                密碼
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位"
                  className="block w-full px-3 py-2 border rounded-none font-light focus:ring-[#C2B8A3]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-light text-gray-700">
                確認密碼
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再輸入一次密碼"
                  className="block w-full px-3 py-2 border rounded-none font-light focus:ring-[#C2B8A3]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-800 text-white hover:bg-black font-light tracking-widest rounded-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                註冊中...
              </>
            ) : (
              "註冊帳戶"
            )}
          </Button>
        </form>

        {/* 驗證信對話框（如果用戶點「重新寄驗證信」） */}
        <EmailVerificationDialog
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          email={email}
          onVerificationComplete={handleVerificationComplete}
        />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-800 mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
