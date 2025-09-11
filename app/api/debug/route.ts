import { NextResponse } from "next/server"
import { testGeminiConnection } from "@/lib/ai-recommendations-gemini"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasGeminiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      geminiKeyLength: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0,
      geminiKeyPrefix: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 15) + "..." || "未設置",
    },
    tests: [],
  }

  // 測試1: 檢查環境變數
  diagnostics.tests.push({
    name: "Gemini環境變數檢查",
    status: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "通過" : "失敗",
    details: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "AI 服務密鑰已設置" : "GOOGLE_GENERATIVE_AI_API_KEY 未設置",
  })

  // 測試2: 檢查包導入
  try {
    const { generateText } = await import("ai")
    const { google } = await import("@ai-sdk/google")
    diagnostics.tests.push({
      name: "Gemini包導入檢查",
      status: "通過",
      details: "ai 和 @ai-sdk/google 包導入成功",
    })

    // 測試3: 嘗試創建模型實例
    try {
      const model = google("gemini-1.5-flash")
      diagnostics.tests.push({
        name: "Gemini模型實例創建",
        status: "通過",
        details: "gemini-1.5-flash 模型實例創建成功",
      })

      // 測試4: 嘗試API調用
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        try {
          const testResult = await testGeminiConnection()

          diagnostics.tests.push({
            name: "Gemini API調用測試",
            status: testResult.success ? "通過" : "失敗",
            details: testResult.success
              ? `API調用成功，回應: ${testResult.response}`
              : `API調用失敗: ${testResult.error}`,
          })
        } catch (apiError) {
          const errorMessage = apiError instanceof Error ? apiError.message : "未知錯誤"

          diagnostics.tests.push({
            name: "Gemini API調用測試",
            status: "失敗",
            details: `API調用失敗: ${errorMessage}`,
            error: {
              name: apiError instanceof Error ? apiError.name : "Error",
              message: errorMessage,
              stack: apiError instanceof Error ? apiError.stack?.split("\n").slice(0, 5) : [],
            },
          })
        }
      } else {
        diagnostics.tests.push({
          name: "Gemini API調用測試",
          status: "跳過",
          details: "無API密鑰，跳過測試",
        })
      }
    } catch (modelError) {
      diagnostics.tests.push({
        name: "Gemini模型實例創建",
        status: "失敗",
        details: `模型創建失敗: ${modelError.message}`,
      })
    }
  } catch (importError) {
    diagnostics.tests.push({
      name: "Gemini包導入檢查",
      status: "失敗",
      details: `包導入失敗: ${importError.message}`,
    })
  }

  // 測試5: 網絡連接測試
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      method: "GET",
      headers: {
        "x-goog-api-key": process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
      },
    })

    diagnostics.tests.push({
      name: "Gemini API連接測試",
      status: response.ok ? "通過" : "失敗",
      details: `HTTP狀態: ${response.status}, 狀態文本: ${response.statusText}`,
    })
  } catch (networkError) {
    diagnostics.tests.push({
      name: "Gemini API連接測試",
      status: "失敗",
      details: `網絡錯誤: ${networkError.message}`,
    })
  }

  return NextResponse.json(diagnostics)
}
