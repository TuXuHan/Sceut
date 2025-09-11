"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/auth-provider"
import { UserStorage } from "@/lib/client-storage"
import { saveUserProfile } from "@/lib/user-data-service"

// 簡化的圖標組件，使用基本HTML和CSS而不是SVG
const IconFeminine = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-4 h-4 rounded-full border border-current"></div>
    <div className="absolute mt-6 w-4 h-4 border-l border-current"></div>
    <div className="absolute mt-6 w-4 border-t border-current"></div>
  </div>
)

const IconMasculine = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-4 h-4 rounded-full border border-current"></div>
    <div className="absolute -mt-2 -ml-2 w-4 h-4 border-t border-r border-current"></div>
  </div>
)

const IconWarm = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-current"></div>
    <div className="absolute w-3 h-3 rounded-full border border-current ml-1"></div>
  </div>
)

const IconFresh = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-current"></div>
    <div className="absolute w-4 h-4 border-t border-current"></div>
  </div>
)

const IconWoody = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="h-6 border-l border-current"></div>
    <div className="absolute w-4 border-t border-current"></div>
  </div>
)

const IconSophisticated = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-3 rounded-full border border-current"></div>
    <div className="absolute mt-4 h-3 border-l border-current"></div>
  </div>
)

const IconPlayful = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 border-t border-current"></div>
    <div className="absolute mt-3 w-4 border-b border-current rounded-full"></div>
  </div>
)

const IconClassic = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-3 h-3 rounded-full border border-current"></div>
  </div>
)

const IconModern = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-6 h-6 border-t border-l border-current transform rotate-45"></div>
  </div>
)

const IconBold = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-current"></div>
  </div>
)

const IconSoft = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-3 border-t border-current rounded-full"></div>
    <div className="absolute mt-3 w-6 h-3 border-b border-current rounded-full"></div>
  </div>
)

const IconIntense = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-current"></div>
    <div className="absolute w-3 h-3 rounded-full border border-current"></div>
  </div>
)

const IconSubtle = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-dashed border-current"></div>
    <div className="absolute w-3 h-3 rounded-full border border-current"></div>
  </div>
)

const IconOutgoing = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 border-t border-current"></div>
    <div className="absolute ml-2 w-2 h-2 border-t border-r border-current transform rotate-45"></div>
  </div>
)

const IconSensual = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-3 border-t border-current rounded-full"></div>
    <div className="absolute mt-3 w-6 h-3 border-b border-current rounded-full"></div>
  </div>
)

const IconPlayfulFeel = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 flex justify-between items-start pt-1">
      <div className="w-1 h-1 rounded-full border border-current"></div>
      <div className="w-1 h-1 rounded-full border border-current"></div>
    </div>
    <div className="absolute mt-3 w-4 border-b border-current rounded-full"></div>
  </div>
)

const IconSexy = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-current"></div>
    <div className="absolute w-4 h-2 border-b border-current rounded-full"></div>
  </div>
)

const IconRelaxed = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-3 border-t border-current rounded-full"></div>
    <div className="absolute mt-2 w-6 h-3 border-b border-current rounded-full"></div>
  </div>
)

const IconConfident = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-current"></div>
    <div className="absolute mt-2 h-3 border-l border-current"></div>
  </div>
)

const IconSophisticatedFeel = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-3 h-3 rounded-full border border-current"></div>
  </div>
)

const IconAdventurous = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 border-t border-current"></div>
    <div className="absolute h-6 border-l border-current"></div>
    <div className="absolute w-4 h-4 rounded-full border border-current"></div>
  </div>
)

const IconMysterious = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-current"></div>
    <div className="absolute -mt-1 w-2 h-2 border-b border-current rounded-full"></div>
    <div className="absolute mt-3 w-1 h-1 rounded-full border border-current"></div>
  </div>
)

