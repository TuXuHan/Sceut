"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
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
          router.push("/login?error=verification_failed")
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
                router.push("/member-center/dashboard")
                return
              }
              router.push("/login?error=verification_failed")
              return
            }

            console.log("[v0] Exchange successful, checking user data...")
            if (data.user) {
              console.log("[v0] User authenticated successfully:", data.user.email)
              console.log("[v0] About to call ensureUserProfile...")
              await ensureUserProfile(data.user)
              console.log("[v0] ensureUserProfile completed, redirecting to member center")
              router.push("/member-center/dashboard")
            } else {
              console.log("[v0] No user in exchange response, checking session...")
              const { data: session } = await supabase.auth.getSession()
              console.log("[v0] Session check result:", session)
              if (session?.session?.user) {
                console.log("[v0] Found user in session, treating as success")
                router.push("/member-center/dashboard")
              } else {
                console.log("[v0] No user found in session either")
                router.push("/login?error=verification_failed")
              }
            }
          } catch (exchangeErr) {
            console.error("[v0] Exception during exchangeCodeForSession:", exchangeErr)
            if (exchangeErr.message === "Exchange timeout") {
              console.log("[v0] Exchange timed out, checking current session...")
              const {
                data: { session },
                error,
              } = await supabase.auth.getSession()
              console.log("[v0] Session check after timeout - data:", session, "error:", error)

              if (session?.user) {
                console.log("[v0] Found active session after timeout, treating as success")
                console.log("[v0] User from session:", session.user.email)
                await ensureUserProfile(session.user)
                router.push("/member-center/dashboard")
                return
              } else {
                console.log("[v0] No active session found after timeout")
              }
            }
            router.push("/login?error=verification_failed")
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
              router.push("/member-center/dashboard")
              return
            }
            router.push("/login?error=verification_failed")
            return
          }

          if (data.user) {
            console.log("User verified successfully:", data.user.email)
            await ensureUserProfile(data.user)
            router.push("/member-center/dashboard")
          } else {
            router.push("/login?error=verification_failed")
          }
        } else {
          console.log("[v0] No verification parameters found")
          router.push("/login?error=missing_verification_code")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        router.push("/login?error=verification_error")
      } finally {
        setIsProcessing(false)
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

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-6">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#C2B8A3] animate-spin mx-auto mb-4" />
        <p className="text-[#8A7B6C] text-lg">正在處理驗證...</p>
      </div>
    </div>
  )
}
