import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const periodNo = searchParams.get("periodNo")

    if (!periodNo) {
      return NextResponse.json({ error: "Missing periodNo parameter" }, { status: 400 })
    }

    // 查询数据库
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .select("*")
      .eq("period_no", periodNo)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录
        return NextResponse.json({
          exists: false,
          message: "未找到记录"
        })
      }
      
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Database query failed", details: error }, { status: 500 })
    }

    return NextResponse.json({
      exists: true,
      subscription: data,
      message: "找到订阅记录"
    })
  } catch (error) {
    console.error("Error verifying subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

