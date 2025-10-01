import { NextRequest, NextResponse } from "next/server"
import { getGeminiRecommendations } from "@/lib/ai-recommendations-gemini"

export async function POST(request: NextRequest) {
  try {
    const quizAnswers = await request.json()
    
    console.log("📥 收到推薦請求:", quizAnswers)
    
    // 調用 Gemini AI 推薦服務
    const result = await getGeminiRecommendations(quizAnswers)
    
    console.log("✅ 推薦生成成功")
    console.log("📊 完整的 AI 結果:", result)
    console.log("📊 推薦結果格式:", {
      hasBrands: !!result.brands,
      brandsCount: result.brands?.length,
      hasAnalysis: !!result.analysis,
      brands: result.brands
    })
    
    // 檢查 brands 是否存在
    let recommendations = []
    
    if (!result.brands || !Array.isArray(result.brands) || result.brands.length === 0) {
      console.error("❌ AI 沒有返回品牌推薦，使用備用推薦")
      console.log("📝 AI 結果:", result)
      
      // 使用備用推薦
      recommendations = [
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
    } else {
      // 轉換格式：將 brands 轉換為前端期望的 recommendations 格式
      recommendations = result.brands.map((brand: any) => ({
        id: brand.id || brand.name,
        name: brand.name,
        brand: brand.name,
        description: brand.reason || brand.description || "",
        notes: brand.notes || { top: [], middle: [], base: [] },
        personality: brand.personality || [],
        image: brand.image || "/images/perfume-default.png",
        price: brand.price || 0,
        rating: brand.rating || 0,
        match_percentage: brand.match_percentage || 85,
      }))
    }
    
    console.log("🎯 轉換後的推薦數量:", recommendations.length)
    console.log("🎯 轉換後的推薦:", recommendations)
    
    return NextResponse.json({
      success: true,
      recommendations,
      analysis: result.analysis // 也返回分析文字
    })
  } catch (error) {
    console.error("❌ 推薦生成失敗:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "推薦生成失敗"
      },
      { status: 500 }
    )
  }
}
