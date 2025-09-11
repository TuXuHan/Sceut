import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // 如果客戶端已經存在，直接返回（單例模式）
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bbrnbyzjmxgxnczzymdt.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y"

  console.log("=== Supabase 客戶端初始化調試 ===")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "已設定" : "❌ 未設定")
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "已設定" : "❌ 未設定")

  if (supabaseUrl) {
    console.log("Supabase URL:", supabaseUrl.substring(0, 30) + "...")
  }
  if (supabaseAnonKey) {
    console.log("Supabase Key 前綴:", supabaseAnonKey.substring(0, 20) + "...")
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase 環境變數未設定")
    console.error("請確保在 .env.local 文件中設定以下變數:")
    console.error("NEXT_PUBLIC_SUPABASE_URL=your_supabase_url")
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key")

    // 創建一個無效的客戶端，但不會崩潰
    supabaseClient = createBrowserClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder-key",
    )

    console.error("⚠️ 使用預設值創建客戶端，功能將無法正常運作")
    return supabaseClient
  }

  try {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce", // 使用 PKCE 流程
        debug: process.env.NODE_ENV === "development", // 只在開發環境啟用調試
      },
      global: {
        headers: {
          "X-Client-Info": "perfume-subscription-app",
        },
      },
    })

    console.log("✅ Supabase 客戶端初始化成功")

    // 只在開發環境添加詳細的事件監聽器
    if (process.env.NODE_ENV === "development") {
      supabaseClient.auth.onAuthStateChange((event: any, session: any) => {
        console.log(`🔄 認證狀態變化: ${event}`)
        if (session?.user) {
          console.log(`👤 用戶: ${session.user.email}`)
          console.log(`📧 郵箱已驗證: ${session.user.email_confirmed_at ? "是" : "否"}`)
        } else {
          console.log("👤 用戶: 未登入")
        }
      })
    }

    return supabaseClient
  } catch (error) {
    console.error("❌ 創建 Supabase 客戶端時發生錯誤:", error)

    // 即使發生錯誤也要返回一個客戶端
    supabaseClient = createBrowserClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder-key",
    )

    return supabaseClient
  }
}

// 重置客戶端（用於測試或重新初始化）
export function resetClient() {
  supabaseClient = null
  console.log("🔄 Supabase 客戶端已重置")
}
