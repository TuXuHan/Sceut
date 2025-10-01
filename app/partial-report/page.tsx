"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, Sparkles, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { GuestStorage } from "@/lib/guest-storage"
import { cn } from "@/lib/utils"

export default function PartialReportPage() {
  const [guestAnswers, setGuestAnswers] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  // 如果用户已登錄，重定向到完整測驗
  useEffect(() => {
    if (user) {
      console.log("👤 用戶已登錄，重定向到完整測驗...")
      router.push("/quiz-continue")
      return
    }

    // 載入guest答案
    const answers = GuestStorage.getGuestQuizAnswers()
    if (!answers) {
      console.log("❌ 沒有找到guest答案，重定向到測驗頁面...")
      router.push("/quiz")
      return
    }

    console.log("📱 載入guest答案:", answers)
    setGuestAnswers(answers)
    setLoading(false)
  }, [user, router])

  // 根據答案生成莫蘭迪色系主題
  const getColorTheme = (answers: any) => {
    if (!answers) {
      return {
        bg: 'bg-stone-50',
        border: 'border-stone-200',
        dot: 'bg-stone-400',
        text: 'text-stone-600',
        progressBg: 'bg-stone-400',
        tagBg: 'bg-stone-100',
        tagText: 'text-stone-600',
        accentBg: 'bg-stone-100',
        accentText: 'text-stone-700',
      }
    }

    // 基於香調選擇柔和的莫蘭迪色系
    if (answers.scent === 'fresh') {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        dot: 'bg-blue-400',
        text: 'text-blue-600',
        progressBg: 'bg-blue-400',
        tagBg: 'bg-blue-50',
        tagText: 'text-blue-600',
        accentBg: 'bg-blue-100',
        accentText: 'text-blue-700',
      }
    } else if (answers.scent === 'floral') {
      return {
        bg: 'bg-pink-50',
        border: 'border-pink-100',
        dot: 'bg-pink-400',
        text: 'text-pink-600',
        progressBg: 'bg-pink-400',
        tagBg: 'bg-pink-50',
        tagText: 'text-pink-600',
        accentBg: 'bg-pink-100',
        accentText: 'text-pink-700',
      }
    } else if (answers.scent === 'oriental') {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        dot: 'bg-amber-400',
        text: 'text-amber-600',
        progressBg: 'bg-amber-400',
        tagBg: 'bg-amber-50',
        tagText: 'text-amber-600',
        accentBg: 'bg-amber-100',
        accentText: 'text-amber-700',
      }
    } else if (answers.scent === 'woody') {
      return {
        bg: 'bg-green-50',
        border: 'border-green-100',
        dot: 'bg-green-400',
        text: 'text-green-600',
        progressBg: 'bg-green-400',
        tagBg: 'bg-green-50',
        tagText: 'text-green-600',
        accentBg: 'bg-green-100',
        accentText: 'text-green-700',
      }
    }

    return {
      bg: 'bg-stone-50',
      border: 'border-stone-200',
      dot: 'bg-stone-400',
      text: 'text-stone-600',
      progressBg: 'bg-stone-400',
      tagBg: 'bg-stone-100',
      tagText: 'text-stone-600',
      accentBg: 'bg-stone-100',
      accentText: 'text-stone-700',
    }
  }

  const handleRegister = () => {
    // 跳轉到註冊頁面，帶上來源參數
    router.push("/register?from=partial-report")
  }

  const handleLogin = () => {
    // 如果已經有帳號，跳轉到登入頁面
    router.push("/login?from=partial-report")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">正在載入您的香氣分析...</p>
        </div>
      </div>
    )
  }

  const colors = getColorTheme(guestAnswers)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按鈕 */}
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 text-gray-600 hover:text-gray-800 p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* 標題 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-light text-gray-700">您的香氣分析預覽</h1>
          </div>
          <p className="text-sm text-gray-500">基於您的初步偏好分析</p>
        </div>

        {/* 主要內容區域 */}
        <div className="bg-gray-50 rounded-lg p-8 mb-6">
          <h2 className="text-3xl font-light text-center text-gray-800 mb-8">初步香氣偏好</h2>

          {/* 顯示已回答的偏好 */}
          {guestAnswers && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                  <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                  <div>
                    <span className="text-sm text-gray-500">性別光譜</span>
                    <p className="font-medium text-gray-800">
                      {guestAnswers.gender === 'feminine' ? '女性化' : 
                       guestAnswers.gender === 'masculine' ? '男性化' : '中性'}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                  <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                  <div>
                    <span className="text-sm text-gray-500">香調家族</span>
                    <p className="font-medium text-gray-800">
                      {guestAnswers.scent === 'fresh' ? '清新調' : 
                       guestAnswers.scent === 'floral' ? '花香調' : 
                       guestAnswers.scent === 'oriental' ? '東方調' : 
                       guestAnswers.scent === 'woody' ? '木質調' : guestAnswers.scent}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                  <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                  <div>
                    <span className="text-sm text-gray-500">情緒氛圍</span>
                    <p className="font-medium text-gray-800">
                      {guestAnswers.mood === 'energetic' ? '活力振奮' : 
                       guestAnswers.mood === 'calm' ? '平靜舒緩' : guestAnswers.mood}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                  <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                  <div>
                    <span className="text-sm text-gray-500">使用場合</span>
                    <p className="font-medium text-gray-800">
                      {guestAnswers.occasion === 'casual' ? '日常休閒' : 
                       guestAnswers.occasion === 'formal' ? '正式特殊' : guestAnswers.occasion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 鎖定的深度分析 */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">深度分析已鎖定</p>
                <p className="text-sm text-gray-500 mt-1">註冊以解鎖完整分析</p>
              </div>
            </div>
            
            <div className="opacity-30 pointer-events-none">
              <h3 className="text-xl font-medium text-gray-800 mb-4">深度香氣分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <div>
                    <span className="text-sm text-gray-500">香氣複雜度</span>
                    <p className="font-medium text-gray-800">●●●●●</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <div>
                    <span className="text-sm text-gray-500">香氣強度</span>
                    <p className="font-medium text-gray-800">●●●●●</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <div>
                    <span className="text-sm text-gray-500">風格特質</span>
                    <p className="font-medium text-gray-800">●●●●●</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <div>
                    <span className="text-sm text-gray-500">AI 推薦品牌</span>
                    <p className="font-medium text-gray-800">●●●●●</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 預覽推薦 */}
          <div className="mb-8 relative">
            <h3 className="text-xl font-medium text-gray-800 mb-4 text-center">為您準備的香水推薦</h3>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center mt-12">
              <div className="text-center px-4">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">AI 推薦已鎖定</p>
                <p className="text-sm text-gray-500 mt-1">完成註冊後解鎖 3-5 款精選香水</p>
              </div>
            </div>

            <div className="opacity-20 pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 border border-gray-200 rounded-lg p-6">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">香水品牌 {i}</h4>
                      <p className="text-sm text-gray-500 mb-4">●●●●●●●●●●</p>
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-2xl font-light text-gray-600">??%</span>
                        <span className="text-xs text-gray-500 ml-2">匹配度</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 解鎖完整報告CTA */}
        <div className={cn("rounded-lg p-8 text-center mb-6", colors.accentBg)}>
          <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-2xl font-light text-gray-800 mb-2">解鎖完整香氣分析報告</h3>
          <p className="text-gray-600 mb-1">完成註冊後繼續測驗，獲得：</p>
          <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
            <li className="flex items-start">
              <ChevronRight className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">深度香氣複雜度與強度分析</span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">個人風格特質完整解讀</span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">AI 精選 3-5 款最適合您的香水品牌</span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">專屬香氣推薦與匹配度分析</span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">保存測驗結果，隨時查看</span>
            </li>
          </ul>

          <div className="space-y-3">
            <Button
              onClick={handleRegister}
              size="lg"
              className="bg-gray-800 hover:bg-black text-white px-12 py-6 text-lg font-normal w-full sm:w-auto"
            >
              立即註冊，解鎖完整報告
            </Button>
            
            <div className="text-sm text-gray-600">
              已有帳號？
              <button
                onClick={handleLogin}
                className="text-gray-800 hover:text-black font-medium ml-1 underline"
              >
                立即登入
              </button>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center text-sm text-gray-500">
          <p>您的測驗答案已安全保存在本地</p>
          <p className="mt-1">註冊後將自動恢復，無需重新作答</p>
        </div>
      </div>
    </div>
  )
}
