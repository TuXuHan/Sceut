"use server"

import { getVerifiedBrands, getBrandsByGender } from "./brand-database"
import { getPreferenceText, getRecommendedFragrance } from "./utils"

// Gemini AI推薦函數 - 確保根據用戶偏好推薦不同品牌
export async function getGeminiRecommendations(quizAnswers: any) {
  console.log("🔍 開始 AI 推薦流程，用戶偏好:", quizAnswers)

  // 檢查Gemini API密鑰
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ AI 服務密鑰未設置，使用智能備用推薦")
    return createIntelligentFallback(quizAnswers)
  }

  // 第一步：根據用戶偏好篩選合適的真實品牌
  const suitableBrands = filterVerifiedBrandsByPreferences(quizAnswers)
  console.log(`📊 篩選出 ${suitableBrands.length} 個合適的真實品牌`)

  if (suitableBrands.length === 0) {
    console.log("⚠️ 未找到合適品牌，使用性別匹配品牌")
    const genderBrands = getBrandsByGender(quizAnswers.gender || "feminine")
    return createIntelligentFallback(quizAnswers, genderBrands)
  }

  // 第二步：使用Gemini生成個性化推薦
  try {
    console.log("🤖 使用 AI 生成個性化推薦")
    const geminiResult = await generateGeminiRecommendations(quizAnswers, suitableBrands)
    console.log("✅ AI 推薦生成成功")
    return geminiResult
  } catch (error) {
    console.error("❌ AI 生成失敗:", error)
    console.log("🔄 切換到智能備用推薦")
    return createIntelligentFallback(quizAnswers, suitableBrands)
  }
}

