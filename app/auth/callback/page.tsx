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
          } else {
            const { data: session } = await supabase.auth.getSession()
            if (session?.session?.user) {
              setStatus("success")
              setMessage("郵箱驗證成功！您現在可以正常使用所有功能。")
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
  }, [searchParams, supabase.auth, router])

  const ensureUserProfile = async (user: any) => {
    try {
      const { data: profile, error: selectErr } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

      if (selectErr) {
        console.error("Error checking user profile:", selectErr)
        return
      }

      if (profile) {
        console.log("User profile already exists")
        return
      }

      console.log("Creating user profile for:", user.email)

      const userName = user.user_metadata?.name || user.email?.split("@")[0] || ""

      const { error: insertErr } = await supabase.from("user_profiles").insert({
        id: user.id,
        email: user.email,
        name: userName,
        quiz_answers: null,
      })

      if (insertErr) {
        console.error("Error creating user profile:", insertErr)
      } else {
        console.log("User profile created successfully")
      }
    } catch (err) {
      console.error("Unexpected error in ensureUserProfile:", err)
    }
  }

  const checkUserQuizStatusAndRedirect = async (userId: string) => {
    try {
      console.log("Checking quiz status for user:", userId)

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("quiz_answers")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        console.error("Error checking quiz status:", error)
        console.log("Database query failed, redirecting to home")
        router.push("/")
        return
      }

      console.log("User profile quiz_answers:", profile?.quiz_answers)

      const hasQuizAnswers =
        profile?.quiz_answers &&
        typeof profile.quiz_answers === "object" &&
        Object.keys(profile.quiz_answers).length > 0

      if (hasQuizAnswers) {
        console.log("User has completed quiz, redirecting to home")
        router.push("/")
      } else {
        console.log("User has not completed quiz, redirecting to home")
        router.push("/")
      }
    } catch (error) {
      console.error("Error in checkUserQuizStatusAndRedirect:", error)
      console.log("Unexpected error, redirecting to home")
      router.push("/")
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
          <CardDescription className="text-[#8A7B6C]">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status !== "loading" && (
            <Button onClick={handleManualRedirect} className="bg-[#A69E8B] hover:bg-[#8A7B6C] text-white w-full">
              {status === "success" ? "前往會員中心" : "返回登入"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
