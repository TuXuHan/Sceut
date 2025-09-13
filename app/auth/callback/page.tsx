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
          console.log("[v0] Processing auth code:", code)

          try {
            console.log("[v0] About to call exchangeCodeForSession...")

            const exchangePromise = supabase.auth.exchangeCodeForSession(code)
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Exchange timeout")), 10000),
            )

            const { data, error: exchangeError } = (await Promise.race([exchangePromise, timeoutPromise])) as any

            console.log("[v0] exchangeCodeForSession completed. Data:", data, "Error:", exchangeError)

            if (exchangeError) {
              console.error("[v0] Error exchanging code for session:", exchangeError)
              if (
                exchangeError.message?.includes("already_confirmed") ||
                exchangeError.message?.includes("email_confirmed")
              ) {
                console.log("[v0] Email already confirmed, treating as success")
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

            console.log("[v0] Exchange successful, checking user data...")
            if (data.user) {
              console.log("[v0] User authenticated successfully:", data.user.email)
              console.log("[v0] About to call ensureUserProfile...")
              await ensureUserProfile(data.user)
              console.log("[v0] ensureUserProfile completed, setting success status")
              setStatus("success")
              setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
              setTimeout(() => {
                router.push("/member-center/dashboard")
              }, 2000)
            } else {
              console.log("[v0] No user in exchange response, checking session...")
              const { data: session } = await supabase.auth.getSession()
              console.log("[v0] Session check result:", session)
              if (session?.session?.user) {
                console.log("[v0] Found user in session, treating as success")
                setStatus("success")
                setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
                setTimeout(() => {
                  router.push("/member-center/dashboard")
                }, 2000)
              } else {
                console.log("[v0] No user found in session either")
                setStatus("error")
                setMessage("驗證失敗，請重試")
              }
            }
          } catch (exchangeErr) {
            console.error("[v0] Exception during exchangeCodeForSession:", exchangeErr)
            if (exchangeErr.message === "Exchange timeout") {
              console.log("[v0] Exchange timed out, checking current session...")
              const { data: { session }, error } = await supabase.auth.getSession()
              console.log("[v0] Session check after timeout - data:", session, "error:", sessionError)

              if (session?.user) {
                console.log("[v0] Found active session after timeout, treating as success")
                console.log("[v0] User from session:", session.session.user.email)
                await ensureUserProfile(session.session.user)
                setStatus("success")
                setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
                setTimeout(() => {
                  router.push("/member-center/dashboard")
                }, 2000)
                return
              } else {
                console.log("[v0] No active session found after timeout")
              }
            }
            setStatus("error")
            setMessage("驗證過程中發生錯誤")
            return
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
  }, [])

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
