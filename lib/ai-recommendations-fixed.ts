"use server"

import { COMPREHENSIVE_BRAND_DATABASE } from "./brand-database"

// 多重備用AI提供商配置
const AI_PROVIDERS = [
  {
    name: "XAI",
    available: !!process.env.XAI_API_KEY,
    test: async () => {
      const { generateText } = await import("ai")
      const { xai } = await import("@ai-sdk/xai")
      return generateText({
        model: xai("grok-2"),
        prompt: "測試",
        maxTokens: 5,
      })
    },
  },
  // 可以添加其他提供商作為備用
]

// 改進的AI推薦函數
export async function getAIRecommendationsFixed(quizAnswers: any) {
  console.log("🔍 開始AI推薦流程，用戶偏好:", quizAnswers)

  // 第一步：篩選合適的品牌
  const suitableBrands = filterBrandsByPreferences(quizAnswers)
  console.log(`📊 篩選出 ${suitableBrands.length} 個合適品牌`)

  if (suitableBrands.length === 0) {
    console.log("⚠️ 未找到合適品牌，使用默認品牌")
    const defaultBrands = getDefaultBrands(quizAnswers.gender || "feminine")
    return createFallbackRecommendations(quizAnswers, defaultBrands)
  }

  // 第二步：嘗試AI生成推薦
  for (const provider of AI_PROVIDERS) {
    if (!provider.available) {
      console.log(`❌ ${provider.name} 不可用`)
      continue
    }

    try {
      console.log(`🤖 嘗試使用 ${provider.name} 生成推薦`)
      const aiResult = await generatePersonalizedRecommendationsFixed(quizAnswers, suitableBrands, provider)
      console.log(`✅ ${provider.name} 推薦生成成功`)
      return aiResult
    } catch (error) {
      console.error(`❌ ${provider.name} 失敗:`, error.message)
      continue
    }
  }

  // 第三步：所有AI提供商都失敗，使用智能備用方案
  console.log("🔄 所有AI提供商失敗，使用智能備用方案")
  return createIntelligentFallback(quizAnswers, suitableBrands)
}

