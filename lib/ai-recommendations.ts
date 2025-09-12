"use server"

import { COMPREHENSIVE_BRAND_DATABASE } from "./brand-database"

// 添加一個測試函數，用於驗證API是否正常工作

// 在文件底部添加以下代碼：
// 測試函數，用於驗證API連接
export async function testAIConnection() {
  try {
    const { generateText } = await import("ai")
    const { xai } = await import("@ai-sdk/xai")

    const result = await generateText({
      model: xai("grok-2"),
      prompt: 'Hello, please respond with a simple JSON: {"test": "success"}',
      temperature: 0.1,
      maxTokens: 50,
    })

    console.log("Test API response:", result.text)
    return {
      success: true,
      response: result.text,
    }
  } catch (error) {
    console.error("Test API error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// 修改getAIRecommendations函數開頭，添加API測試
export async function getAIRecommendations(quizAnswers: any) {
  console.log("Starting AI recommendations for:", quizAnswers)

  // 測試API連接
  try {
    console.log("Testing API connection...")
    const testResult = await testAIConnection()
    console.log("API test result:", testResult)

    if (!testResult.success) {
      console.error("API test failed, using fallback")
      throw new Error(`API test failed: ${testResult.error}`)
    }
  } catch (testError) {
    console.error("API test error:", testError)
    // 繼續執行，使用fallback機制
  }

  // 確保總是返回有效的推薦結果
  try {
    // 第一步：從數據庫中篩選合適的品牌
    const suitableBrands = filterBrandsByPreferences(quizAnswers)
    console.log("Filtered brands count:", suitableBrands.length)

    if (suitableBrands.length === 0) {
      console.log("No suitable brands found, using all brands for gender")
      const allBrands = COMPREHENSIVE_BRAND_DATABASE.filter((brand) =>
        brand.gender.includes(quizAnswers.gender || "feminine"),
      )
      return createFallbackRecommendations(quizAnswers, allBrands.slice(0, 3))
    }

    // 第二步：嘗試使用AI生成個性化推薦
    try {
      const aiRecommendations = await generatePersonalizedRecommendations(quizAnswers, suitableBrands)
      console.log("AI recommendations generated successfully")
      return aiRecommendations
    } catch (aiError) {
      console.error("AI generation failed, using fallback:", aiError)
      return createFallbackRecommendations(quizAnswers, suitableBrands.slice(0, 3))
    }
  } catch (error) {
    console.error("Error in recommendation process:", error)
    // 最終備用方案
    const defaultBrands = getDefaultBrands(quizAnswers.gender || "feminine")
    return createFallbackRecommendations(quizAnswers, defaultBrands)
  }
}

function filterBrandsByPreferences(quizAnswers: any) {
  const { gender, scent, mood, vibe } = quizAnswers

  console.log("Filtering with preferences:", { gender, scent, mood, vibe })

  // 根據偏好篩選品牌
  let filteredBrands = COMPREHENSIVE_BRAND_DATABASE.filter((brand) => {
    // 性別匹配 - 必須條件
    if (!brand.gender.includes(gender)) return false

    // 香調匹配 - 如果有偏好則必須匹配
    if (scent && brand.scentTypes && brand.scentTypes.length > 0) {
      if (!brand.scentTypes.includes(scent)) return false
    }

    // 氣氛匹配 - 如果有偏好則必須匹配
    if (mood && brand.moodTypes && brand.moodTypes.length > 0) {
      if (!brand.moodTypes.includes(mood)) return false
    }

    // 氣質匹配 - 如果有偏好則必須匹配
    if (vibe && brand.vibeTypes && brand.vibeTypes.length > 0) {
      if (!brand.vibeTypes.includes(vibe)) return false
    }

    return true
  })

  console.log("After strict filtering:", filteredBrands.length)

  // 如果篩選結果太少，放寬條件
  if (filteredBrands.length < 5) {
    console.log("Too few results, relaxing criteria")
    filteredBrands = COMPREHENSIVE_BRAND_DATABASE.filter((brand) => {
      // 只要求性別匹配
      if (!brand.gender.includes(gender)) return false

      // 至少匹配一個其他條件
      const scentMatch = !scent || !brand.scentTypes || brand.scentTypes.includes(scent)
      const moodMatch = !mood || !brand.moodTypes || brand.moodTypes.includes(mood)
      const vibeMatch = !vibe || !brand.vibeTypes || brand.vibeTypes.includes(vibe)

      return scentMatch || moodMatch || vibeMatch
    })
  }

  console.log("After relaxed filtering:", filteredBrands.length)

  // 如果還是太少，只按性別篩選
  if (filteredBrands.length < 3) {
    console.log("Still too few, using gender only")
    filteredBrands = COMPREHENSIVE_BRAND_DATABASE.filter((brand) => brand.gender.includes(gender))
  }

  console.log("Final filtered brands:", filteredBrands.length)

  // 隨機打亂並選擇15個品牌供AI選擇
  return filteredBrands.sort(() => Math.random() - 0.5).slice(0, 15)
}

function getDefaultBrands(gender: string) {
  // 預設的可靠品牌選擇
  const defaultFeminineBrands = [
    COMPREHENSIVE_BRAND_DATABASE.find((b) => b.id === "chanel"),
    COMPREHENSIVE_BRAND_DATABASE.find((b) => b.id === "dior"),
    COMPREHENSIVE_BRAND_DATABASE.find((b) => b.id === "kenzo"),
  ].filter(Boolean)

  const defaultMasculineBrands = [
    COMPREHENSIVE_BRAND_DATABASE.find((b) => b.id === "tomford"),
    COMPREHENSIVE_BRAND_DATABASE.find((b) => b.id === "creed"),
    COMPREHENSIVE_BRAND_DATABASE.find((b) => b.id === "cdg"),
  ].filter(Boolean)

  return gender === "feminine" ? defaultFeminineBrands : defaultMasculineBrands
}

async function generatePersonalizedRecommendations(quizAnswers: any, brands: any[]) {
  const brandList = brands.map((b) => `${b.name} (${b.origin}) - ${b.specialty}`).join("\n")

  const prompt = `
你是一位專業的調香師和香水顧問。請根據用戶的測驗結果，從以下品牌中選擇3個最適合的品牌，並為每個品牌：
1. 生成個性化的推薦理由（不可只說"與偏好相符"）
2. 推薦一款該品牌真實存在的香水產品
3. 提供專業的香調分析和建議

用戶測驗結果：
- 性別偏好: ${quizAnswers.gender === "feminine" ? "女性香水" : "男性香水"}
- 香調偏好: ${quizAnswers.scent === "warm" ? "溫暖香調" : quizAnswers.scent === "fresh" ? "清新香調" : "木質香調"}
- 氣氛偏好: ${quizAnswers.mood === "sophisticated" ? "精緻複雜" : quizAnswers.mood === "playful" ? "輕鬆活潑" : quizAnswers.mood === "classic" ? "經典優雅" : "現代前衛"}
- 氣質偏好: ${quizAnswers.vibe === "bold" ? "大膽鮮明" : quizAnswers.vibe === "soft" ? "柔和細膩" : quizAnswers.vibe === "intense" ? "強烈深沉" : "含蓄低調"}
- 感受偏好: ${quizAnswers.feel}

可選品牌：
${brandList}

請返回JSON格式：
{
  "analysis": "專業調香師的香調分析和建議（避免中英混雜，提供專業建議而非複誦用戶偏好，包含香調搭配原理、層次結構、持香建議等專業內容）",
  "brands": [
    {
      "name": "品牌名稱",
      "origin": "品牌產地",
      "style": "品牌風格",
      "description": "品牌描述",
      "occasions": "適合場合",
      "reason": "詳細的個性化推薦理由（至少50字，說明為什麼這個品牌適合用戶的具體偏好）",
      "recommendedFragrance": {
        "name": "真實存在的香水名稱",
        "description": "香水的詳細描述和香調特徵"
      }
    }
  ]
}
`

  console.log("Calling XAI API with prompt length:", prompt.length)
  try {
    const { generateText } = await import("ai")
    const { xai } = await import("@ai-sdk/xai")

    const result = await generateText({
      model: xai("grok-2"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2500,
    })

    console.log("XAI API response received, length:", result.text.length)
    console.log("Response preview:", result.text.substring(0, 100))

    // 檢查回應是否為空
    if (!result.text || result.text.trim() === "") {
      throw new Error("Empty response from XAI API")
    }

    let cleanedText = result.text.trim()

    // 清理回應格式
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "")
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.replace(/\s*```$/, "")
    }

    // 嘗試解析JSON前先記錄
    console.log("Attempting to parse JSON response")
    try {
      const aiResponse = JSON.parse(cleanedText)
      console.log("AI response parsed successfully, has analysis:", !!aiResponse.analysis)
      console.log("Brands count:", aiResponse.brands?.length || 0)

      if (!aiResponse.brands || !Array.isArray(aiResponse.brands)) {
        throw new Error("Invalid AI response format - no brands array")
      }

      // 處理AI回應，確保格式正確
      const processedBrands = aiResponse.brands.slice(0, 3).map((brand, index) => {
        // 從數據庫中找到對應品牌的完整信息
        const dbBrand = brands.find((b) => b.name === brand.name) || brands[index]

        return {
          id: dbBrand?.id || `ai-brand-${index}`,
          name: brand.name || dbBrand?.name || "推薦品牌",
          origin: brand.origin || dbBrand?.origin || "國際",
          style: brand.style || dbBrand?.style || "獨特風格",
          description: brand.description || dbBrand?.description || "專業調香師精心調配",
          occasions: brand.occasions || dbBrand?.occasions || "多種場合適用",
          reason: brand.reason || "根據您的偏好特別推薦",
          recommendedFragrance: brand.recommendedFragrance || {
            name: "經典香水",
            description: "品牌代表作品",
          },
        }
      })

      const finalResult = {
        brands: processedBrands,
        analysis: aiResponse.analysis || generateProfessionalAnalysis(quizAnswers),
      }

      console.log("Final AI result prepared with", finalResult.brands.length, "brands")
      return finalResult
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Raw response:", cleanedText)
      throw new Error(`Failed to parse AI response: ${parseError.message}`)
    }
  } catch (apiError) {
    console.error("XAI API error:", apiError)
    throw new Error(`XAI API error: ${apiError.message}`)
  }
}

function createFallbackRecommendations(quizAnswers: any, selectedBrands: any[]) {
  console.log("Creating fallback recommendations with", selectedBrands.length, "brands")

  if (!selectedBrands || selectedBrands.length === 0) {
    console.error("No brands provided for fallback")
    selectedBrands = getDefaultBrands(quizAnswers.gender || "feminine")
  }

  const analysis = generateProfessionalAnalysis(quizAnswers)
  console.log("Fallback analysis generated:", !!analysis)

  const result = {
    brands: selectedBrands.slice(0, 3).map((brand, index) => ({
      id: brand.id || `fallback-brand-${index}`,
      name: brand.name || "推薦品牌",
      origin: brand.origin || "國際",
      style: brand.style || "獨特風格",
      description: brand.description || "專業調香師精心調配的香水品牌",
      occasions: brand.occasions || "多種場合適用",
      reason: generatePersonalizedReason(brand, quizAnswers),
      recommendedFragrance: {
        name: getRecommendedFragrance(brand, quizAnswers),
        description: "品牌的經典代表作品，體現品牌精髓和調香工藝",
      },
    })),
    analysis: analysis,
  }

  console.log("Fallback result prepared with", result.brands.length, "brands")
  return result
}

function generatePersonalizedReason(brand: any, quizAnswers: any) {
  const { scent, mood, vibe, feel } = quizAnswers

  let reason = `${brand.name}是`

  if (brand.origin === "日本") {
    reason += "來自日本的精緻品牌，"
  } else if (brand.origin === "法國") {
    reason += "來自法國的經典品牌，"
  } else {
    reason += "國際知名的香水品牌，"
  }

  if (scent === "fresh") {
    reason += "擅長創造清新自然的香調，"
  } else if (scent === "warm") {
    reason += "以溫暖包圍的香調聞名，"
  } else if (scent === "woody") {
    reason += "專精於木質香調的調配，"
  }

  if (mood === "sophisticated") {
    reason += "能夠滿足您對精緻複雜香氣的追求。"
  } else if (mood === "playful") {
    reason += "完美契合您輕鬆活潑的個性。"
  } else if (mood === "classic") {
    reason += "體現您對經典優雅的品味偏好。"
  } else {
    reason += "展現現代前衛的香氣美學。"
  }

  reason += `品牌的${brand.specialty || "獨特工藝"}與您的香氣偏好完美匹配，能夠為您帶來理想的嗅覺體驗。`

  return reason
}

function getRecommendedFragrance(brand: any, quizAnswers: any) {
  // 根據品牌和用戶偏好推薦具體香水
  const fragranceMap = {
    chanel: quizAnswers.gender === "feminine" ? "Coco Mademoiselle" : "Bleu de Chanel",
    dior: quizAnswers.gender === "feminine" ? "Miss Dior" : "Sauvage",
    kenzo: "Flower",
    tomford: "Oud Wood",
    creed: "Aventus",
    cdg: "Hinoki",
    issey: "L'Eau d'Issey",
    diptyque: "Philosykos",
    hermes: "Terre d'Hermès",
    byredo: "Gypsy Water",
  }

  return fragranceMap[brand.id] || "經典系列"
}

function generateProfessionalAnalysis(quizAnswers: any) {
  console.log("Generating professional analysis for:", quizAnswers)

  if (!quizAnswers) {
    return "根據香調偏好分析，建議選擇具有良好層次結構的香水作品。注意香調的演變過程，從前調到基調應有清晰的轉換。使用時建議適量噴灑在脈搏點，讓體溫幫助香氣自然散發。"
  }

  const scent = quizAnswers.scent || "fresh"
  const mood = quizAnswers.mood || "sophisticated"
  const vibe = quizAnswers.vibe || "soft"

  let analysis = ""

  // 基於香調類型的專業分析
  if (scent === "fresh") {
    analysis +=
      "清新香調的結構特點在於前調的明亮度和中調的平衡感。典型的清新香調以柑橘類精油作為前調，如檸檬、佛手柑或葡萄柚，這些成分具有良好的揮發性，能夠在噴灑後立即展現活力感。"

    if (mood === "sophisticated") {
      analysis +=
        "精緻的清新香調會在中調加入綠葉調或海洋調，如紫羅蘭葉、薄荷或海藻萃取，創造層次感。基調通常選用淡雅的木質調如雪松或白麝香，確保香氣的持久度而不失清新本質。"
    } else if (mood === "playful") {
      analysis +=
        "活潑的清新香調強調果香元素，中調可能包含蘋果、梨子或水蜜桃，這些成分能夠增加甜美感和親和力。基調保持輕盈，避免厚重的樹脂或動物性香料。"
    }
  } else if (scent === "warm") {
    analysis +=
      "溫暖香調的核心在於創造包圍感和舒適度。這類香調通常採用東方香調的結構，前調可能使用辛香料如肉桂、丁香或黑胡椒來建立溫暖的第一印象。"

    if (mood === "sophisticated") {
      analysis +=
        "精緻的溫暖香調在中調融入珍貴花香如玫瑰、茉莉或依蘭，這些花香與辛香料形成複雜的對比。基調則使用琥珀、檀香、香草或安息香等樹脂類香料，創造深度和持久度。"
    } else if (mood === "classic") {
      analysis +=
        "經典的溫暖香調遵循傳統東方香調的配方原則，注重香料的品質和比例。中調可能包含傳統的東方花香，基調使用沉香、廣藿香等珍貴原料。"
    }
  } else if (scent === "woody") {
    analysis +=
      "木質香調以各種木材精油為主體，展現自然純淨的特質。不同木材具有不同的香氣特徵：雪松帶來清新感，檀香提供奶香質感，廣藿香增加泥土氣息。"

    if (mood === "sophisticated") {
      analysis +=
        "精緻的木質香調會混合多種木材，創造複雜的層次。可能加入香根草、岩蘭草等根部香料增加深度，或使用乳香、沒藥等樹脂平衡木質的乾燥感。"
    }
  }

  // 基於氣質的使用建議
  if (vibe === "bold" || vibe === "intense") {
    analysis +=
      " 考慮到您偏好強烈的香氣表現，建議選擇濃度較高的香水類型（Eau de Parfum或Parfum），並採用節制的使用方式。在脈搏點輕輕一噴即可，讓香氣隨著體溫緩慢釋放。"
  } else if (vibe === "soft" || vibe === "subtle") {
    analysis +=
      " 您偏好柔和的香氣表現，建議選擇淡香水（Eau de Toilette）或古龍水（Eau de Cologne），可以適當增加使用量。這類香水的擴散性較溫和，適合營造親切的氛圍。"
  }

  // 專業使用技巧和保存建議
  analysis +=
    " 在使用技巧方面，建議將香水噴灑在體溫較高的部位如手腕內側、頸部兩側和耳後，這些位置有助於香氣的自然散發。避免摩擦噴灑部位，以免破壞香氣分子的結構。香水應存放在陰涼乾燥處，避免陽光直射和溫度變化，以保持香氣的穩定性和品質。"

  console.log("Generated analysis length:", analysis.length)
  return analysis
}
