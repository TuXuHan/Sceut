"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

const supabase = createClient()

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const handleAuthStateChange = async () => {
      try {
        // Check if there's a token_hash in the URL (email verification)
        const tokenHash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (tokenHash && type === "email") {
          // Verify the token
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          })

          if (error) {
            console.error("[v0] Email verification error:", error)
            setStatus("error")
          } else {
            setStatus("success")
          }
        } else {
          // Check current session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()
          if (error) {
            console.error("[v0] Session check error:", error)
            setStatus("error")
          } else if (session?.user?.email_confirmed_at) {
            setStatus("success")
          } else {
            setStatus("error")
          }
        }
      } catch (error) {
        console.error("[v0] Verification process error:", error)
        setStatus("error")
      }
    }

    handleAuthStateChange()
  }, [searchParams])

  if (status === "loading") {
    return <div className="p-8 text-center">驗證中…</div>
  }
  if (status === "error") {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-red-600">驗證失敗，請重新申請驗證信。</p>
        <Link href="/login" className="underline">
          回到登入頁
        </Link>
      </div>
    )
  }
  return (
    <div className="p-8 text-center">
      <p className="mb-4 text-green-600">郵箱驗證成功！</p>
      <Link href="/login" className="underline">
        請前往登入
      </Link>
    </div>
  )
}
