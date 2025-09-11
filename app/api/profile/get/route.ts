import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 檢查用戶是否已登入
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "未授權的請求" }, { status: 401 })
    }

    // 獲取用戶資料
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("獲取用戶資料失敗:", profileError)
      return NextResponse.json({ success: false, error: "獲取用戶資料失敗" }, { status: 500 })
    }

    // 如果沒有資料，返回預設值
    if (!profile) {
      const defaultProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        country: "台灣",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        profile: defaultProfile,
      })
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: user.email, // 確保 email 來自 auth
      },
    })
  } catch (error) {
    console.error("API 錯誤:", error)
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 })
  }
}
