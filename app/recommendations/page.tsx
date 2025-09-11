"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
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
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log("🔍 載入推薦結果...")

        // 首先獲取用戶的測驗答案
        const storedProfile = UserStorage.getQuizAnswers(user.id)

        if (!storedProfile) {
          console.log("❌ 沒有找到測驗答案，重定向到問卷頁面")
          router.push("/quiz")
          return
        }

        console.log("✅ 找到測驗答案:", storedProfile)
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
          const newRecommendations = await generateRecommendations(storedProfile)
          setRecommendations(newRecommendations)

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
        router.push("/quiz")
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [user, router])

  // 生成推薦結果的函數（模擬AI分析）
  const generateRecommendations = async (answers: any): Promise<PerfumeRecommendation[]> => {
    console.log("🤖 開始AI分析，生成個人化推薦...")
    console.log("分析答案:", answers)

    // 模擬AI分析延遲
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const basePerfumes: PerfumeRecommendation[] = [
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

    return basePerfumes
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
      console.log("✅ 已清除舊的測驗資料")
    }

    // 跳轉到測驗頁面
    router.push("/quiz")
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                {/* 左側：您的香氣偏好 */}
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-6">您的香氣偏好</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span>性別偏好：{getGenderText(userProfile.gender)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span>香調偏好：{getScentText(userProfile.scent)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span>氣質偏好：{getMoodText(userProfile.mood)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span>質感偏好：{getVibeText(userProfile.vibe)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span>感受偏好：{getFeelText(userProfile.feel)}</span>
                    </div>
                  </div>
                </div>

                {/* 右側：您的關鍵字 */}
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-6">您的關鍵字</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-2">晨光時刻</h4>
                      <p className="text-sm text-gray-600">清新優雅的香氣陪伴您開始美好的一天</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-2">輕奢包圍</h4>
                      <p className="text-sm text-gray-600">溫暖舒適的香氣讓您感受生活的美好</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 香氣之旅描述 */}
            <div className="mb-12">
              <h3 className="text-xl font-medium text-gray-800 mb-4">香氣之旅</h3>
              <p className="text-gray-600 leading-relaxed">
                Annick Goutal這個品牌來自法國巴黎，今晚我們將帶您走進她的香氛世界。我們推薦的這款經典之作「Eau de
                Toilette」古精 靈香水濃度5-15%，或古龍水「Eau de
                Cologne」香精濃度約2-5%。這兩款香水的濃度性溫和，更適合日常使用的香氛系統。
                的香氣系統，特別適合日常穿戴或專業場合。您可以選擇明亮的用香或感受，例如有機檸檬3-4小時香氛一次。各款
                的保存期最好是一般涼爽的香氣或環境溫度（建議溫度15-20°C），避免陽光直射或過度的濕度，這樣能
                夠有效的延長性能並且下降，購買香水時，先在手腕或手肘內側上停留至少30分鐘再決定時之後，因為
                水與每個人的肌膚作用會產生不同，香氣效果會隨時間的因素人有異，最重要的是選擇符合您個性的香氛共同的作品。
              </p>
            </div>

            {/* 為您精選的香水品牌 */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-center text-gray-800 mb-2">為您精選的香水品牌</h3>
              <p className="text-center text-gray-600 mb-8">AI為您精心挑選的香氛存在品牌</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Annick Goutal */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Annick Goutal</h4>
                  <p className="text-sm text-gray-500 mb-4">法國</p>
                  <p className="text-sm text-gray-600 mb-4">詩意浪漫，法式情懷</p>
                  <div className="w-8 h-8 mx-auto border-t border-gray-300"></div>
                </div>

                {/* Miller Harris */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Miller Harris</h4>
                  <p className="text-sm text-gray-500 mb-4">英國</p>
                  <p className="text-sm text-gray-600 mb-4">倫敦風格，自然優雅</p>
                  <div className="w-8 h-8 mx-auto border-t border-gray-300"></div>
                </div>

                {/* Ormonde Jayne */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Ormonde Jayne</h4>
                  <p className="text-sm text-gray-500 mb-4">英國</p>
                  <p className="text-sm text-gray-600 mb-4">英式奢華，精緻調香</p>
                  <div className="w-8 h-8 mx-auto border-t border-gray-300"></div>
                </div>
              </div>
            </div>

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
