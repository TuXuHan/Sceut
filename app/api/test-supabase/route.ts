import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const results = {
    envCheck: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url_preview: process.env.SUPABASE_URL?.substring(0, 30) + "...",
      key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      key_starts_with: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10),
    },
    tests: {} as any
  }

  // Test 1: 檢查 URL 格式
  if (process.env.SUPABASE_URL) {
    try {
      new URL(process.env.SUPABASE_URL)
      results.tests.urlFormat = { success: true, message: "URL 格式正確" }
    } catch (error) {
      results.tests.urlFormat = { success: false, message: "URL 格式錯誤" }
    }
  } else {
    results.tests.urlFormat = { success: false, message: "URL 未設置" }
  }

  // Test 2: 檢查 Service Role Key 格式
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (key.startsWith('eyJ')) {
      results.tests.keyFormat = { success: true, message: "Key 格式正確 (JWT)" }
    } else {
      results.tests.keyFormat = { success: false, message: "Key 格式可能不正確（應該以 eyJ 開頭）" }
    }
  } else {
    results.tests.keyFormat = { success: false, message: "Key 未設置" }
  }

  // Test 3: 嘗試創建 Supabase 客戶端
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      results.tests.clientCreation = { success: false, message: "缺少必要環境變數" }
    } else {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
      results.tests.clientCreation = { success: true, message: "客戶端創建成功" }

      // Test 4: 嘗試查詢 subscribers 表
      try {
        const { data, error } = await supabase
          .from("subscribers")
          .select("id")
          .limit(1)

        if (error) {
          results.tests.databaseQuery = {
            success: false,
            message: "數據庫查詢失敗",
            error: {
              message: error.message,
              code: error.code,
              hint: error.hint,
              details: error.details
            }
          }
        } else {
          results.tests.databaseQuery = {
            success: true,
            message: "數據庫連接成功！",
            recordCount: data?.length || 0
          }
        }
      } catch (queryError: any) {
        results.tests.databaseQuery = {
          success: false,
          message: "查詢時發生異常",
          error: queryError.message
        }
      }
    }
  } catch (error: any) {
    results.tests.clientCreation = {
      success: false,
      message: "創建客戶端失敗",
      error: error.message
    }
  }

  return NextResponse.json({
    summary: {
      allTestsPassed: Object.values(results.tests).every((t: any) => t.success),
      totalTests: Object.keys(results.tests).length,
      passedTests: Object.values(results.tests).filter((t: any) => t.success).length
    },
    ...results
  }, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

