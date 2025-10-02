import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    console.log("开始清除测试数据...")

    // 删除所有 period_no 以 TEST_ 开头的记录
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .delete()
      .like("period_no", "TEST_%")
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to cleanup test data", details: error }, { status: 500 })
    }

    console.log(`已删除 ${data?.length || 0} 条测试记录`)

    return NextResponse.json({
      success: true,
      deleted_count: data?.length || 0,
      message: `成功删除 ${data?.length || 0} 条测试记录`
    })
  } catch (error) {
    console.error("Error cleaning up test data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
