import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 使用服務角色來繞過 RLS
const supabaseAdmin = createClient("https://bbrnbyzjmxgxnczzymdt.supabase.co", process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { id, name, email } = await request.json()

    if (!id || !email) {
      return NextResponse.json({ error: "缺少必要參數" }, { status: 400 })
    }

    console.log("創建用戶資料:", { id, name, email })

    // 使用服務角色插入資料，繞過 RLS
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .upsert(
        {
          id,
          name: name || email.split("@")[0],
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .select()

    if (error) {
      console.error("創建用戶資料時發生錯誤:", error)
      return NextResponse.json({ error: "創建用戶資料失敗", details: error.message }, { status: 500 })
    }

    console.log("用戶資料創建成功:", data)

    return NextResponse.json({
      success: true,
      data: data?.[0] || null,
    })
  } catch (error) {
    console.error("API 錯誤:", error)
    return NextResponse.json({ error: "服務器錯誤" }, { status: 500 })
  }
}
