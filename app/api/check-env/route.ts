import { NextResponse } from "next/server"

export async function GET() {
  const envCheck = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL_VALUE: process.env.SUPABASE_URL ? 
      process.env.SUPABASE_URL.substring(0, 30) + "..." : 
      "未設置",
    SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
  }

  return NextResponse.json({
    message: "環境變數檢查",
    env: envCheck,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('SUPABASE') || key.includes('DATABASE')
    ),
  })
}
