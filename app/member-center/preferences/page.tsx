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
  complexity?: string
  intensity?: string
  character?: string
  occasion?: string
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
      resetLoadingState()
      loadUserPreferences()
    }
  }, [user, supabase])

  // 页面可见性变化时重新加载数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && supabase) {
        resetLoadingState()
        loadUserPreferences(true)
      }
    }

    const handleFocus = () => {
      if (user && supabase) {
        resetLoadingState()
        loadUserPreferences(true)
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
    if (!user) return

    // 使用智能防抖机制
    if (shouldSkipLoad(forceReload)) {
      stopLoading()
      return
    }

    try {
      console.log("📊 載入偏好設定...")
      startLoading()

      // 使用 fetch API 查詢偏好設定
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("環境變數未設定")
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=quiz_answers&id=eq.${user.id}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("✅ 偏好設定載入成功:", data)
        
        if (data && data.length > 0 && data[0].quiz_answers) {
          setQuizAnswers(data[0].quiz_answers)
        } else {
          setQuizAnswers(null)
        }
      } else {
        console.log("⚠️ 偏好設定查詢失敗:", response.status)
        setQuizAnswers(null)
      }

    } catch (error) {
      console.error("❌ 載入偏好設定失敗:", error)
      setQuizAnswers(null)
    } finally {
      stopLoading()
    }
  }

  const getPreferenceText = (preference?: string, type?: string): string => {
    if (!preference) return "未設定"
    const preferences: Record<string, Record<string, string>> = {
      gender: { 
        feminine: "女性香水", 
        masculine: "男性香水", 
        neutral: "中性香水" 
      },
      scent: { 
        fresh: "清新調", 
        floral: "花香調", 
        oriental: "東方調", 
        woody: "木質調" 
      },
      mood: { 
        energetic: "活力振奮", 
        calm: "平靜舒緩" 
      },
      complexity: { 
        simple: "簡約純淨", 
        balanced: "融合調和", 
        complex: "複雜層次" 
      },
      intensity: { 
        subtle: "輕盈微妙", 
        moderate: "適中", 
        bold: "濃烈鮮明" 
      },
      character: { 
        classic: "經典傳統", 
        contemporary: "當代時尚", 
        modern: "現代創新" 
      },
      occasion: { 
        casual: "日常休閒", 
        formal: "正式特殊" 
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
                    <span className="font-light text-gray-600">性別光譜：</span>
                    <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.gender, "gender")}</span>
                  </p>
                  <p>
                    <span className="font-light text-gray-600">香調家族：</span>
                    <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.scent, "scent")}</span>
                  </p>
                  {quiz_answers.complexity && (
                    <p>
                      <span className="font-light text-gray-600">香氣複雜度：</span>
                      <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.complexity, "complexity")}</span>
                    </p>
                  )}
                  {quiz_answers.intensity && (
                    <p>
                      <span className="font-light text-gray-600">香氣強度：</span>
                      <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.intensity, "intensity")}</span>
                    </p>
                  )}
                  {quiz_answers.character && (
                    <p>
                      <span className="font-light text-gray-600">風格特質：</span>
                      <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.character, "character")}</span>
                    </p>
                  )}
                  {quiz_answers.mood && (
                    <p>
                      <span className="font-light text-gray-600">情緒氛圍：</span>
                      <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.mood, "mood")}</span>
                    </p>
                  )}
                  {quiz_answers.occasion && (
                    <p>
                      <span className="font-light text-gray-600">使用場合：</span>
                      <span className="font-medium text-gray-800">{getPreferenceText(quiz_answers.occasion, "occasion")}</span>
                    </p>
                  )}
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
