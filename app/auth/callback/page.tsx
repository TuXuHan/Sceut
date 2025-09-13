"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get("code")
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")
        const error = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        console.log("[v0] Auth callback params:", { code, token_hash, type, error })

        if (error) {
          console.error("Auth callback error:", error, errorDescription)
          setStatus("error")
          setMessage(errorDescription || "驗證過程中發生錯誤")
          return
        }

        if (code) {
          console.log("Processing auth code:", code)

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error("Error exchanging code for session:", exchangeError)
            if (
              exchangeError.message?.includes("already_confirmed") ||
              exchangeError.message?.includes("email_confirmed")
            ) {
              setStatus("success")
              setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
              setTimeout(() => {
                router.push("/member-center/dashboard")
              }, 2000)
              return
            }
            setStatus("error")
            setMessage("驗證失敗，請重試")
            return
          }

          if (data.user) {
            console.log("User authenticated successfully:", data.user.email)
            await ensureUserProfile(data.user)
            setStatus("success")
            setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
            setTimeout(() => {
              router.push("/member-center/dashboard")
            }, 2000)
          } else {
            const { data: session } = await supabase.auth.getSession()
            if (session?.session?.user) {
              setStatus("success")
              setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
              setTimeout(() => {
                router.push("/member-center/dashboard")
              }, 2000)
            } else {
              setStatus("error")
              setMessage("驗證失敗，請重試")
            }
          }
        } else if (token_hash && type) {
          console.log("Processing token hash verification:", { token_hash, type })

          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })

          if (verifyError) {
            console.error("Error verifying OTP:", verifyError)
            if (
              verifyError.message?.includes("already_confirmed") ||
              verifyError.message?.includes("email_confirmed")
            ) {
              setStatus("success")
              setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
              setTimeout(() => {
                router.push("/member-center/dashboard")
              }, 2000)
              return
            }
            setStatus("error")
            setMessage("驗證失敗，請重試")
            return
          }

          if (data.user) {
            console.log("User verified successfully:", data.user.email)
            await ensureUserProfile(data.user)
            setStatus("success")
            setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
            setTimeout(() => {
              router.push("/member-center/dashboard")
            }, 2000)
          } else {
            setStatus("error")
            setMessage("驗證失敗，請重試")
          }
        } else {
          console.log("[v0] No verification parameters found")
          setStatus("error")
          setMessage("缺少驗證代碼")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage("驗證過程中發生錯誤")
      }
    }

    handleAuthCallback()
  }, [searchParams])

  const ensureUserProfile = async (user: any) => {
    try {
      console.log("[v0] Starting ensureUserProfile for user:", user.id, user.email)

      const { data: profile, error: selectErr } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

      if (selectErr) {
        console.error("[v0] Error checking user profile:", selectErr)
        return
      }

      if (profile) {
        console.log("[v0] User profile already exists")
        return
      }

      console.log("[v0] Creating user profile for:", user.email)

      const userName = user.user_metadata?.name || user.email?.split("@")[0] || ""

      const { error: insertErr } = await supabase.from("user_profiles").insert({
        id: user.id,
        email: user.email,
        name: userName,
        quiz_answers: null,
      })

      if (insertErr) {
        console.error("[v0] Error creating user profile:", insertErr)
      } else {
        console.log("[v0] User profile created successfully")
      }

      console.log("[v0] ensureUserProfile completed")
    } catch (err) {
      console.error("[v0] Unexpected error in ensureUserProfile:", err)
    }
  }

  const handleManualRedirect = () => {
    if (status === "success") {
      router.push("/member-center/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-[#E8E2D9] shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="w-12 h-12 text-[#C2B8A3] animate-spin" />}
            {status === "success" && <CheckCircle className="w-12 h-12 text-green-600" />}
            {status === "error" && <AlertCircle className="w-12 h-12 text-red-600" />}
          </div>
          <CardTitle className="text-xl font-light text-gray-900">
            {status === "loading" && "驗證中..."}
            {status === "success" && "驗證成功"}
            {status === "error" && "驗證失敗"}
          </CardTitle>
          <CardDescription className="text-[#8A7B6C]">
            {status === "success" ? `${message} 即將自動跳轉...` : message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status !== "loading" && (
            <Button onClick={handleManualRedirect} className="bg-[#A69E8B] hover:bg-[#8A7B6C] text-white w-full">
              {status === "success" ? "立即前往會員中心" : "返回登入"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
