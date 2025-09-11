"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/auth-provider"
import { createClient } from "@/lib/supabase/client"

// 在 module scope 只呼叫一次
const supabase = createClient()

interface SubscriptionData {
  user_id?: string
  name?: string
  email?: string
  perfume_name?: string
  perfume_brand?: string
  created_at?: string
}

interface UserProfile {
  quiz_answers?: {
    gender?: string
    scent?: string
  }
}

export default function MemberDashboardPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [nextDelivery, setNextDelivery] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const getUserDisplayName = () => {
    if (!user) return "用戶"
    return user.user_metadata?.name || user.email?.split("@")[0] || "用戶"
  }

  useEffect(() => {
    // 只在 user.id 真正改變時執行
    const loadUserData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)

        // 讀最新訂閱
        const { data: subs, error: subErr } = await supabase
          .from("subscribers")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)

        if (subErr) throw subErr

        if (subs?.length) {
          const latest = subs[0]
          setSubscription(latest)
          const dt = new Date(latest.created_at!)
          dt.setMonth(dt.getMonth() + 1)
          setNextDelivery(
            dt.toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          )
        } else {
          setSubscription(null)
          setNextDelivery("尚無訂閱")
        }

        // 讀偏好
        const { data: profile, error: profErr } = await supabase
          .from("user_profiles")
          .select("quiz_answers")
          .eq("id", user.id)
          .single()

        if (profErr && profErr.code !== "PGRST116") throw profErr
        if (profile) setUserProfile(profile)
      } catch (e) {
        console.error("讀取使用者資料時發生錯誤：", e)
        setSubscription(null)
        setNextDelivery("讀取錯誤")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user?.id])  // <- 只監聽 user.id

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-normal text-gray-800 mb-2 tracking-wide">
        您好，{getUserDisplayName()}
      </h1>
      <p className="text-sm text-gray-500">歡迎回到您的會員中心</p>

      {subscription ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-[#E8E2D9] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-light text-[#6D5C4A] tracking-wide">目前訂閱方案</CardTitle>
              <CardDescription className="font-light">您的 Sceut 香氣之旅</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">方案類型：</span>每月精選香水
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">本期香水：</span>
                {subscription.perfume_name
                  ? `${subscription.perfume_name} (${subscription.perfume_brand})`
                  : "根據您的偏好推薦"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">訂閱日期：</span>
                {subscription.created_at
                  ? new Date(subscription.created_at).toLocaleDateString("zh-TW")
                  : "N/A"}
              </p>
              <Button
                variant="outline"
                asChild
                className="rounded-none text-xs font-light border-gray-300 mt-4 bg-transparent"
              >
                <Link href="/member-center/subscription">管理訂閱方案</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-[#E8E2D9] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-light text-[#6D5C4A] tracking-wide">下次配送</CardTitle>
              <CardDescription className="font-light">您的下一份香氣驚喜</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-lg text-gray-800">
                <CalendarDays className="w-5 h-5 mr-3 text-[#C2B8A3]" />
                <span>{nextDelivery}</span>
              </div>
              <p className="text-sm text-gray-600 font-light">我們將在配送前以電子郵件通知您。</p>
              <Button
                variant="outline"
                asChild
                className="rounded-none text-xs font-light border-gray-300 mt-4 bg-transparent"
              >
                <Link href="/member-center/shipping">查看配送詳情</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-[#E8E2D9] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-light text-[#6D5C4A] tracking-wide">開始您的香氣之旅</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">您目前尚未訂閱任何方案。</p>
            <Button
              variant="default"
              asChild
              className="bg-[#A69E8B] hover:bg-[#8A7B6C] text-white rounded-none text-xs font-light tracking-widest uppercase"
            >
              <Link href="/quiz">探索並訂閱</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
