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

    // 準備更新數據
    const updateData: any = {
      id: user.id,
      updated_at: new Date().toISOString(),
    }

    // 只添加提供的欄位
    if (profileData.full_name !== undefined) {
      updateData.full_name = profileData.full_name
      updateData.name = profileData.full_name // 同時更新 name 欄位
    }
    if (profileData.phone !== undefined) updateData.phone = profileData.phone
    if (profileData.address !== undefined) updateData.address = profileData.address
    if (profileData.city !== undefined) updateData.city = profileData.city
    if (profileData.postal_code !== undefined) updateData.postal_code = profileData.postal_code
    if (profileData.country !== undefined) updateData.country = profileData.country
    if (profileData["711"] !== undefined) updateData["711"] = profileData["711"]
    if (profileData.quiz_answers !== undefined) updateData.quiz_answers = profileData.quiz_answers
    if (profileData.delivery_method !== undefined) updateData.delivery_method = profileData.delivery_method

    // 更新用戶資料
    const { error: updateError } = await supabase.from("user_profiles").upsert(
      updateData,
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
