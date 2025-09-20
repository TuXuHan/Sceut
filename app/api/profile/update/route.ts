import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 獲取當前用戶
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "未授權" }, { status: 401 })
    }

    // 獲取請求資料
    const profileData = await request.json()

    // 更新用戶資料
    const { error: updateError } = await supabase.from("user_profiles").upsert(
      {
        id: user.id,
        full_name: profileData.full_name,
        name: profileData.full_name, // 同時更新 name 欄位
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postal_code,
        country: profileData.country,
        "711": profileData["711"],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (updateError) {
      console.error("更新用戶資料失敗:", updateError)
      return NextResponse.json({ success: false, error: "更新失敗" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API 錯誤:", error)
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 })
  }
}
