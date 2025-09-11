import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json()
    const supabase = createClient() // server-side supabase client

    // 用 access_token 驗證 user
    const { data: { user }, error } = await supabase.auth.getUser(access_token)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }

    // 這裡可以用 cookie 或 session 庫建立 server session
    // 例如：
    // res.setHeader('Set-Cookie', serialize('user', JSON.stringify(user), { path: '/' }))

    return NextResponse.json({ success: true, user })
  } catch (err) {
    console.error("Error in /api/auth/session:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
