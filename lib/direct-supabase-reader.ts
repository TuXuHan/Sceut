/**
 * 直接從 Supabase 讀取個人資料，繞過編碼問題
 */

import { createClient } from "@/lib/supabase/client"

export async function getProfileDirectly(userId: string) {
  try {
    console.log("🔍 直接從 Supabase 讀取個人資料...")
    
    const supabase = createClient()
    
    // 直接查詢資料庫，不使用 getUserProfile 函數
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("❌ 直接查詢 Supabase 失敗:", error)
      return null
    }

    if (data) {
      console.log("✅ 成功從 Supabase 直接讀取資料:", data)
      return data
    }

    return null
  } catch (error) {
    console.error("❌ 直接讀取 Supabase 時發生錯誤:", error)
    return null
  }
}

/**
 * 強制從 Supabase 讀取資料，忽略編碼錯誤
 */
export async function forceReadFromSupabase(userId: string) {
  try {
    console.log("🔍 強制從 Supabase 讀取資料...")
    
    const supabase = createClient()
    
    // 使用 maybeSingle() 來避免單一記錄錯誤
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("❌ Supabase 查詢錯誤:", error)
      return null
    }

    if (data) {
      console.log("✅ 強制讀取成功:", data)
      return data
    }

    console.log("⚠️ 沒有找到資料")
    return null
  } catch (error) {
    console.error("❌ 強制讀取時發生錯誤:", error)
    return null
  }
}