async function generatePersonalizedRecommendationsFixed(quizAnswers: any, brands: any[], provider: any) {
  const brandList = brands
    .slice(0, 10)
    .map((b) => `${b.name} (${b.origin}) - ${b.specialty}`)
    .join("\n")

  const prompt = `作為專業調香師，請根據用戶偏好從以下品牌中選擇3個最適合的，並提供專業分析。

用戶偏好：
- 性別: ${quizAnswers.gender === "feminine" ? "女性" : "男性"}香水
- 香調: ${getPreferenceText(quizAnswers.scent)}
- 氣氛: ${getPreferenceText(quizAnswers.mood)}
- 氣質: ${getPreferenceText(quizAnswers.vibe)}
- 感受: ${quizAnswers.feel}

可選品牌：
${brandList}

請返回JSON格式：
{
  "analysis": "專業香調分析（100字以上）",
  "brands": [
    {
      "name": "品牌名稱",
      "origin": "產地",
      "style": "風格",
      "description": "描述",
      "occasions": "適合場合",
      "reason": "推薦理由（50字以上）",
      "recommendedFragrance": {
        "name": "香水名稱",
        "description": "香水描述"
      }
    }
  ]
}`

  try {
    const result = await provider.test()
    // 這裡應該用實際的AI調用替換測試調用
    const { generateText } = await import("ai")
    const { xai } = await import("@ai-sdk/xai")

    const aiResult = await generateText({
      model: xai("grok-2"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    let cleanedText = aiResult.text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    }

    const aiResponse = JSON.parse(cleanedText)

    if (!aiResponse.brands || !Array.isArray(aiResponse.brands)) {
      throw new Error("AI回應格式無效")
    }

    return {
      brands: aiResponse.brands.slice(0, 3).map((brand, index) => {
        const dbBrand = brands.find((b) => b.name === brand.name) || brands[index]
        return {
          id: dbBrand?.id || `ai-brand-${index}`,
          name: brand.name || dbBrand?.name,
          origin: brand.origin || dbBrand?.origin,
          style: brand.style || dbBrand?.style,
          description: brand.description || dbBrand?.description,
          occasions: brand.occasions || dbBrand?.occasions,
          reason: brand.reason || "根據您的偏好推薦",
          recommendedFragrance: brand.recommendedFragrance || {
            name: "經典系列",
            description: "品牌代表作品",
          },
        }
      }),
      analysis: aiResponse.analysis || generateProfessionalAnalysis(quizAnswers),
    }
  } catch (error) {
    console.error("AI生成錯誤:", error)
    throw error
  }
}

function createIntelligentFallback(quizAnswers: any, brands: any[]) {
  console.log("🧠 創建智能備用推薦")

  // 根據用戶偏好智能排序品牌
  const scoredBrands = brands
    .map((brand) => ({
      ...brand,
      score: calculateBrandScore(brand, quizAnswers),
    }))
    .sort((a, b) => b.score - a.score)

  const topBrands = scoredBrands.slice(0, 3)

  return {
    brands: topBrands.map((brand, index) => ({
      id: brand.id,
      name: brand.name,
      origin: brand.origin,
      style: brand.style,
      description: brand.description,
      occasions: brand.occasions,
      reason: generateIntelligentReason(brand, quizAnswers),
      recommendedFragrance: {
        name: getRecommendedFragrance(brand, quizAnswers),
        description: "根據您的偏好精心挑選的香水",
      },
    })),
    analysis: generateProfessionalAnalysis(quizAnswers),
  }
}

function calculateBrandScore(brand: any, quizAnswers: any) {
  let score = 0

  // 性別匹配 (必須)
  if (!brand.gender.includes(quizAnswers.gender)) return 0

  // 香調匹配
  if (brand.scentTypes?.includes(quizAnswers.scent)) score += 3

  // 氣氛匹配
  if (brand.moodTypes?.includes(quizAnswers.mood)) score += 2

  // 氣質匹配
  if (brand.vibeTypes?.includes(quizAnswers.vibe)) score += 2

  // 品牌知名度加分
  const premiumBrands = ["chanel", "dior", "hermes", "tomford", "creed"]
  if (premiumBrands.includes(brand.id)) score += 1

  return score
}

function generateIntelligentReason(brand: any, quizAnswers: any) {
  const reasons = []

  if (brand.scentTypes?.includes(quizAnswers.scent)) {
    reasons.push(`品牌擅長${getPreferenceText(quizAnswers.scent)}的調配`)
  }

  if (brand.moodTypes?.includes(quizAnswers.mood)) {
    reasons.push(`能夠營造${getPreferenceText(quizAnswers.mood)}的氛圍`)
  }

  if (brand.origin === "法國") {
    reasons.push("承襲法式調香傳統")
  } else if (brand.origin === "日本") {
    reasons.push("體現東方美學精髓")
  }

  reasons.push(`${brand.specialty}與您的品味完美契合`)

  return reasons.join("，") + "。"
}

// 輔助函數
function getPreferenceText(preference: string) {
  const map = {
    warm: "溫暖香調",
    fresh: "清新香調",
    woody: "木質香調",
    sophisticated: "精緻複雜",
    playful: "輕鬆活潑",
    classic: "經典優雅",
    modern: "現代前衛",
    bold: "大膽鮮明",
    soft: "柔和細膩",
    intense: "強烈深沉",
    subtle: "含蓄低調",
  }
  return map[preference] || preference
}

function filterBrandsByPreferences(quizAnswers: any) {
  const { gender, scent, mood, vibe } = quizAnswers

  let filtered = COMPREHENSIVE_BRAND_DATABASE.filter((brand) => brand.gender.includes(gender))

  // 逐步放寬條件確保有足夠品牌
  if (filtered.length > 10) {
    filtered = filtered.filter(
      (brand) =>
        brand.scentTypes?.includes(scent) || brand.moodTypes?.includes(mood) || brand.vibeTypes?.includes(vibe),
    )
  }

  return filtered.slice(0, 15)
}

function getDefaultBrands(gender: string) {
  const defaults = gender === "feminine" ? ["chanel", "dior", "kenzo"] : ["tomford", "creed", "cdg"]

  return defaults.map((id) => COMPREHENSIVE_BRAND_DATABASE.find((b) => b.id === id)).filter(Boolean)
}

function createFallbackRecommendations(quizAnswers: any, brands: any[]) {
  return createIntelligentFallback(quizAnswers, brands)
}

function getRecommendedFragrance(brand: any, quizAnswers: any) {
  const fragranceMap = {
    chanel: quizAnswers.gender === "feminine" ? "Coco Mademoiselle" : "Bleu de Chanel",
    dior: quizAnswers.gender === "feminine" ? "Miss Dior" : "Sauvage",
    kenzo: "Flower",
    tomford: "Oud Wood",
    creed: "Aventus",
    cdg: "Hinoki",
  }
  return fragranceMap[brand.id] || "經典系列"
}

function generateProfessionalAnalysis(quizAnswers: any) {
  const scent = quizAnswers?.scent || "fresh"

  const analysisMap = {
    fresh:
      "清新香調以柑橘、綠葉調為核心，具有良好的開放性和清潔感。建議在脈搏點適量使用，讓香氣自然散發。這類香調適合日間佩戴，能夠營造專業而親和的形象。",
    warm: "溫暖香調以琥珀、香草、辛香料為主體，能夠營造舒適包圍感。這類香調通常採用東方香調結構，層次豐富，適合傍晚和特殊場合使用。",
    woody:
      "木質香調以雪松、檀香、廣藿香為基礎，展現自然純淨的力量。不同木材具有不同特徵，建議選擇具有良好平衡感的作品。",
  }

  return analysisMap[scent] + " 選擇香水時可關注品牌的調香師背景和香調配方的平衡性，確保香氣的層次感和持久度。"
}
