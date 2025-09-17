"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/app/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { useDebouncedLoading } from "@/hooks/use-debounced-loading"
import { createClient } from "@/lib/supabase/client"

interface QuizAnswers {
  gender?: string
  scent?: string
  mood?: string
  vibe?: string
  feel?: string
}

export default function PreferencesPage() {
  const supabase = createClient()
  const { user } = useAuth()
  const [quiz_answers, setQuizAnswers] = useState<QuizAnswers | null>(null)
  const { loading, startLoading, stopLoading, shouldSkipLoad, resetLoadingState } = useDebouncedLoading({
    debounceMs: 500,
    maxRetries: 1
  })

  useEffect(() => {
    if (user && supabase) {
      console.log("🔄 useEffect: 用戶和 supabase 都已準備好，開始載入偏好設定")
      resetLoadingState() // 重置加载状态
      loadUserPreferences()
    } else {
      console.log("⏳ useEffect: 等待用戶或 supabase 準備好", { user: !!user, supabase: !!supabase })
    }
  }, [user, supabase])

  // 页面可见性变化时重新加载数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && supabase) {
        console.log("📱 頁面重新可見，重新載入偏好設定")
        // 重置状态后重新加载
        resetLoadingState()
        loadUserPreferences(true) // 强制重新加载
      }
    }

    const handleFocus = () => {
      if (user && supabase) {
        console.log("🔄 頁面重新獲得焦點，重新載入偏好設定")
        // 重置状态后重新加载
        resetLoadingState()
        loadUserPreferences(true) // 强制重新加载
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [user, supabase])

  const loadUserPreferences = async (forceReload = false) => {
    if (!user || !supabase) return

    // 使用智能防抖机制
    if (shouldSkipLoad(forceReload)) {
      stopLoading() // 重置加载状态
      return
    }

    try {
      startLoading()

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("quiz_answers")
        .eq("id", user.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (profile && (profile as any).quiz_answers) {
        setQuizAnswers((profile as any).quiz_answers)
      } else {
        setQuizAnswers(null)
      }
    } catch (error) {
      console.error("載入偏好設定失敗:", error)
      setQuizAnswers(null)
    } finally {
      stopLoading()
    }
  }

  const getPreferenceText = (preference?: string, type?: string): string => {
    if (!preference) return "未設定"
    const preferences: Record<string, Record<string, string>> = {
      gender: { feminine: "女性香水", masculine: "男性香水" },
      scent: { warm: "溫暖香調", fresh: "清新香調", woody: "木質香調" },
      mood: { sophisticated: "精緻複雜", playful: "輕鬆活潑", classic: "經典優雅", modern: "現代前衛" },
      vibe: { bold: "大膽鮮明", soft: "柔和細膩", intense: "強烈深沉", subtle: "含蓄低調" },
      feel: {
        outgoing: "外向冒險",
        sensual: "感性優雅",
        playful: "俏皮活潑",
        sexy: "性感神秘",
        relaxed: "放鬆隨性",
        confident: "自信果敢",
        sophisticated: "精緻優雅",
        adventurous: "冒險不羈",
        mysterious: "神秘魅力",
      },
    }
    if (type && preferences[type]) return preferences[type][preference] || preference
    return preference
  }

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#A69E8B]" />
            <p className="text-gray-600">載入偏好設定中...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extralight text-gray-800 mb-2 tracking-wide">香氣偏好設定</h1>
          <p className="text-gray-600 font-light">管理您的香氣偏好和測驗結果</p>
        </div>

        <Card className="border-[#E8E2D9] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-light text-[#6D5C4A] tracking-wide">調整您的香氣檔案</CardTitle>
            <CardDescription className="font-light">更新您的偏好，讓我們為您推薦更精準的香水。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz_answers ? (
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-800 mb-3">您目前的偏好設定：</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <p>
                    <span className="font-light text-gray-600">性別取向：</span>
                    <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.gender, "gender")}</span>
                  </p>
                  <p>
                    <span className="font-light text-gray-600">香調類型：</span>
                    <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.scent, "scent")}</span>
                  </p>
                  <p>
                    <span className="font-light text-gray-600">期望氛圍：</span>
                    <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.mood, "mood")}</span>
                  </p>
                  <p>
                    <span className="font-light text-gray-600">展現氣質：</span>
                    <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.vibe, "vibe")}</span>
                  </p>
                  <p className="md:col-span-2">
                    <span className="font-light text-gray-600">香氣感受：</span>
                    <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.feel, "feel")}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 font-light">您尚未完成香氣測驗。完成測驗以建立您的香氣檔案。</p>
            )}
            <div className="pt-4 border-t border-[#E8E2D9]">
              <Button
                asChild
                className="bg-[#A69E8B] hover:bg-[#8A7B6C] text-white rounded-none text-xs font-light tracking-widest uppercase"
              >
                <Link href="/quiz">
                  <Edit className="w-3 h-3 mr-2" />
                  {quiz_answers ? "重新進行香氣測驗" : "開始香氣測驗"}
                </Link>
              </Button>
              <p className="text-xs text-gray-500 mt-3 font-light">提示：重新測驗將會更新您未來的香水推薦。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
