"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/auth-provider"
import { UserStorage } from "@/lib/client-storage"
import { GuestStorage } from "@/lib/guest-storage"
import { AuthGuard } from "@/components/auth-guard"

// 複用quiz頁面的圖標組件
const IconSimple = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-current"></div>
  </div>
)

const IconBalanced = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-3 h-3 border border-current"></div>
  </div>
)

const IconComplex = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-4 h-4 border border-current"></div>
    <div className="absolute w-2 h-2 rounded-full border border-current"></div>
  </div>
)

const IconSubtle = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-dashed border-current"></div>
    <div className="absolute w-3 h-3 rounded-full border border-current"></div>
  </div>
)

const IconModerate = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-current"></div>
    <div className="absolute w-4 h-4 rounded-full border border-current"></div>
  </div>
)

const IconBold = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-current"></div>
  </div>
)

const IconClassic = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-3 h-3 rounded-full border border-current"></div>
  </div>
)

const IconContemporary = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-4 h-2 border-t border-current"></div>
  </div>
)

const IconModern = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-6 h-6 border-t border-l border-current transform rotate-45"></div>
  </div>
)

export default function QuizContinuePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [continueAnswers, setContinueAnswers] = useState({
    complexity: "",
    intensity: "",
    character: "",
  })
  const [guestAnswers, setGuestAnswers] = useState<any>(null)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // 頁面載入時檢查並載入guest答案
  useEffect(() => {
    if (!user) {
      console.log("❌ 用戶未登錄，重定向到登入頁...")
      router.push("/login?from=quiz-continue")
      return
    }

    // 載入guest答案
    const answers = GuestStorage.getGuestQuizAnswers()
    if (!answers) {
      console.log("❌ 沒有找到guest答案，重定向到完整測驗...")
      router.push("/quiz")
      return
    }

    console.log("✅ 載入guest答案:", answers)
    setGuestAnswers(answers)
    window.scrollTo(0, 0)
  }, [user, router])

  // 續答的題目：第3、4、5題
  const continueSteps = [
    {
      id: "complexity",
      dimension: "香氣複雜度",
      dimensionEnds: "簡約純淨 ↔ 融合調和 ↔ 複雜層次",
      question: "您偏好怎樣的香氣結構？",
      options: [
        {
          id: "simple",
          label: "簡約純淨",
          description: "單純、清晰的香氣表達",
          icon: <IconSimple />,
        },
        {
          id: "balanced",
          label: "融合調和",
          description: "適度層次、和諧的香氣",
          icon: <IconBalanced />,
        },
        {
          id: "complex",
          label: "複雜層次",
          description: "豐富、多變的香氣組合",
          icon: <IconComplex />,
        },
      ],
    },
    {
      id: "intensity",
      dimension: "香氣強度",
      dimensionEnds: "輕盈微妙 ↔ 適中 ↔ 濃烈鮮明",
      question: "您想展現怎樣的香氣強度？",
      options: [
        {
          id: "subtle",
          label: "輕盈微妙",
          description: "含蓄、貼近肌膚的香氣",
          icon: <IconSubtle />,
        },
        {
          id: "moderate",
          label: "適中",
          description: "不過於強烈也不過於淡雅",
          icon: <IconModerate />,
        },
        {
          id: "bold",
          label: "濃烈鮮明",
          description: "獨特、強烈、令人難忘的香氣",
          icon: <IconBold />,
        },
      ],
    },
    {
      id: "character",
      dimension: "風格特質",
      dimensionEnds: "經典傳統 ↔ 當代時尚 ↔ 現代創新",
      question: "您偏好怎樣的風格特質？",
      options: [
        {
          id: "classic",
          label: "經典傳統",
          description: "永恆的香氣，展現成熟品味",
          icon: <IconClassic />,
        },
        {
          id: "contemporary",
          label: "當代時尚",
          description: "流行的香氣，展現時尚態度",
          icon: <IconContemporary />,
        },
        {
          id: "modern",
          label: "現代創新",
          description: "創新的香氣，展現獨特個性",
          icon: <IconModern />,
        },
      ],
    },
  ]

  useEffect(() => {
    // 進度條動畫
    if (progressRef.current) {
      const progress = ((currentStep + 1) / continueSteps.length) * 100
      progressRef.current.style.width = `${progress}%`
    }
  }, [currentStep])

  useEffect(() => {
    // 每次步驟變化時滾動到頂部
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

  const handleSelect = async (option: string) => {
    const currentStepId = continueSteps[currentStep].id
    const newAnswers = { ...continueAnswers, [currentStepId]: option }
    setContinueAnswers(newAnswers)

    console.log(`📝 續答步驟 ${currentStep + 1}/${continueSteps.length}: ${currentStepId} = ${option}`)
    console.log("當前續答答案:", newAnswers)

    // 短暫延遲以顯示選擇效果
    setTimeout(async () => {
      if (currentStep < continueSteps.length - 1) {
        // 還有下一步，繼續測驗
        setCurrentStep(currentStep + 1)
        console.log(`➡️ 進入下一步: ${currentStep + 2}/${continueSteps.length}`)
      } else {
        // 測驗完成，合併答案並保存
        console.log("🎉 續答完成！開始合併並保存答案...")
        setSaving(true)

        try {
          // 合併guest答案和續答答案
          const completeAnswers = {
            ...guestAnswers,
            ...newAnswers,
          }
          console.log("📦 完整答案（7題）:", completeAnswers)

          if (user) {
            // 保存到UserStorage
            UserStorage.setQuizAnswers(user.id, completeAnswers)
            console.log("✅ 完整答案已保存到 localStorage")

            // 保存到數據庫
            try {
              const { createClient } = await import("@/lib/supabase/client")
              const supabase = createClient()

              const dataToSave = {
                id: user.id,
                quiz_answers: completeAnswers,
                updated_at: new Date().toISOString(),
              }

              console.log("💾 保存完整答案到資料庫:", dataToSave)

              const { data, error } = await supabase
                .from("user_profiles")
                .upsert(dataToSave, { onConflict: 'id' })
                .select()

              if (error) {
                console.error("❌ 數據庫保存失敗:", error)
              } else {
                console.log("✅ 完整答案已成功保存到數據庫")
                console.log("✅ 儲存後的數據:", data)
              }
            } catch (error) {
              console.error("❌ 保存到數據庫時發生異常:", error)
            }

            // 清除guest答案（已經遷移到用戶賬號）
            GuestStorage.clearGuestQuizAnswers()
            console.log("✅ 已清除guest答案")

            // 跳轉到完整推薦頁面
            console.log("🚀 跳轉到完整推薦頁面...")
            router.push("/recommendations")
          }
        } catch (error) {
          console.error("❌ 保存答案時發生錯誤:", error)
          // 即使保存失敗，也繼續跳轉
          router.push("/recommendations")
        }
      }
    }, 300)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      console.log(`⬅️ 返回上一步: ${currentStep}/${continueSteps.length}`)
    } else {
      router.push("/partial-report")
    }
  }

  if (saving) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">正在保存您的完整答案...</p>
            <p className="text-sm text-gray-500">正在生成完整報告</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!guestAnswers) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">正在載入...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const currentStepData = continueSteps[currentStep]
  const progress = ((currentStep + 1) / continueSteps.length) * 100
  const totalSteps = continueSteps.length

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-[#F5F2ED] flex flex-col">
        {/* 頂部導航 */}
        <header className="py-4 md:py-6 px-4 md:px-6 flex items-center justify-between border-b border-[#E8E2D9]">
          <button
            onClick={handleBack}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-[#EAE5DC] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
          </button>

          <div className="text-center flex-1">
            <h1 className="text-base md:text-lg lg:text-3xl font-light tracking-wide text-gray-800 uppercase tracking-widest">
              完成您的香氣測驗
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">還剩 {totalSteps} 個問題</p>
          </div>

          <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xs md:text-sm font-light text-gray-500">
            {currentStep > 0 ? `${currentStep + 1} / ${totalSteps}` : ''}
          </div>
        </header>

        {/* 進度條 */}
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="w-full h-[1px] bg-[#E8E2D9] overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-gray-800 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 主要內容 */}
        <div className="flex-1 px-4 md:px-6 pb-8 md:pb-12 flex items-center justify-center">
          <div className="w-full max-w-6xl">
            {currentStepData.dimension && (
              <div className="text-center mb-4 md:mb-6">
                <p className="text-sm md:text-base text-gray-500 font-light tracking-wide">
                  {currentStepData.dimension}
                </p>
                {currentStepData.dimensionEnds && (
                  <p className="text-xs md:text-sm text-gray-400 mt-1 font-light">
                    {currentStepData.dimensionEnds}
                  </p>
                )}
              </div>
            )}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extralight text-center mb-8 md:mb-12 text-gray-800 tracking-wide px-2">
              {currentStepData.question}
            </h2>

            <div
              className={cn(
                "grid gap-4 md:gap-6 w-full justify-items-center",
                "grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto"
              )}
            >
              {currentStepData.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={cn(
                    "cursor-pointer group flex flex-col items-center",
                    "transition-all duration-300 ease-out",
                    "relative",
                    "p-2 md:p-4 rounded-lg hover:bg-[#EAE5DC]/50"
                  )}
                >
                  <div
                    className={cn(
                      "mb-3 transition-colors duration-300 relative rounded-full flex items-center justify-center",
                      "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28",
                      hoveredOption === option.id
                        ? "bg-[#EAE5DC] text-gray-800"
                        : "bg-[#F5F2ED] text-gray-400 hover:text-gray-600",
                      "border border-[#E8E2D9]"
                    )}
                  >
                    {option.icon}
                  </div>

                  <div className="text-center">
                    <h3
                      className={cn(
                        "text-xs sm:text-sm md:text-base font-light text-gray-800 tracking-wide uppercase",
                        "transition-all duration-300",
                        hoveredOption === option.id && "font-normal"
                      )}
                    >
                      {option.label}
                    </h3>
                    {option.description && (
                      <p className="text-xs text-gray-500 font-extralight max-w-[140px] sm:max-w-[120px] mx-auto mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