// 測試Gemini連接
export async function testGeminiConnection() {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return {
        success: false,
        error: "GOOGLE_GENERATIVE_AI_API_KEY 未設置",
      }
    }

    const { generateText } = await import("ai")
    const { google } = await import("@ai-sdk/google")

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: '請回答"測試成功"',
      temperature: 0.1,
      maxOutputTokens: 10,
    })

    console.log("AI 測試回應:", result.text)

    // 確保返回的是有效的字符串
    const responseText = result.text || "測試完成"

    return {
      success: true,
      response: responseText,
    }
  } catch (error) {
    console.error("AI 測試錯誤:", error)

    // 改善錯誤處理，確保返回有效的錯誤信息
    let errorMessage = "未知錯誤"

    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === "string") {
      errorMessage = error
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

async function generateGeminiRecommendations(quizAnswers: any, brands: any[]) {
  // 確保只使用已驗證的真實品牌
  const verifiedBrands = brands.filter((brand) => brand.verified === true)

  // 根據用戶偏好對品牌進行評分和排序
  const scoredBrands = verifiedBrands
    .map((brand) => ({
      ...brand,
      score: calculateDetailedBrandScore(brand, quizAnswers),
    }))
    .sort((a, b) => b.score - a.score)

  console.log("🎯 品牌評分結果:")
  scoredBrands.slice(0, 8).forEach((brand, index) => {
    console.log(
      `${index + 1}. ${brand.name} (${brand.origin}) - 分數: ${brand.score} ${brand.niche ? "[小眾]" : "[主流]"}`,
    )
  })

  // 選擇前12個品牌供AI選擇，確保多樣性
  const selectedBrands = scoredBrands.slice(0, 12)

  const brandList = selectedBrands
    .map((b) => `${b.name} (${b.origin}) - ${b.specialty}${b.niche ? " [小眾品牌]" : ""} [評分: ${b.score}]`)
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
  "analysis": "專業香調分析（嚴格控制在480-520字之間，必須直接對用戶說話使用「您」而非「您好！」開頭，必須包含具體香調結構如前調中調基調、具體香料成分如佛手柑檀香等、專業使用技巧、季節環境建議、香水濃度建議，避免使用英文詞彙。請確保內容結構完整：香調分析（150字）+ 使用技巧（150字）+ 濃度建議（120字）+ 保存建議（100字）= 約520字）",
  "brands": [
    {
      "name": "品牌名稱（必須完全匹配上述列表中的品牌名稱）",
      "origin": "品牌產地",
      "style": "品牌風格",
      "description": "品牌描述",
      "occasions": "適合場合",
      "reason": "詳細的個性化推薦理由（至少60字，說明為什麼這個品牌適合用戶的具體偏好）",
      "recommendedFragrance": {
        "name": "該品牌真實存在的香水名稱",
        "description": "香水的詳細描述和香調特徵"
      }
    }
  ]
}

注意事項：
1. 品牌名稱必須完全匹配上述列表，不得創造新品牌
2. 推薦的香水必須是該品牌真實存在的產品
3. 推薦理由必須具體說明品牌如何匹配用戶偏好
4. 根據用戶的不同偏好選擇不同的品牌組合
5. 確保推薦的多樣性和個性化
6. 分析內容必須專業且個性化，直接對用戶說話，不要以「您好！」開頭
7. 分析必須包含專業香調結構（前調、中調、基調）和具體香料成分名稱
8. 使用正式專業的語言，避免過於口語化的表達
9. 嚴格控制分析字數在480-520字之間，按照指定結構分配字數`

  console.log("📝 發送 AI API 請求，提示詞長度:", prompt.length)
  console.log("🎯 可選品牌數量:", selectedBrands.length)

  try {
    const startTime = Date.now()

    const { generateText } = await import("ai")
    const { google } = await import("@ai-sdk/google")

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: prompt,
      temperature: 0.8, // 增加溫度以提高多樣性
      maxOutputTokens: 3000,
    })
    const endTime = Date.now()

    console.log("📨 AI API 回應已收到")
    console.log("⏱️ 回應時間:", endTime - startTime, "ms")
    console.log("📏 回應長度:", result.text.length, "字符")

    if (!result.text || result.text.trim() === "") {
      throw new Error("AI API 返回空回應")
    }

    let cleanedText = result.text.trim()

    // 清理JSON格式
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "")
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.replace(/\s*```$/, "")
    }

    // 嘗試解析JSON
    try {
      const geminiResponse = JSON.parse(cleanedText)

      if (!geminiResponse.brands || !Array.isArray(geminiResponse.brands)) {
        throw new Error("AI 回應格式無效 - 缺少 brands 數組")
      }

      // 驗證並處理品牌推薦
      const processedBrands = geminiResponse.brands.slice(0, 3).map((brand: any, index: number) => {
        const dbBrand = verifiedBrands.find(
          (b) => b.name.toLowerCase() === brand.name.toLowerCase() || b.name === brand.name,
        )

        // 計算匹配度：第一名 95-98%，第二名 88-92%，第三名 82-86%
        const baseMatch = 98 - (index * 10)
        const randomVariation = Math.floor(Math.random() * 4)
        const matchPercentage = baseMatch - randomVariation

        if (!dbBrand) {
          console.warn(`⚠️ AI推薦了不存在的品牌: ${brand.name}，使用評分最高的備用品牌`)
          const fallbackBrand = selectedBrands[index] || selectedBrands[0]

          return {
            id: fallbackBrand.id,
            name: fallbackBrand.name,
            origin: fallbackBrand.origin,
            style: fallbackBrand.style,
            description: fallbackBrand.description,
            occasions: fallbackBrand.occasions,
            reason: generateIntelligentReason(fallbackBrand, quizAnswers),
            recommendedFragrance: {
              name: getRecommendedFragrance(fallbackBrand, quizAnswers),
              description: "根據您的偏好精心挑選的香水",
            },
            niche: fallbackBrand.niche || false,
            match_percentage: matchPercentage,
          }
        }

        return {
          id: dbBrand.id,
          name: dbBrand.name,
          origin: brand.origin || dbBrand.origin,
          style: brand.style || dbBrand.style,
          description: brand.description || dbBrand.description,
          occasions: brand.occasions || dbBrand.occasions,
          reason: brand.reason || generateIntelligentReason(dbBrand, quizAnswers),
          recommendedFragrance: brand.recommendedFragrance || {
            name: getRecommendedFragrance(dbBrand, quizAnswers),
            description: "品牌代表作品",
          },
          niche: dbBrand.niche || false,
          match_percentage: matchPercentage,
        }
      })

      // 驗證 AI 生成的分析是否符合要求
      let validatedAnalysis = geminiResponse.analysis || ""

      // 檢查分析是否符合要求：
      // 1. 包含「您」字（直接對用戶說話）
      // 2. 長度在480-520字之間
      // 3. 不包含英文詞彙如 "relaxed"
      // 4. 包含專業術語
      const hasPersonalAddress = validatedAnalysis.includes("您")
      const hasProperLength = validatedAnalysis.length >= 480 && validatedAnalysis.length <= 520
      const hasNoEnglish = !validatedAnalysis.match(
        /\b(relaxed|confident|sensual|playful|sexy|sophisticated|adventurous|mysterious|outgoing)\b/,
      )
      const hasProfessionalTerms =
        validatedAnalysis.includes("前調") || validatedAnalysis.includes("中調") || validatedAnalysis.includes("基調")

      console.log("🔍 AI分析驗證:")
      console.log("- 包含「您」:", hasPersonalAddress)
      console.log("- 長度適當:", hasProperLength, `(${validatedAnalysis.length}字)`)
      console.log("- 無英文詞:", hasNoEnglish)
      console.log("- 有專業術語:", hasProfessionalTerms)

      // 如果 AI 分析不符合要求，使用我們的專業分析函數
      if (!hasPersonalAddress || !hasProperLength || !hasNoEnglish || !hasProfessionalTerms) {
        console.log("⚠️ AI分析不符合要求，使用專業分析函數")
        validatedAnalysis = generateProfessionalAnalysis(quizAnswers)
      }

      const finalResult = {
        brands: processedBrands,
        analysis: validatedAnalysis,
      }

      console.log("🎯 AI 推薦處理完成")
      console.log("✅ 最終推薦品牌:", finalResult.brands.map((b: any) => b.name).join(", "))
      console.log("📏 最終分析長度:", finalResult.analysis.length, "字")

      return finalResult
    } catch (parseError: unknown) {
      console.error("❌ JSON 解析錯誤:", parseError)
      const errorMsg = parseError instanceof Error ? parseError.message : String(parseError)
      throw new Error(`AI 回應解析失敗: ${errorMsg}`)
    }
  } catch (apiError: unknown) {
    console.error("❌ AI API 錯誤:", apiError)
    const errorMsg = apiError instanceof Error ? apiError.message : String(apiError)
    throw new Error(`AI 服務調用失敗: ${errorMsg}`)
  }
}

