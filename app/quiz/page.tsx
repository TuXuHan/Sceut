"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/auth-provider"
import { UserStorage } from "@/lib/client-storage"
import { GuestStorage } from "@/lib/guest-storage"
import { saveUserProfile } from "@/lib/user-data-service"

// 簡化的圖標組件，使用基本HTML和CSS
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

const IconNeutral = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-current"></div>
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

const IconFloral = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-3 h-3 rounded-full border border-current"></div>
    <div className="absolute w-4 h-1 border-t border-current rotate-45"></div>
    <div className="absolute w-4 h-1 border-t border-current -rotate-45"></div>
  </div>
)

const IconOriental = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current transform rotate-45"></div>
    <div className="absolute w-3 h-3 border border-current"></div>
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

const IconEnergetic = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-current"></div>
  </div>
)

const IconCalm = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-3 border-t border-current rounded-full"></div>
    <div className="absolute mt-3 w-6 h-3 border-b border-current rounded-full"></div>
  </div>
)

const IconCasual = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border border-dashed border-current"></div>
  </div>
)

const IconFormal = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <div className="w-6 h-6 border border-current"></div>
    <div className="absolute w-3 h-3 border border-current"></div>
  </div>
)

export default function QuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({
    gender: "",
    scent: "",
    complexity: "",
    intensity: "",
    character: "",
    mood: "",
    occasion: "",
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

  // 統一的測驗流程
  const quizSteps = [
    {
      id: "gender",
      dimension: "性別光譜",
      dimensionEnds: "女性化 ↔ 中性 ↔ 男性化",
      question: "您尋找的是哪種類型的香水？",
      options: [
        {
          id: "feminine",
          label: "女性香水",
          description: "柔美、優雅的香氣",
          icon: <IconFeminine />,
        },
        {
          id: "neutral",
          label: "中性香水",
          description: "平衡、多元的香氣",
          icon: <IconNeutral />,
        },
        {
          id: "masculine",
          label: "男性香水",
          description: "剛毅、沉穩的香氣",
          icon: <IconMasculine />,
        },
      ],
    },
    {
      id: "scent",
      dimension: "香調家族",
      dimensionEnds: "清新調 · 花香調 · 東方調 · 木質調",
      question: "您偏好哪種香調家族？",
      options: [
        {
          id: "fresh",
          label: "清新調 Fresh",
          description: "柑橘、水生、綠葉香氣",
          icon: <IconFresh />,
        },
        {
          id: "floral",
          label: "花香調 Floral",
          description: "玫瑰、茉莉、百合香氣",
          icon: <IconFloral />,
        },
        {
          id: "oriental",
          label: "東方調 Oriental",
          description: "辛香、琥珀、香草香氣",
          icon: <IconOriental />,
        },
        {
          id: "woody",
          label: "木質調 Woody",
          description: "檀香、雪松、岩蘭草香氣",
          icon: <IconWoody />,
        },
      ],
    },
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
    {
      id: "mood",
      dimension: "情緒氛圍",
      dimensionEnds: "活力振奮 ↔ 平靜舒緩",
      question: "您希望香氣帶來怎樣的情緒氛圍？",
      options: [
        {
          id: "energetic",
          label: "活力振奮",
          description: "充滿能量、激發活力",
          icon: <IconEnergetic />,
        },
        {
          id: "calm",
          label: "平靜舒緩",
          description: "放鬆身心、帶來寧靜",
          icon: <IconCalm />,
        },
      ],
    },
    {
      id: "occasion",
      dimension: "使用場合",
      dimensionEnds: "日常休閒 ↔ 正式特殊",
      question: "您主要在什麼場合使用香水？",
      options: [
        {
          id: "casual",
          label: "日常休閒",
          description: "適合每天佩戴的輕鬆香氣",
          icon: <IconCasual />,
        },
        {
          id: "formal",
          label: "正式特殊",
          description: "適合重要場合的精緻香氣",
          icon: <IconFormal />,
        },
      ],
    },
  ]

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

  // 根據用戶登錄狀態選擇不同的測驗流程
  // Guest用戶: 第1、2、6、7題 (索引0、1、5、6)
  // 註冊用戶: 全部7題
  const guestSteps = [
    quizSteps[0], // gender
    quizSteps[1], // scent
    quizSteps[5], // mood
    quizSteps[6], // occasion
  ]
  
  const steps = user ? quizSteps : guestSteps

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
            // 註冊用戶 - 保存完整答案（全部7題）
            console.log("💾 保存註冊用戶測驗答案...")

            // 如果是重新測驗，先清除舊的推薦結果
            if (isRetaking) {
              console.log("🗑️ 清除舊的推薦結果...")
              UserStorage.clearRecommendations(user.id)
            }

            // 保存新的測驗答案到用戶存儲
            UserStorage.setQuizAnswers(user.id, newAnswers)
            console.log("✅ 答案已保存到 localStorage")

            // 直接使用客戶端 Supabase 儲存到資料庫
            let saveSuccess = false
            try {
              console.log("🔄 嘗試保存到 Supabase 數據庫...")
              console.log("📝 準備儲存的答案:", newAnswers)
              
              // 使用 auth context 中的 supabase 客戶端
              const { createClient } = await import("@/lib/supabase/client")
              const supabase = createClient()
              
              const dataToSave = {
                id: user.id,
                quiz_answers: newAnswers,
                updated_at: new Date().toISOString(),
              }
              
              console.log("💾 直接儲存到資料庫:", dataToSave)
              
              const { data, error } = await supabase
                .from("user_profiles")
                .upsert(dataToSave, { onConflict: 'id' })
                .select()

              if (error) {
                console.error("❌ 數據庫保存失敗:", error)
                console.log("📱 答案已保存到本地存儲作為備份")
              } else {
                console.log("✅ 測驗答案已成功保存到數據庫")
                console.log("✅ 儲存後的數據:", data)
                saveSuccess = true
              }
            } catch (error) {
              console.error("❌ 保存到數據庫時發生異常:", error)
              console.log("📱 答案已保存到本地存儲作為備份")
            }

            // 無論儲存成功或失敗，都跳轉到推薦頁面（localStorage 已有備份）
            console.log("🚀 跳轉到完整推薦頁面...", saveSuccess ? "(資料庫儲存成功)" : "(使用 localStorage 備份)")
            
            // 直接跳轉，不設置 setSaving(false)，讓頁面保持 loading 狀態直到跳轉完成
            router.push("/recommendations")
          } else {
            // Guest用戶 - 保存部分答案（1、2、6、7題）到 GuestStorage
            console.log("💾 保存Guest用戶測驗答案...")
            GuestStorage.saveGuestQuizAnswers(newAnswers)
            console.log("✅ Guest答案已保存到本地存儲:", newAnswers)
            
            // 跳轉到部分報告頁面
            console.log("🚀 跳轉到部分報告頁面...")
            router.push("/partial-report")
          }
        } catch (error) {
          console.error("❌ 保存測驗答案時發生錯誤:", error)
          // 即使保存失敗，也繼續跳轉
          console.log("🔄 保存失敗，但仍跳轉...")
          if (user) {
            router.push("/recommendations")
          } else {
            router.push("/partial-report")
          }
        }
        // 移除 finally 區塊，讓頁面保持 saving 狀態直到跳轉完成
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
          {user ? (
            isRetaking ? (
              <p className="text-sm text-gray-500">正在更新您的偏好設定</p>
            ) : (
              <p className="text-sm text-gray-500">正在生成完整報告</p>
            )
          ) : (
            <p className="text-sm text-gray-500">正在生成部分報告</p>
          )}
        </div>
      </div>
    )
  }

  return (
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
            {user ? (isRetaking ? "重新測驗" : "香氣測驗") : "探索您的香氣偏好"}
          </h1>
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
              currentStepData.options.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                : currentStepData.options.length === 3
                ? "grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto",
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
                  "p-2 md:p-4 rounded-lg hover:bg-[#EAE5DC]/50",
                )}
              >
                <div
                  className={cn(
                    "mb-3 transition-colors duration-300 relative rounded-full flex items-center justify-center",
                    "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28",
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
                      "text-xs sm:text-sm md:text-base font-light text-gray-800 tracking-wide uppercase",
                      "transition-all duration-300",
                      hoveredOption === option.id && "font-normal",
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
  )
}
