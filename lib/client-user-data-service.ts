/**
 * 客戶端 Supabase 用戶資料服務
 * 用於在客戶端組件中獲取個人資料
 */

import { createClient } from "@/lib/supabase/client"

export async function getClientUserProfile(userId: string) {
  try {
    console.log("🔍 客戶端獲取個人資料 for ID:", userId)
    
    const supabase = createClient()
    
    // 方法1: 根據 user.id 查詢
    let { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle()

    console.log("根據 ID 查詢結果:", { data, error })

    // 方法2: 如果沒有找到資料，嘗試智能匹配
    if (!data && !error) {
      console.log("根據 ID 未找到資料，嘗試智能匹配...")
      
      // 查詢所有記錄
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("user_profiles")
        .select("*")
      
      if (!allProfilesError && allProfiles && allProfiles.length > 0) {
        console.log("所有個人資料記錄:", allProfiles)
        
        // 智能匹配：找到包含有效個人資料的記錄
        const matchedProfile = allProfiles.find(profile => {
          // 檢查是否有完整的個人資訊
          const hasValidData = profile.name || 
                             profile.phone || 
                             profile.address || 
                             profile.email
          
          if (hasValidData) {
            console.log("找到有效的個人資料記錄:", profile)
            return true
          }
          return false
        })
        
        if (matchedProfile) {
          console.log("✅ 使用智能匹配找到的資料:", matchedProfile)
          data = matchedProfile
          error = null
        }
      }
    }

    if (error && error.code !== "PGRST116") {
      console.error("Error getting user profile:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      
      // 如果是編碼錯誤，返回 null 而不是拋出錯誤
      if (error.message.includes("ByteString") || error.message.includes("character at index")) {
        console.warn("編碼錯誤，返回 null 讓客戶端使用回退邏輯")
        return null
      }
      
      throw new Error(`取得個人資料失敗: ${error.message}`)
    }

    if (data) {
      console.log("✅ 成功獲取個人資料:", data)
      return data
    }

    console.log("⚠️ 沒有找到個人資料")
    return null
  } catch (error) {
    console.error("❌ 獲取個人資料時發生錯誤:", error)
    throw new Error(`取得個人資料失敗: ${error instanceof Error ? error.message : "未知錯誤"}`)
  }
}