// 改進的品牌篩選函數 - 根據用戶偏好進行更精確的篩選
function filterVerifiedBrandsByPreferences(quizAnswers: any) {
  const { gender, scent, mood, complexity, intensity, character, occasion } = quizAnswers

  console.log("🔍 開始品牌篩選，用戶偏好:", { gender, scent, mood, complexity, intensity, character, occasion })

  // 只使用已驗證的真實品牌
  let allBrands
  if (gender === "neutral") {
    // 中性香水：優先選擇同時適合男女的品牌
    const unisexBrands = getVerifiedBrands().filter((brand) => 
      brand.gender.includes("feminine") && brand.gender.includes("masculine")
    )
    // 如果中性品牌不足，使用所有品牌
    allBrands = unisexBrands.length >= 8 ? unisexBrands : getVerifiedBrands()
    console.log(`🔍 中性香水品牌篩選: 中性品牌 ${unisexBrands.length} 個，使用 ${allBrands.length} 個品牌`)
  } else {
    allBrands = getVerifiedBrands().filter((brand) => brand.gender.includes(gender))
    console.log(`🔍 性別篩選後品牌數: ${allBrands.length}`)
  }

  // 根據用戶偏好進行多層次篩選
  let filtered = allBrands

  // 第一層：香調偏好篩選（最重要）
  if (scent) {
    const scentMatched = allBrands.filter((brand) => brand.scentTypes?.includes(scent))
    if (scentMatched.length >= 8) {
      filtered = scentMatched
      console.log(`🔍 香調篩選後品牌數: ${filtered.length}`)
    }
  }

  // 第二層：情緒氛圍篩選
  if (mood && filtered.length > 12) {
    const moodMatched = filtered.filter((brand) => brand.moodTypes?.includes(mood))
    if (moodMatched.length >= 6) {
      filtered = moodMatched
      console.log(`🔍 情緒氛圍篩選後品牌數: ${filtered.length}`)
    }
  }

  // 第三層：根據複雜度篩選（如果品牌有此屬性）
  if (complexity && filtered.length > 10) {
    // simple: 簡單單一香調的品牌
    // balanced: 和諧調和的品牌
    // complex: 複雜多層次的品牌
    const complexityMatched = filtered.filter((brand: any) => {
      if (!brand.complexity) return true // 如果品牌沒有此屬性，接受所有
      if (complexity === "simple") return brand.complexity === "simple"
      if (complexity === "complex") return brand.complexity === "complex"
      return true // balanced 接受所有
    })
    if (complexityMatched.length >= 5) {
      filtered = complexityMatched
      console.log(`🔍 複雜度篩選後品牌數: ${filtered.length}`)
    }
  }

  // 第四層：根據強度篩選（如果品牌有此屬性）
  if (intensity && filtered.length > 8) {
    // subtle: 輕盈微妙
    // moderate: 適中
    // bold: 濃烈鮮明
    const intensityMatched = filtered.filter((brand: any) => {
      if (!brand.intensity) return true // 如果品牌沒有此屬性，接受所有
      if (intensity === "subtle") return brand.intensity === "subtle"
      if (intensity === "bold") return brand.intensity === "bold"
      return true // moderate 接受所有
    })
    if (intensityMatched.length >= 5) {
      filtered = intensityMatched
      console.log(`🔍 強度篩選後品牌數: ${filtered.length}`)
    }
  }

  // 確保至少有8個品牌供選擇
  if (filtered.length < 8) {
    console.log("🔄 品牌數量不足，使用所有性別匹配的品牌")
    filtered = allBrands
  }

  console.log(`✅ 最終篩選出 ${filtered.length} 個品牌`)

  // 隨機化順序以增加多樣性，但保持一定的偏好權重
  const shuffled = [...filtered].sort((_a, _b) => Math.random() - 0.5)

  return shuffled.slice(0, 20) // 返回最多20個品牌
}

