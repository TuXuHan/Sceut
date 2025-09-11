"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

const supabase = createClient()

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading")

  useEffect(() => {
    // Supabase 會自動消化 URL 裡的 token，你只要拿個參考到 URL 就好了
    supabase.auth.getSessionFromUrl({ storeSession: false })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"))
  }, [])

  if (status === "loading") {
    return <div className="p-8 text-center">驗證中…</div>
  }
  if (status === "error") {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-red-600">驗證失敗，請重新申請驗證信。</p>
        <Link href="/login" className="underline">回到登入頁</Link>
      </div>
    )
  }
  return (
    <div className="p-8 text-center">
      <p className="mb-4 text-green-600">郵箱驗證成功！</p>
      <Link href="/login" className="underline">請前往登入</Link>
    </div>
  )
}
