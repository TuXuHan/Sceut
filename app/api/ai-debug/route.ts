import { NextResponse } from "next/server"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasXaiKey: !!process.env.XAI_API_KEY,
      xaiKeyLength: process.env.XAI_API_KEY?.length || 0,
      xaiKeyPrefix: process.env.XAI_API_KEY?.substring(0, 10) + "..." || "未設置",
    },
    tests: [],
  }

  // 測試1: 檢查環境變數
  diagnostics.tests.push({
    name: "環境變數檢查",
    status: process.env.XAI_API_KEY ? "通過" : "失敗",
    details: process.env.XAI_API_KEY ? "XAI_API_KEY 已設置" : "XAI_API_KEY 未設置",
  })

  // 測試2: 檢查包導入
  try {
    const { generateText } = await import("ai")
    const { xai } = await import("@ai-sdk/xai")
    diagnostics.tests.push({
      name: "包導入檢查",
      status: "通過",
      details: "ai 和 @ai-sdk/xai 包導入成功",
    })

    // 測試3: 嘗試創建模型實例
    try {
      const model = xai("grok-2")
      diagnostics.tests.push({
        name: "模型實例創建",
        status: "通過",
        details: "grok-2 模型實例創建成功",
      })

      // 測試4: 嘗試API調用
      if (process.env.XAI_API_KEY) {
        try {
          const result = await generateText({
            model: model,
            prompt: "請回答：測試成功",
            temperature: 0.1,
            maxTokens: 10,
          })

          diagnostics.tests.push({
            name: "API調用測試",
            status: "通過",
            details: `API調用成功，回應: ${result.text}`,
          })
        } catch (apiError) {
          diagnostics.tests.push({
            name: "API調用測試",
            status: "失敗",
            details: `API調用失敗: ${apiError.message}`,
            error: {
              name: apiError.name,
              message: apiError.message,
              stack: apiError.stack?.split("\n").slice(0, 5),
            },
          })
        }
      } else {
        diagnostics.tests.push({
          name: "API調用測試",
          status: "跳過",
          details: "無API密鑰，跳過測試",
        })
      }
    } catch (modelError) {
      diagnostics.tests.push({
        name: "模型實例創建",
        status: "失敗",
        details: `模型創建失敗: ${modelError.message}`,
      })
    }
  } catch (importError) {
    diagnostics.tests.push({
      name: "包導入檢查",
      status: "失敗",
      details: `包導入失敗: ${importError.message}`,
    })
  }

  // 測試5: 網絡連接測試
  try {
    const response = await fetch("https://api.x.ai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    diagnostics.tests.push({
      name: "XAI API連接測試",
      status: response.ok ? "通過" : "失敗",
      details: `HTTP狀態: ${response.status}, 狀態文本: ${response.statusText}`,
    })
  } catch (networkError) {
    diagnostics.tests.push({
      name: "XAI API連接測試",
      status: "失敗",
      details: `網絡錯誤: ${networkError.message}`,
    })
  }

  return NextResponse.json(diagnostics)
}
