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

/* ---------- 訂閱：儲存 / 讀取 ---------- */

export async function saveUserSubscription(userId: string, payload: any) {
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
  const supabase = getServiceClient()

  console.log("Saving user profile for ID:", profile.id)
  console.log("Profile data:", JSON.stringify(profile, null, 2))

  const { data, error } = await supabase.from("user_profiles").upsert(profile).select()

  if (error) {
    console.error("Error saving user profile:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error(`儲存個人資料失敗: ${error.message}`)
  }

  console.log("User profile saved successfully:", data)
  return { success: true, data }
}

export async function getUserProfile(userId: string) {
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
    throw new Error(`取得個人資料失敗: ${error.message}`)
  }

  console.log("Retrieved user profile:", data ? "Found" : "Not found")
  return data ?? null
}
