import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()

    // 獲取當前用戶
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "未授權" }, { status: 401 })
    }

    // 刪除用戶相關的所有資料
    const userId = user.id

    try {
      // 刪除 user_profiles
      await supabase.from("user_profiles").delete().eq("id", userId)

      // 刪除 subscribers
      await supabase.from("subscribers").delete().eq("user_id", userId)

      // 刪除其他相關表的資料
      try {
        await supabase.from("payments").delete().eq("user_id", userId)
      } catch (error) {
        console.log("No payments table or no records to delete")
      }

      // 最後登出用戶
      await supabase.auth.signOut()

      return NextResponse.json({ success: true })
    } catch (deleteError) {
      console.error("刪除用戶資料失敗:", deleteError)
      return NextResponse.json({ success: false, error: "刪除失敗" }, { status: 500 })
    }
  } catch (error) {
    console.error("API 錯誤:", error)
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 })
  }
}