export default function QuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({
    gender: "",
    scent: "",
    mood: "",
    vibe: "",
    feel: "",
  })
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isRetaking, setIsRetaking] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // 頁面載入時自動滾動到頂部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 每次步驟變化時滾動到頂部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

  // 檢查是否為重新測驗
  useEffect(() => {
    const checkIfRetaking = () => {
      if (user) {
        const existingAnswers = UserStorage.getQuizAnswers(user.id)
        if (existingAnswers) {
          setIsRetaking(true)
          console.log("🔄 檢測到重新測驗，將清除舊的推薦結果")
          // 清除舊的推薦結果，強制重新生成
          UserStorage.clearRecommendations(user.id)
        }
      }
    }

    checkIfRetaking()
  }, [user])

  // 女性香水測驗流程
  const feminineSteps = [
    {
      id: "gender",
      question: "您尋找的是哪種類型的香水？",
      options: [
        {
          id: "feminine",
          label: "女性香水",
          icon: <IconFeminine />,
        },
        {
          id: "masculine",
          label: "男性香水",
          icon: <IconMasculine />,
        },
      ],
    },
    {
      id: "scent",
      question: "您通常偏好哪種類型的香調？",
      options: [
        {
          id: "warm",
          label: "溫暖香調",
          description: "舒適、感性的香氣，層次豐富",
          icon: <IconWarm />,
        },
        {
          id: "fresh",
          label: "清新香調",
          description: "充滿活力的香氣，輕盈愉悅",
          icon: <IconFresh />,
        },
      ],
    },
    {
      id: "mood",
      question: "您想營造怎樣的氛圍？",
      options: [
        {
          id: "sophisticated",
          label: "精緻複雜",
          description: "複雜、層次豐富的組合",
          icon: <IconSophisticated />,
        },
        {
          id: "playful",
          label: "輕鬆活潑",
          description: "輕盈愉悅的香氣",
          icon: <IconPlayful />,
        },
      ],
    },
    {
      id: "vibe",
      question: "您想展現怎樣的氣質？",
      options: [
        {
          id: "bold",
          label: "大膽鮮明",
          description: "獨特、強烈、令人難忘的香氣",
          icon: <IconBold />,
        },
        {
          id: "soft",
          label: "柔和細膩",
          description: "舒適、甜美、愉悅的香氣",
          icon: <IconSoft />,
        },
      ],
    },
    {
      id: "feel",
      question: "您希望香氣給您帶來怎樣的感受？",
      options: [
        {
          id: "outgoing",
          label: "外向冒險",
          icon: <IconOutgoing />,
        },
        {
          id: "sensual",
          label: "感性優雅",
          icon: <IconSensual />,
        },
        {
          id: "playful",
          label: "俏皮活潑",
          icon: <IconPlayfulFeel />,
        },
        {
          id: "sexy",
          label: "性感神秘",
          icon: <IconSexy />,
        },
        {
          id: "relaxed",
          label: "放鬆隨性",
          icon: <IconRelaxed />,
        },
      ],
    },
  ]

  // 男性香水測驗流程
  const masculineSteps = [
    // 第一步與女性相同
    feminineSteps[0],
    {
      id: "scent",
      question: "您通常偏好哪種類型的香調？",
      options: [
        {
          id: "woody",
          label: "暗沉香調",
          description: "深沉、溫暖的香氣，展現成熟魅力",
          icon: <IconWoody />,
        },
        {
          id: "fresh",
          label: "清新香調",
          description: "清爽、活力的香氣，展現自信風格",
          icon: <IconFresh />,
        },
      ],
    },
    {
      id: "mood",
      question: "您想營造怎樣的氛圍？",
      options: [
        {
          id: "classic",
          label: "經典優雅",
          description: "永恆的香氣，展現成熟品味",
          icon: <IconClassic />,
        },
        {
          id: "modern",
          label: "現代前衛",
          description: "創新的香氣，展現獨特個性",
          icon: <IconModern />,
        },
      ],
    },
    {
      id: "vibe",
      question: "您想展現怎樣的氣質？",
      options: [
        {
          id: "intense",
          label: "強烈深沉",
          description: "持久、個性的香氣",
          icon: <IconIntense />,
        },
        {
          id: "subtle",
          label: "含蓄低調",
          description: "輕盈、貼近肌膚的香氣",
          icon: <IconSubtle />,
        },
      ],
    },
    {
      id: "feel",
      question: "您希望香氣給您帶來怎樣的感受？",
      options: [
        {
          id: "confident",
          label: "自信果敢",
          icon: <IconConfident />,
        },
        {
          id: "sophisticated",
          label: "精緻優雅",
          icon: <IconSophisticatedFeel />,
        },
        {
          id: "adventurous",
          label: "冒險不羈",
          icon: <IconAdventurous />,
        },
        {
          id: "mysterious",
          label: "神秘魅力",
          icon: <IconMysterious />,
        },
        {
          id: "relaxed",
          label: "從容自在",
          icon: <IconRelaxed />,
        },
      ],
    },
  ]

  // 根據性別選擇不同的測驗流程
  const getSteps = () => {
    if (currentStep === 0) return feminineSteps
    return answers.gender === "feminine" ? feminineSteps : masculineSteps
  }

  const steps = getSteps()

  useEffect(() => {
    // 進度條動畫
    if (progressRef.current) {
      const progress = ((currentStep + 1) / steps.length) * 100
      progressRef.current.style.width = `${progress}%`
    }
  }, [currentStep, steps.length])

  const handleSelect = async (option: string) => {
    const currentStepId = steps[currentStep].id
    const newAnswers = { ...answers, [currentStepId]: option }
    setAnswers(newAnswers)

    console.log(`📝 步驟 ${currentStep + 1}/${steps.length}: ${currentStepId} = ${option}`)
    console.log("當前答案:", newAnswers)

    // 短暫延遲以顯示選擇效果
    setTimeout(async () => {
      if (currentStep < steps.length - 1) {
        // 還有下一步，繼續測驗
        setCurrentStep(currentStep + 1)
        console.log(`➡️ 進入下一步: ${currentStep + 2}/${steps.length}`)
      } else {
        // 測驗完成，保存答案並跳轉
        console.log("🎉 測驗完成！開始保存答案...")
        console.log("最終答案:", newAnswers)
        setSaving(true)

        try {
          if (user) {
            console.log("💾 保存測驗答案...")

            // 如果是重新測驗，先清除舊的推薦結果
            if (isRetaking) {
              console.log("🗑️ 清除舊的推薦結果...")
              UserStorage.clearRecommendations(user.id)
            }

            // 保存新的測驗答案到用戶存儲
            UserStorage.setQuizAnswers(user.id, newAnswers)
            console.log("✅ 答案已保存到 localStorage")

            // 同時嘗試保存到數據庫
            try {
              await saveUserProfile({
                id: user.id,
                quiz_answers: newAnswers,
              })
              console.log("✅ 答案已保存到數據庫")
            } catch (error) {
              console.error("❌ 保存到數據庫失敗:", error)
              // 即使數據庫保存失敗，也繼續流程，因為已保存到 localStorage
            }

            // 跳轉到推薦頁面
            console.log("🚀 跳轉到推薦頁面...")
            router.push("/recommendations")
          } else {
            // 如果用戶未登入，保存到全局 localStorage（向後兼容）
            localStorage.setItem("quizAnswers", JSON.stringify(newAnswers))
            console.log("⚠️ 用戶未登入，答案已保存到本地存儲")
            router.push("/recommendations")
          }
        } catch (error) {
          console.error("❌ 保存測驗答案時發生錯誤:", error)
          // 即使保存失敗，也繼續到推薦頁面，因為 localStorage 備份已經保存
          console.log("🔄 保存失敗，但仍跳轉到推薦頁面...")
          router.push("/recommendations")
        } finally {
          setSaving(false)
        }
      }
    }, 300)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      console.log(`⬅️ 返回上一步: ${currentStep}/${steps.length}`)
    } else {
      router.push("/")
    }
  }

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const totalSteps = steps.length

  if (saving) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">正在保存您的答案...</p>
          {isRetaking && <p className="text-sm text-gray-500">正在更新您的偏好設定</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col">
      {/* 頂部導航 */}
      <header className="py-6 px-6 flex items-center justify-between border-b border-[#E8E2D9]">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#EAE5DC] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>

        <div className="text-center">
          <h1 className="text-lg font-light tracking-wide text-gray-800 uppercase tracking-widest">
            {isRetaking ? "重新測驗" : "香氣測驗"}
          </h1>
        </div>

        {currentStep > 0 && (
          <div className="w-10 h-10 flex items-center justify-center text-sm font-light text-gray-500">
            {currentStep + 1} / {totalSteps}
          </div>
        )}
        {currentStep === 0 && <div className="w-10 h-10"></div>}
      </header>

      {/* 進度條 */}
      <div className="px-6 py-4">
        <div className="w-full h-[1px] bg-[#E8E2D9] overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gray-800 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 主要內容 */}
      <div className="flex-1 px-6 pb-12 flex flex-col">
        <div className="h-full flex flex-col flex-1">
          <h2 className="text-2xl md:text-3xl font-extralight text-center mb-12 text-gray-800 mt-8 tracking-wide">
            {currentStepData.question}
          </h2>

          <div
            className={cn(
              "grid gap-4 max-w-6xl mx-auto w-full",
              currentStepData.options.length > 2
                ? "grid-cols-1 sm:grid-cols-3 md:grid-cols-5"
                : "grid-cols-1 md:grid-cols-2",
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
                )}
              >
                <div
                  className={cn(
                    "mb-3 transition-colors duration-300 relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center",
                    hoveredOption === option.id
                      ? "bg-[#EAE5DC] text-gray-800"
                      : "bg-[#F5F2ED] text-gray-400 hover:text-gray-600",
                    "border border-[#E8E2D9]",
                  )}
                >
                  {option.icon}
                </div>

                <div className="text-center">
                  <h3
                    className={cn(
                      "text-sm md:text-base font-light text-gray-800 tracking-wide uppercase",
                      "transition-all duration-300",
                      hoveredOption === option.id && "font-normal",
                    )}
                  >
                    {option.label}
                  </h3>
                  {option.description && (
                    <p className="text-xs text-gray-500 font-extralight max-w-[120px] mx-auto">{option.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