// 改進的品牌評分函數 - 更精確地反映用戶偏好
function calculateDetailedBrandScore(brand: any, quizAnswers: any) {
  let score = 0
  const { gender, scent, mood, complexity, intensity, character, occasion } = quizAnswers

  // 性別匹配檢查（中性香水接受所有品牌）
  if (gender === "neutral") {
    // 中性偏好：如果品牌同時適合男女，額外加分
    if (brand.gender.includes("feminine") && brand.gender.includes("masculine")) {
      score += 10
      console.log(`${brand.name}: 中性品牌 +10`)
    } else {
      score += 5 // 單一性別品牌也可以，但分數較低
    }
  } else {
    // 其他性別：必須匹配
    if (!brand.gender.includes(gender)) return 0
  }

  // 香調匹配 - 最重要的因素 (40分)
  if (brand.scentTypes?.includes(scent)) {
    score += 40
    console.log(`${brand.name}: 香調匹配 +40`)
  }

  // 情緒氛圍匹配 (20分)
  if (brand.moodTypes?.includes(mood)) {
    score += 20
    console.log(`${brand.name}: 情緒匹配 +20`)
  }

  // 複雜度匹配 (15分)
  if (complexity) {
    const brandComplexity = (brand as any).complexity
    if (complexity === "simple" && (!brandComplexity || brandComplexity === "simple")) {
      score += 15
      console.log(`${brand.name}: 複雜度匹配 (簡約) +15`)
    } else if (complexity === "complex" && brandComplexity === "complex") {
      score += 15
      console.log(`${brand.name}: 複雜度匹配 (複雜) +15`)
    } else if (complexity === "balanced") {
      score += 10 // 中性選擇，給予基礎分
      console.log(`${brand.name}: 複雜度匹配 (融合) +10`)
    }
  }

  // 強度匹配 (15分)
  if (intensity) {
    const brandIntensity = (brand as any).intensity
    if (intensity === "subtle" && (!brandIntensity || brandIntensity === "subtle")) {
      score += 15
      console.log(`${brand.name}: 強度匹配 (輕盈) +15`)
    } else if (intensity === "bold" && brandIntensity === "bold") {
      score += 15
      console.log(`${brand.name}: 強度匹配 (濃烈) +15`)
    } else if (intensity === "moderate") {
      score += 10 // 中性選擇，給予基礎分
      console.log(`${brand.name}: 強度匹配 (適中) +10`)
    }
  }

  // 風格特質匹配 (10分)
  if (character) {
    const characterAdjustments: Record<string, string[]> = {
      classic: ["chanel", "dior", "guerlain", "hermes", "ysl"],
      contemporary: ["tomford", "byredo", "lelabo", "maison", "jomalone"],
      modern: ["cdg", "etatlibredorange", "escentric", "imaginaryauthors", "molecule"],
    }
    if (characterAdjustments[character]?.includes(brand.id)) {
      score += 10
      console.log(`${brand.name}: 風格特質匹配 +10`)
    }
  }

  // 小眾品牌加分，但不要過度偏向
  if (brand.niche) {
    score += 3
    console.log(`${brand.name}: 小眾品牌 +3`)
  }

  // 知名品牌適度加分
  const premiumBrands = ["chanel", "dior", "hermes", "tomford", "creed", "guerlain"]
  if (premiumBrands.includes(brand.id)) {
    score += 2
    console.log(`${brand.name}: 知名品牌 +2`)
  }

  // 添加隨機因子以增加多樣性
  const randomFactor = Math.random() * 3
  score += randomFactor

  console.log(`${brand.name} 最終分數: ${score.toFixed(2)}`)
  return score
}

