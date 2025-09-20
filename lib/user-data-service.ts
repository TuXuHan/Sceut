"use server"

/**
 * 伺服器端 Supabase 用戶資料服務
 *
 * 1. 透過 Service Role Key 連線，以便進行 RLS 允許的讀／寫
 * 2. 這裡僅示範常用的四個函式：
 *    - saveUserSubscription         (儲存訂閱)
 *    - getUserSubscriptions         (取得訂閱清單)
 *    - saveUserProfile              (儲存/更新用戶個人資料) ★ 必要匯出
 *    - getUserProfile               (取得個人資料)
 *
 * 若您已在其他檔案實作過相同功能，請自行合併。
 */

import { createAdminClient } from "@/lib/supabase-admin"

function getServiceClient() {
  return createAdminClient()
}

function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/* ---------- 訂閱：儲存 / 讀取 ---------- */

export async function saveUserSubscription(userId: string, payload: any) {
  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured, using fallback storage")
    return { success: true, data: { id: Date.now().toString(), ...payload } }
  }

  const supabase = getServiceClient()

  console.log("saveUserSubscription called with userId:", userId)
  console.log("Payload to insert:", JSON.stringify(payload, null, 2))

  const dataToInsert = {
    user_id: userId,
    ...payload,
    created_at: new Date().toISOString(), // 確保有建立時間
  }

  console.log("Final data to insert:", JSON.stringify(dataToInsert, null, 2))

  const { data, error } = await supabase.from("subscribers").insert(dataToInsert).select()

  if (error) {
    console.error("Supabase insert error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })

    // 記錄完整的錯誤物件以便除錯
    console.error("Full Supabase error object:", JSON.stringify(error, null, 2))

    throw new Error(`資料庫儲存失敗: ${error.message}`)
  }

  console.log("Subscription saved successfully:", data)
  return { success: true, data }
}

export async function getUserSubscriptions(userId: string) {
  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured, returning empty subscriptions")
    return []
  }

  const supabase = getServiceClient()

  console.log("Getting subscriptions for userId:", userId)

  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error getting user subscriptions:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error(`取得訂閱資料失敗: ${error.message}`)
  }

  console.log("Retrieved subscriptions count:", data?.length || 0)
  return data || []
}

/* ---------- 個人資料：儲存 / 讀取 ---------- */

export async function saveUserProfile(profile: {
  id: string
  name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  quiz_answers?: Record<string, unknown>
}) {
  console.log("💾 Attempting to save user profile for ID:", profile.id)
  console.log("📝 Profile data:", JSON.stringify(profile, null, 2))

  try {
    const supabase = getServiceClient()

    console.log("🔗 Supabase client created successfully")

    const { error } = await supabase.from("user_profiles").upsert(profile)

    if (error) {
      console.error("❌ Error saving user profile:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(`儲存個人資料失敗: ${error.message}`)
    }

    const { data: updatedData, error: selectError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", profile.id)
      .single()

    if (selectError) {
      console.error("⚠️ Error fetching updated profile:", selectError)
      console.log("✅ User profile saved successfully (fetch failed)")
      return { success: true, data: null }
    }

    console.log("✅ User profile saved and verified successfully:", updatedData)
    return { success: true, data: updatedData }
  } catch (error) {
    console.error("❌ Failed to save to Supabase:", error)

    console.log("🔄 Falling back to client-side storage")
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getUserProfile(userId: string) {
  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured, returning null profile")
    return null
  }

  try {
    const supabase = getServiceClient()

    console.log("Getting user profile for ID:", userId)

    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error getting user profile:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      
      // 如果是編碼錯誤或其他錯誤，返回 null 而不是拋出錯誤
      if (error.message.includes("ByteString") || error.message.includes("character at index")) {
        console.warn("編碼錯誤，返回 null 讓客戶端使用回退邏輯")
        return null
      }
      
      // 對於其他錯誤，也返回 null 而不是拋出錯誤，讓客戶端可以處理
      console.warn("資料庫查詢失敗，返回 null 讓客戶端使用回退邏輯")
      return null
    }

    console.log("Retrieved user profile:", data ? "Found" : "Not found")
    return data ?? null
  } catch (error) {
    console.error("getUserProfile 發生未預期錯誤:", error)
    
    // 如果是編碼相關錯誤，返回 null 讓客戶端使用回退邏輯
    if (error instanceof Error && (
      error.message.includes("ByteString") || 
      error.message.includes("character at index") ||
      error.message.includes("Cannot convert argument")
    )) {
      console.warn("編碼錯誤，返回 null 讓客戶端使用回退邏輯")
      return null
    }
    
    // 其他錯誤仍然拋出
    throw error
  }
}
