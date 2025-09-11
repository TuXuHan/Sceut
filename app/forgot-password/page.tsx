"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // 自動滾動到頂部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email.trim()) {
      setError("請輸入電子郵件")
      setLoading(false)
      return
    }

    // 簡單的郵箱格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("請輸入有效的電子郵件格式")
      setLoading(false)
      return
    }

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
        : `${typeof window !== "undefined" ? window.location.origin : "https://localhost:3000"}/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setError("發送重設郵件時發生錯誤，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-lg border border-[#E8E2D9] text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
          <h2 className="mt-6 text-2xl font-extralight text-gray-800">郵件已發送</h2>
          <p className="text-sm text-gray-600">
            我們已向 <strong>{email}</strong> 發送了密碼重設連結。
            <br />
            請檢查您的郵箱並點擊連結來重設密碼。
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => router.push("/login")}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-none text-white bg-gray-800 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C2B8A3]"
            >
              返回登入
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-lg border border-[#E8E2D9]">
        <div>
          <button
            onClick={() => router.push("/login")}
            className="flex items-center text-sm text-[#8A7B6C] hover:text-[#6D5C4A] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回登入
          </button>
          <h2 className="mt-6 text-center text-3xl font-extralight text-gray-800 tracking-wide">重設密碼</h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-light">
            輸入您的電子郵件地址，我們將發送重設密碼的連結給您。
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">{error}</div>
          )}
          <div>
            <Label htmlFor="email" className="text-sm font-light text-gray-700">
              電子郵件
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-800 rounded-none focus:outline-none focus:ring-[#C2B8A3] focus:border-[#C2B8A3] focus:z-10 sm:text-sm font-light"
              placeholder="您的電子郵件地址"
              disabled={loading}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-none text-white bg-gray-800 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C2B8A3] h-10 tracking-widest uppercase font-light disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                  發送中...
                </>
              ) : (
                "發送重設連結"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