function createIntelligentFallback(quizAnswers: any, brands?: any[]) {
  console.log("🧠 創建智能備用推薦")
  console.log("📋 用戶測驗答案:", quizAnswers)

  // 如果沒有提供品牌，使用性別匹配的所有品牌
  if (!brands || brands.length === 0) {
    brands = getBrandsByGender(quizAnswers.gender || "feminine")
  }

  console.log(`📊 初始品牌數量: ${brands?.length || 0}`)

  // 確保只使用已驗證的品牌
  const verifiedBrands = brands.filter((brand) => brand.verified === true)
  console.log(`✅ 已驗證品牌數量: ${verifiedBrands.length}`)

  if (verifiedBrands.length === 0) {
    console.error("❌ 沒有找到已驗證的品牌！")
    console.log("🔍 品牌庫樣本:", brands.slice(0, 3).map(b => ({ id: b.id, name: b.name, verified: b.verified, gender: b.gender })))
  }

  // 計算品牌分數
  const scoredBrands = verifiedBrands
    .map((brand) => {
      const score = calculateDetailedBrandScore(brand, quizAnswers)
      return {
        ...brand,
        score: score,
      }
    })
    .filter(brand => brand.score > 0) // 只保留有分數的品牌
    .sort((a, b) => b.score - a.score)

  console.log(`🎯 有分數的品牌數量: ${scoredBrands.length}`)
  console.log("🎯 備用推薦品牌評分:")
  scoredBrands.slice(0, 5).forEach((brand, index) => {
    console.log(`${index + 1}. ${brand.name} - 分數: ${brand.score.toFixed(2)}`)
  })

  // 如果沒有品牌有分數，使用前3個驗證品牌
  const topBrands = scoredBrands.length > 0 
    ? scoredBrands.slice(0, 3) 
    : verifiedBrands.slice(0, 3).map(brand => ({ ...brand, score: 50 }))

  console.log(`✅ 最終選中品牌數量: ${topBrands.length}`)
  if (topBrands.length > 0) {
    console.log("✅ 最終選中品牌:", topBrands.map(b => b.name).join(", "))
  }

  // 確保使用正確的分析函數
  const professionalAnalysis = generateProfessionalAnalysis(quizAnswers)
  console.log("🔍 備用推薦分析生成:", professionalAnalysis.substring(0, 50))

  const resultBrands = topBrands.map((brand, index) => {
      // 計算匹配度百分比（根據評分和排名）
      const maxScore = topBrands[0]?.score || 100
      const matchPercentage = Math.round((brand.score / maxScore) * 100)
      // 確保至少有 70% 匹配度，並按排名遞減
      const finalMatch = Math.max(70, Math.min(98, matchPercentage - (index * 3)))
      
      return {
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
        niche: brand.niche || false,
        score: brand.score,
        match_percentage: finalMatch,
      }
    })

  console.log(`🎁 返回 ${resultBrands.length} 個品牌推薦`)
  
  return {
    brands: resultBrands,
    analysis: professionalAnalysis,
  }
}

