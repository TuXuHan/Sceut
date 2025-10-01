"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { UserStorage } from "@/lib/client-storage"
import { AuthGuard } from "@/components/auth-guard"

interface PerfumeRecommendation {
  id: string
  name: string
  brand: string
  description: string
  notes: {
    top: string[]
    middle: string[]
    base: string[]
  }
  personality: string[]
  image: string
  price: number
  rating: number
  match_percentage: number
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<PerfumeRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showQuizPrompt, setShowQuizPrompt] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>("")
  const router = useRouter()
  const { user } = useAuth()

  // 根據用戶的多個喜好組合生成莫蘭迪色系主題
  const getUserColorTheme = (profile: any) => {
    if (!profile) {
      return {
        bg: 'bg-stone-50',
        border: 'border-stone-200',
        dot: 'bg-stone-400',
        text: 'text-stone-600',
        progressBg: 'bg-stone-400',
        tagBg: 'bg-stone-100',
        tagText: 'text-stone-600',
      }
    }

    // 基於香調選擇柔和的莫蘭迪色系
    let colorScheme = {
      bg: 'bg-stone-50',
      border: 'border-stone-200',
      dot: 'bg-stone-400',
      text: 'text-stone-600',
      progressBg: 'bg-stone-400',
      tagBg: 'bg-stone-100',
      tagText: 'text-stone-600',
    }
    
    if (profile.scent === 'fresh') {
      // 清新調 - 淡藍灰色系
      if (profile.mood === 'energetic') {
        colorScheme = {
          bg: 'bg-cyan-50',
          border: 'border-cyan-100',
          dot: 'bg-cyan-400',
          text: 'text-cyan-600',
          progressBg: 'bg-cyan-400',
          tagBg: 'bg-cyan-50',
          tagText: 'text-cyan-600',
        }
      } else {
        colorScheme = {
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          dot: 'bg-blue-400',
          text: 'text-blue-600',
          progressBg: 'bg-blue-400',
          tagBg: 'bg-blue-50',
          tagText: 'text-blue-600',
        }
      }
    } else if (profile.scent === 'floral') {
      // 花香調 - 柔和粉紫色系
      if (profile.intensity === 'bold') {
        colorScheme = {
          bg: 'bg-pink-50',
          border: 'border-pink-100',
          dot: 'bg-pink-400',
          text: 'text-pink-600',
          progressBg: 'bg-pink-400',
          tagBg: 'bg-pink-50',
          tagText: 'text-pink-600',
        }
      } else if (profile.character === 'modern') {
        colorScheme = {
          bg: 'bg-purple-50',
          border: 'border-purple-100',
          dot: 'bg-purple-400',
          text: 'text-purple-600',
          progressBg: 'bg-purple-400',
          tagBg: 'bg-purple-50',
          tagText: 'text-purple-600',
        }
      } else {
        colorScheme = {
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          dot: 'bg-rose-400',
          text: 'text-rose-600',
          progressBg: 'bg-rose-400',
          tagBg: 'bg-rose-50',
          tagText: 'text-rose-600',
        }
      }
    } else if (profile.scent === 'oriental') {
      // 東方調 - 溫暖橙褐色系
      if (profile.character === 'classic') {
        colorScheme = {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          dot: 'bg-amber-400',
          text: 'text-amber-600',
          progressBg: 'bg-amber-400',
          tagBg: 'bg-amber-50',
          tagText: 'text-amber-600',
        }
      } else if (profile.mood === 'calm') {
        colorScheme = {
          bg: 'bg-orange-50',
          border: 'border-orange-100',
          dot: 'bg-orange-400',
          text: 'text-orange-600',
          progressBg: 'bg-orange-400',
          tagBg: 'bg-orange-50',
          tagText: 'text-orange-600',
        }
      } else {
        colorScheme = {
          bg: 'bg-yellow-50',
          border: 'border-yellow-100',
          dot: 'bg-yellow-400',
          text: 'text-yellow-600',
          progressBg: 'bg-yellow-400',
          tagBg: 'bg-yellow-50',
          tagText: 'text-yellow-600',
        }
      }
    } else if (profile.scent === 'woody') {
      // 木質調 - 自然綠色系
      if (profile.intensity === 'subtle') {
        colorScheme = {
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          dot: 'bg-emerald-400',
          text: 'text-emerald-600',
          progressBg: 'bg-emerald-400',
          tagBg: 'bg-emerald-50',
          tagText: 'text-emerald-600',
        }
      } else if (profile.complexity === 'complex') {
        colorScheme = {
          bg: 'bg-teal-50',
          border: 'border-teal-100',
          dot: 'bg-teal-400',
          text: 'text-teal-600',
          progressBg: 'bg-teal-400',
          tagBg: 'bg-teal-50',
          tagText: 'text-teal-600',
        }
      } else {
        colorScheme = {
          bg: 'bg-green-50',
          border: 'border-green-100',
          dot: 'bg-green-400',
          text: 'text-green-600',
          progressBg: 'bg-green-400',
          tagBg: 'bg-green-50',
          tagText: 'text-green-600',
        }
      }
    }

    return colorScheme
  }

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log("🔍 載入推薦結果...")

        // 優先從資料庫獲取用戶的測驗答案
        let storedProfile = null
        let dataSource = ""
        
        try {
          console.log("🔍 嘗試從資料庫載入...")
          const response = await fetch(`/api/profile/get?userId=${user.id}`)
          console.log("📡 API 回應狀態:", response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log("📥 API 返回的完整數據:", data)
            console.log("📦 quiz_answers 欄位:", data.profile?.quiz_answers)
            
            if (data.profile?.quiz_answers) {
              console.log("✅ 從資料庫載入測驗答案:", data.profile.quiz_answers)
              storedProfile = data.profile.quiz_answers
              dataSource = "資料庫"
              // 同步到 localStorage
              UserStorage.setQuizAnswers(user.id, storedProfile)
            } else {
              console.log("⚠️ 資料庫中沒有 quiz_answers 欄位")
            }
          } else {
            console.log("❌ API 請求失敗:", response.status)
          }
        } catch (error) {
          console.error("❌ 從資料庫載入失敗:", error)
          console.log("⚠️ 嘗試從本地存儲載入")
        }
        
        // 如果資料庫沒有，從 localStorage 載入
        if (!storedProfile) {
          storedProfile = UserStorage.getQuizAnswers(user.id)
          console.log("📱 從本地存儲載入測驗答案:", storedProfile)
          dataSource = "localStorage"
        }

        if (!storedProfile) {
          console.log("❌ 沒有找到測驗答案，顯示測驗提示")
          setShowQuizPrompt(true)
          setLoading(false)
          return
        }

        console.log(`✅ 測驗答案（來源: ${dataSource}）:`, storedProfile)
        console.log("📊 答案欄位檢查:", {
          dataSource: dataSource,
          hasGender: !!storedProfile.gender,
          hasScent: !!storedProfile.scent,
          hasComplexity: !!storedProfile.complexity,
          hasIntensity: !!storedProfile.intensity,
          hasCharacter: !!storedProfile.character,
          hasMood: !!storedProfile.mood,
          hasOccasion: !!storedProfile.occasion,
          allFields: Object.keys(storedProfile),
        })
        
        // 檢查是否為舊格式的答案（缺少新欄位）
        const isOldFormat = !storedProfile.complexity && !storedProfile.intensity && !storedProfile.character && !storedProfile.occasion
        if (isOldFormat) {
          console.log("⚠️ 檢測到舊格式的測驗答案")
          console.log("📝 舊答案內容:", storedProfile)
          console.log("💡 建議：點擊「重新測試」按鈕完成新的測驗")
          // 暫時不自動清除，讓用戶看到舊數據並手動重新測驗
          // 但仍然顯示舊數據，避免完全無法使用
        }
        
        setUserProfile(storedProfile)

        // 檢查是否有有效的推薦結果
        const storedRecommendations = UserStorage.getRecommendations(user.id)
        const isValidRecommendation = UserStorage.isRecommendationValid(user.id, storedProfile)

        if (
          storedRecommendations &&
          isValidRecommendation &&
          Array.isArray(storedRecommendations) &&
          storedRecommendations.length > 0
        ) {
          console.log("✅ 找到有效的推薦結果:", storedRecommendations.length, "個")
          setRecommendations(storedRecommendations)
        } else {
          console.log("🔄 沒有有效推薦結果，生成新的推薦...")
          setGenerating(true)

          // 生成新的推薦結果
          console.log("📞 調用 generateRecommendations...")
          const newRecommendations = await generateRecommendations(storedProfile)
          console.log("📦 收到推薦結果:", newRecommendations)
          console.log("📊 推薦數量:", newRecommendations?.length)
          
          setRecommendations(newRecommendations)
          console.log("✅ 推薦狀態已更新")

          // 保存生成的推薦結果
          const recommendationsWithAnswers = {
            recommendations: newRecommendations,
            quizAnswers: storedProfile,
          }
          UserStorage.setRecommendations(user.id, recommendationsWithAnswers)

          setGenerating(false)
        }
      } catch (error) {
        console.error("❌ 載入推薦結果時發生錯誤:", error)
        setShowQuizPrompt(true)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [user, router])

  // 生成推薦結果的函數（調用真正的 AI 服務）
  const generateRecommendations = async (answers: any): Promise<PerfumeRecommendation[]> => {
    console.log("🤖 開始AI分析，生成個人化推薦...")
    console.log("分析答案:", answers)

    try {
      // 調用 AI 推薦 API
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      })

      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`)
      }

      const data = await response.json()
      console.log("📥 API 返回數據:", data)

      if (!data.success || !data.recommendations) {
        console.error("❌ API 返回無效數據:", data)
        throw new Error('API 返回無效數據')
      }

      console.log("✅ AI 推薦生成成功:", data.recommendations.length, "個")
      console.log("📋 推薦詳情:", data.recommendations)
      
      // 如果有 AI 分析文字，也保存起來
      if (data.analysis) {
        setAiAnalysis(data.analysis)
      }
      
      return data.recommendations
    } catch (error) {
      console.error("❌ AI 推薦失敗，使用備用推薦:", error)
      
      // 備用推薦（當 AI 服務失敗時）
      return [
        {
          id: "1",
          name: "優雅晨光",
          brand: "SCEUT",
          description: "清新優雅的花香調，完美展現您的精緻品味",
          notes: {
            top: ["佛手柑", "檸檬", "綠葉"],
            middle: ["茉莉", "玫瑰", "鈴蘭"],
            base: ["白麝香", "雪松", "琥珀"],
          },
          personality: ["優雅", "清新", "精緻"],
          image: "/images/perfume1.png",
          price: 2800,
          rating: 4.8,
          match_percentage: 95,
        },
        {
          id: "2",
          name: "神秘夜語",
          brand: "SCEUT",
          description: "深沉神秘的東方香調，散發迷人魅力",
          notes: {
            top: ["黑胡椒", "粉紅胡椒", "柑橘"],
            middle: ["玫瑰", "茉莉", "依蘭"],
            base: ["檀香", "香草", "麝香"],
          },
          personality: ["神秘", "性感", "迷人"],
          image: "/images/perfume2.png",
          price: 3200,
          rating: 4.9,
          match_percentage: 88,
        },
        {
          id: "3",
          name: "自由之風",
          brand: "SCEUT",
          description: "充滿活力的清新香調，展現自由不羈的個性",
          notes: {
            top: ["海風", "薄荷", "檸檬"],
            middle: ["海洋", "薰衣草", "迷迭香"],
            base: ["雪松", "麝香", "龍涎香"],
          },
          personality: ["自由", "活力", "清新"],
          image: "/images/perfume3.png",
          price: 2600,
          rating: 4.7,
          match_percentage: 82,
        },
      ]
    }
  }

  const handleSubscribe = () => {
    router.push("/subscribe")
  }

  const handleRetakeQuiz = () => {
    console.log("🔄 用戶選擇重新測驗")

    // 清除舊的測驗答案和推薦結果
    if (user) {
      UserStorage.clearQuizAnswers(user.id)
      UserStorage.clearRecommendations(user.id)
      console.log("✅ 已清除本地存儲的舊測驗資料")
      
      // 清除當前頁面狀態，確保重新載入
      setUserProfile(null)
      setRecommendations([])
      setAiAnalysis("")
    }

    // 跳轉到測驗頁面
    router.push("/quiz")
  }

  const handleTakeQuiz = () => {
    router.push("/quiz")
  }

  const handleSkipQuiz = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">正在載入您的推薦結果...</p>
        </div>
      </div>
    )
  }

  if (showQuizPrompt) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-lg p-8 mb-8">
              <div className="flex justify-center mb-6">
                <Sparkles className="w-16 h-16 text-amber-600" />
              </div>
              <h1 className="text-3xl font-light text-gray-800 mb-4">發現您的專屬香氣</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                完成我們的香氣測驗，讓 AI 為您分析個人偏好，
                <br />
                精準推薦最適合您的香水品牌和香調。
              </p>
              <div className="space-y-4">
                <Button
                  onClick={handleTakeQuiz}
                  className="bg-[#A69E8B] hover:bg-[#9A8D7A] text-white px-8 py-3 rounded-lg text-lg font-medium w-full sm:w-auto"
                >
                  開始香氣測驗
                </Button>
                <div>
                  <Button
                    variant="ghost"
                    onClick={handleSkipQuiz}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    暫時跳過，返回首頁
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-light text-gray-800 mb-4">AI 正在分析您的偏好</h2>
          <p className="text-gray-600 mb-2">根據您的測驗答案</p>
          <p className="text-gray-600 mb-4">為您量身打造專屬推薦</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>分析中...</span>
          </div>
        </div>
      </div>
    )
  }

  const getGenderText = (gender: string) => {
    return gender === "feminine" ? "女性香水" : "男性香水"
  }

  const getScentText = (scent: string) => {
    switch (scent) {
      case "fresh":
        return "清新香調"
      case "warm":
        return "溫暖香調"
      case "woody":
        return "木質香調"
      default:
        return scent
    }
  }

  const getMoodText = (mood: string) => {
    switch (mood) {
      case "sophisticated":
        return "精緻優雅"
      case "sporty":
        return "運動活力"
      case "casual":
        return "休閒自在"
      case "sensual":
        return "性感迷人"
      case "playful":
        return "輕鬆活潑"
      case "classic":
        return "經典優雅"
      case "modern":
        return "現代前衛"
      default:
        return mood
    }
  }

  const getVibeText = (vibe: string) => {
    switch (vibe) {
      case "bold":
        return "大膽個性"
      case "soft":
        return "柔和溫婉"
      case "intense":
        return "強烈濃郁"
      case "subtle":
        return "淡雅清香"
      default:
        return vibe
    }
  }

  const getFeelText = (feel: string) => {
    switch (feel) {
      case "confident":
        return "自信魅力"
      case "relaxed":
        return "放鬆舒適"
      case "mysterious":
        return "神秘誘人"
      case "playful":
        return "俏皮可愛"
      case "outgoing":
        return "外向冒險"
      case "sensual":
        return "感性優雅"
      case "sexy":
        return "性感神秘"
      case "sophisticated":
        return "精緻優雅"
      case "adventurous":
        return "冒險不羈"
      default:
        return feel
    }
  }

  // 調試：顯示當前狀態
  console.log("🔍 推薦頁面狀態:", {
    hasUserProfile: !!userProfile,
    userProfile: userProfile,
    recommendationsCount: recommendations.length,
    recommendations: recommendations,
  })

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 返回按鈕 */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-gray-600 hover:text-gray-800 p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* 香氣分析標題 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light text-gray-700 mb-2">香氣分析</h1>
          </div>

          {/* 主要內容區域 */}
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-light text-center text-gray-800 mb-12">您的香氣分析報告</h2>

            {userProfile && (
              <div className="mb-12">
                <h3 className="text-xl font-medium text-gray-800 mb-6">您的香氣偏好</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const colors = getUserColorTheme(userProfile)
                    
                    return (
                      <>
                        <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                          <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                          <div>
                            <span className="text-sm text-gray-500">性別光譜</span>
                            <p className="font-medium text-gray-800">
                              {userProfile.gender === 'feminine' ? '女性化' : userProfile.gender === 'masculine' ? '男性化' : '中性'}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                          <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                          <div>
                            <span className="text-sm text-gray-500">香調家族</span>
                            <p className="font-medium text-gray-800">
                              {userProfile.scent === 'fresh' ? '清新調' : 
                               userProfile.scent === 'floral' ? '花香調' : 
                               userProfile.scent === 'oriental' ? '東方調' : 
                               userProfile.scent === 'woody' ? '木質調' : userProfile.scent}
                            </p>
                          </div>
                        </div>

                        {userProfile.complexity && (
                          <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                            <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                            <div>
                              <span className="text-sm text-gray-500">香氣複雜度</span>
                              <p className="font-medium text-gray-800">
                                {userProfile.complexity === 'simple' ? '簡約純淨' : 
                                 userProfile.complexity === 'balanced' ? '融合調和' : 
                                 userProfile.complexity === 'complex' ? '複雜層次' : userProfile.complexity}
                              </p>
                            </div>
                          </div>
                        )}

                        {userProfile.intensity && (
                          <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                            <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                            <div>
                              <span className="text-sm text-gray-500">香氣強度</span>
                              <p className="font-medium text-gray-800">
                                {userProfile.intensity === 'subtle' ? '輕盈微妙' : 
                                 userProfile.intensity === 'moderate' ? '適中' : 
                                 userProfile.intensity === 'bold' ? '濃烈鮮明' : userProfile.intensity}
                              </p>
                            </div>
                          </div>
                        )}

                        {userProfile.character && (
                          <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                            <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                            <div>
                              <span className="text-sm text-gray-500">風格特質</span>
                              <p className="font-medium text-gray-800">
                                {userProfile.character === 'classic' ? '經典傳統' : 
                                 userProfile.character === 'contemporary' ? '當代時尚' : 
                                 userProfile.character === 'modern' ? '現代創新' : userProfile.character}
                              </p>
                            </div>
                          </div>
                        )}

                        {userProfile.mood && (
                          <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                            <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                            <div>
                              <span className="text-sm text-gray-500">情緒氛圍</span>
                              <p className="font-medium text-gray-800">
                                {userProfile.mood === 'energetic' ? '活力振奮' : 
                                 userProfile.mood === 'calm' ? '平靜舒緩' : userProfile.mood}
                              </p>
                            </div>
                          </div>
                        )}

                        {userProfile.occasion && (
                          <div className={`flex items-center p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                            <div className={`w-2 h-2 ${colors.dot} rounded-full mr-3`}></div>
                            <div>
                              <span className="text-sm text-gray-500">使用場合</span>
                              <p className="font-medium text-gray-800">
                                {userProfile.occasion === 'casual' ? '日常休閒' : 
                                 userProfile.occasion === 'formal' ? '正式特殊' : userProfile.occasion}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* AI 分析報告 */}
            {aiAnalysis && (
              <div className="mb-12">
                <h3 className="text-xl font-medium text-gray-800 mb-4">AI 香氣分析</h3>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{aiAnalysis}</p>
                </div>
              </div>
            )}

            {/* AI 推薦的香水品牌 */}
            {recommendations.length > 0 ? (
              <div className="mb-12">
                <h3 className="text-2xl font-light text-center text-gray-800 mb-2">為您精選的香水品牌</h3>
                <p className="text-center text-gray-600 mb-8">AI 為您精心挑選的香氛品牌</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec) => {
                    const colors = getUserColorTheme(userProfile)
                    
                    return (
                      <div key={rec.id} className={`${colors.bg} border ${colors.border} rounded-lg p-6 hover:shadow-lg transition-shadow`}>
                        <div className="text-center">
                          <h4 className="text-lg font-medium text-gray-800 mb-2">{rec.brand}</h4>
                          <p className="text-sm text-gray-500 mb-4">{rec.name}</p>
                          
                          {/* 匹配度 */}
                          <div className="mb-4">
                            <div className="flex items-center justify-center mb-2">
                              <span className={`text-2xl font-light ${colors.text}`}>{rec.match_percentage}%</span>
                              <span className="text-xs text-gray-500 ml-2">匹配度</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${colors.progressBg} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${rec.match_percentage}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* 描述 */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{rec.description}</p>

                          {/* 個性標籤 */}
                          {rec.personality && rec.personality.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                              {rec.personality.map((tag, idx) => (
                                <span key={idx} className={`px-2 py-1 ${colors.tagBg} ${colors.tagText} text-xs rounded`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-12 text-center p-8 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700">正在生成 AI 推薦...</p>
                <p className="text-sm text-amber-600 mt-2">請稍候，AI 正在分析您的偏好</p>
              </div>
            )}

            {/* 底部按鈕 */}
            <div className="text-center">
              <Button
                onClick={handleSubscribe}
                className="bg-[#A69E8B] hover:bg-[#9A8D7A] text-white px-8 py-3 rounded-lg text-lg font-medium"
              >
                立即訂閱
              </Button>
            </div>
          </div>

          {/* 重新測試按鈕 */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleRetakeQuiz}
              className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              重新測試
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
