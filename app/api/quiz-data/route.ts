import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/*
 * GET /api/quiz-data?userId=<UUID>
 * Returns the user's quiz data (or null).
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    /* ── ❶ 讀取資料: 以 id 做條件，只查詢存在的欄位 ── */
    const { data, error } = await supabase
      .from("user_profiles")
      .select(`
        id,
        quiz_answers,
        preferences,
        created_at,
        updated_at
      `)
      .eq("id", userId) // ← 改用 id 篩選
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("[quiz-data] supabase error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 轉換格式以符合前端期望
    const formattedData = data
      ? {
          id: data.id,
          user_id: data.id, // 使用 id 作為 user_id
          quiz_completed: data.quiz_answers ? true : false, // 根據是否有答案判斷是否完成
          quiz_results: data.quiz_answers || {},
          preferences: data.preferences || {},
          created_at: data.created_at,
          updated_at: data.updated_at,
        }
      : null

    return NextResponse.json({ quizData: formattedData })
  } catch (err) {
    console.error("[quiz-data] unexpected error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

/* ───────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // 取得目前登入使用者
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "用戶未登入" }, { status: 401 })
    }

    /* 檢查是否已有 profile (以 id 為 PK) */
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", user.id) // ← 改用 id
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("查詢用戶資料失敗:", fetchError)
      return NextResponse.json({ error: "查詢用戶資料失敗" }, { status: 500 })
    }

    let result
    if (existingProfile) {
      // 更新
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          quiz_answers: body.quiz_results || body.quiz_answers,
          preferences: body.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id) // ← 改用 id
        .select(`
          id,
          quiz_answers,
          preferences,
          created_at,
          updated_at
        `)
        .single()

      result = { data, error }
    } else {
      // 新增
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id, // ← 將 auth UID 寫入 id 主鍵
          quiz_answers: body.quiz_results || body.quiz_answers,
          preferences: body.preferences,
        })
        .select(`
          id,
          quiz_answers,
          preferences,
          created_at,
          updated_at
        `)
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error("保存問卷資料失敗:", result.error)
      return NextResponse.json({ error: "保存問卷資料失敗" }, { status: 500 })
    }

    // 轉換格式以符合前端期望
    const formattedData = {
      id: result.data.id,
      user_id: result.data.id,
      quiz_completed: result.data.quiz_answers ? true : false,
      quiz_results: result.data.quiz_answers,
      preferences: result.data.preferences,
      created_at: result.data.created_at,
      updated_at: result.data.updated_at,
    }

    return NextResponse.json({ quizData: formattedData })
  } catch (error) {
    console.error("[quiz-data] API error:", error)
    return NextResponse.json({ error: "服務器錯誤" }, { status: 500 })
  }
}