// 動態生成專業分析，根據新的測驗問題
function generateProfessionalAnalysis(quizAnswers: any) {
  console.log("🔍 生成專業分析，用戶偏好:", quizAnswers)

  const { gender, scent, mood, complexity, intensity, character, occasion } = quizAnswers

  // 性別描述
  const genderText = gender === "feminine" ? "女性" : gender === "masculine" ? "男性" : "中性"
  
  // 情緒描述
  const moodTexts: Record<string, string> = {
    energetic: "充滿活力與朝氣",
    calm: "平靜舒緩、放鬆身心",
  }
  const moodDesc = moodTexts[mood] || ""

  // 場合描述
  const occasionTexts: Record<string, string> = {
    casual: "日常休閒場合",
    formal: "正式或特殊場合",
  }
  const occasionDesc = occasionTexts[occasion] || ""

  // 第一段：香調分析（根據 scent）
  let analysis = ""
  const scentDescriptions: Record<string, string> = {
    fresh: `清新香調以柑橘、水生和綠葉元素為核心，前調通常使用佛手柑、檸檬或葡萄柚，這些成分具有良好的揮發性，能立即帶來明亮清爽的第一印象；中調融入綠葉調、海洋調或薄荷，創造清透而不失層次的香氣；基調則選用淡雅的木質調如雪松或白麝香，確保香氣的持久度而不失清新本質。`,
    floral: `花香調是香水世界中最豐富多樣的香調家族，以玫瑰、茉莉、百合等珍貴花材為核心。前調可能融入柑橘或綠葉元素增添清新感；中調展現花香的靈魂，如保加利亞玫瑰、格拉斯茉莉或依蘭；基調常用麝香、檀香或琥珀來固定花香，創造優雅而持久的香氣層次。`,
    oriental: `東方調以辛香料、琥珀、香草等溫暖元素為特色，是最具異國情調的香調家族。前調使用辛香料如肉桂、荳蔻或黑胡椒建立溫暖的第一印象；中調融入花香或樹脂增加豐富度；基調選用琥珀、檀香、香草或安息香，創造深沉持久而充滿魅力的香氣包圍感。`,
    woody: `木質調以各種珍貴木材精油為核心，展現自然的深度與質感。前調常融入柑橘或綠葉調平衡木質的厚重感；中調可能加入花香或香料增加複雜度，如紫羅蘭葉、鳶尾根；基調則選用雪松、檀香、廣藿香或岩蘭草等優質木材精油，展現木質香調的純淨與深度。`,
  }

  analysis = `根據您的測驗結果，您偏好${scentDescriptions[scent] || "獨特迷人"}的${genderText}香水，希望它能在${occasionDesc}展現${moodDesc}的氛圍。${scentDescriptions[scent]}`

  // 第二段：複雜度與強度分析
  const complexityTexts: Record<string, string> = {
    simple: "您偏好簡約純淨的香氣結構，這類香水通常突出單一或少數幾個香調元素，清晰易懂，非常適合日常佩戴。",
    balanced: "您喜歡融合調和的香氣，這類香水在不同香調之間達到完美平衡，既有層次感又不會過於複雜，是最受歡迎的選擇。",
    complex: "您欣賞複雜多變的香氣層次，這類香水如同交響樂般，隨著時間推移展現不同的香調變化，每次佩戴都能發現新的細節。",
  }

  const intensityTexts: Record<string, string> = {
    subtle: "在香氣強度方面，您偏好輕盈微妙的表現，適合選擇淡香水（EDT）或古龍水（EDC），這類香水濃度較低（5-15%），擴散溫和，營造若隱若現的香氣氛圍。",
    moderate: "您偏好適中的香氣強度，建議選擇淡香精（EDP）或淡香水（EDT），濃度在10-20%之間，能提供明顯但不過分的香氣存在感，適合大多數場合。",
    bold: "您喜歡濃烈鮮明的香氣表現，適合選擇香精（Parfum）或濃香精（EDP），濃度在15-30%，能提供豐富的香氣層次和持久的留香時間，讓您成為焦點。",
  }

  if (complexity) analysis += ` ${complexityTexts[complexity]}`
  if (intensity) analysis += ` ${intensityTexts[intensity]}`

  // 第三段：使用技巧（根據 intensity）
  if (intensity === "bold") {
    analysis += ` 在使用技巧方面，建議採用「點式噴灑法」，在脈搏點如手腕內側、頸部兩側、耳後各噴灑一下即可。避免過度使用，讓香氣隨著體溫自然散發。`
  } else if (intensity === "subtle") {
    analysis += ` 在使用技巧方面，可以嘗試「霧化法」，先在空中噴灑形成香霧，然後走入其中，讓香氣均勻附著。也可以適當增加使用量或在衣物上輕噴，延長香氣的停留時間。`
  } else {
    analysis += ` 在使用技巧方面，建議在脈搏點適量噴灑，或使用「香氣疊加技巧」，先使用同系列的沐浴產品，再搭配香水，創造和諧統一的香氣層次。`
  }

  // 第四段：保存與選購建議
  analysis += ` 香水的保存同樣重要——請將香水置於陰涼處（理想溫度15-20°C），避免陽光直射與溫度劇烈變化。選購時，建議先試用樣品並在肌膚上停留至少30分鐘，因為香水與每個人的肌膚化學反應不同，會展現出獨特的個人香氣。最重要的是選擇那些能真正引起您共鳴的作品。`

  console.log("✅ 最終分析長度:", analysis.length)
  console.log("✅ 分析預覽:", analysis.substring(0, 100))
  return analysis
}

// 修改generateIntelligentReason函數，讓它更有精緻體貼感
function generateIntelligentReason(brand: any, quizAnswers: any) {
  const { gender, scent, mood, complexity, intensity, character, occasion } = quizAnswers

  // 根據品牌特性生成更精緻的推薦理由
  const brandStories = {
    chanel: `香奈兒的創始人可可·香奈兒曾說：「香水是看不見的時尚」。這個品牌的每一款香水都是法式優雅的完美體現，融合了精湛工藝與永恆美學。`,

    dior: `迪奧的香水系列承襲了品牌對細節的極致追求，每一款作品都如同高級訂製服般精心打造，展現出法式浪漫與奢華的完美平衡。`,

    hermes: `愛馬仕的香水系列由傳奇調香師Jean-Claude Ellena等大師精心創作，如同品牌的皮革工藝一般，注重細節、品質與永恆的設計理念。`,

    tomford: `湯姆福特的香水系列大膽而前衛，打破傳統界限，卻又不失優雅。每一款作品都如同一件精心裁剪的西裝，彰顯穿戴者的個性與魅力。`,

    creed: `信仰香水擁有超過250年的皇室調香歷史，其作品採用最珍貴的天然原料，以傳統手工方法製作，成為香水愛好者心中的珍藏。`,

    cdg: `川久保玲的香水系列如同她的服裝設計一樣前衛而富有實驗性，挑戰傳統香水概念，為佩戴者帶來獨特的藝術體驗。`,

    issey: `三宅一生的香水系列體現了日本極簡美學，追求純淨與和諧，如同一件完美剪裁的設計師服裝，簡約而不失細節。`,

    diptyque: `蒂普提克最初是由三位藝術家創立的小眾香氛品牌，每一款作品都有其獨特的靈感來源與故事，如同一幅幅香氣的畫作。`,

    byredo: `拜里朵由典設計師Ben Gorham創立，融合北歐極簡美學與個人記憶，每一款香水都是情感與藝術的表達。`,

    lelabo: `勒拉博堅持小批量手工調製，每一瓶香水都在購買時現場調配，標籤上印有調配日期與購買者姓名，帶來真正個性化的香氣體驗。`,
  }

  // 根據品牌特性選擇開場白
  const brandStoriesTyped: Record<string, string> = brandStories
  let reason = brandStoriesTyped[brand.id] || `${brand.name}是一個充滿獨特魅力的香水品牌，以其${brand.specialty}聞名於世。`

  // 根據香調偏好添加精緻描述
  const scentAppreciation: Record<string, string> = {
    fresh: `品牌對清新香調的詮釋尤為出色，調香師巧妙地運用柑橘與綠葉元素，創造出明亮而不失層次的香氣結構。`,
    floral: `品牌的花香調作品細膩優雅，調香師精選最珍貴的花材，如格拉斯玫瑰、茉莉，創造出既浪漫又精緻的香氣體驗。`,
    oriental: `品牌對東方香調有著深刻理解，調香師精心選用辛香料、琥珀與香草等珍貴原料，層層堆疊出豐富而充滿異國情調的香氣。`,
    woody: `品牌對木質香調的掌握令人讚嘆，調香師從世界各地精選最優質的木材精油，創造出深沉而不失清透的木質基調。`,
  }

  if (brand.scentTypes?.includes(scent) && scentAppreciation[scent]) {
    reason += " " + scentAppreciation[scent]
  }

  // 根據風格特質添加描述
  const characterAppreciation: Record<string, string> = {
    classic: `品牌的作品展現出永恆的經典魅力，調香師尊重傳統調香工藝，同時賦予現代氣息，非常適合追求優雅品味的您。`,
    contemporary: `品牌的作品體現當代時尚美學，在傳統與創新之間取得完美平衡，能夠完美融入您的現代生活方式。`,
    modern: `品牌的作品充滿前衛與創新精神，調香師大膽突破傳統界限，能夠為您帶來獨特而令人驚艷的香氣體驗。`,
  }

  if (character && characterAppreciation[character]) {
    reason += " " + characterAppreciation[character]
  }

  console.log("✅ 最終推薦理由長度:", reason.length)
  console.log("✅ 推薦理由預覽:", reason.substring(0, 100))
  return reason
}
