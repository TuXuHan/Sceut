"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { saveUserProfile, saveUserSubscription } from "@/lib/user-data-service"
import type { Subscription } from "@/types/subscription"
import type { QuizAnswers } from "@/types/quiz"

const BASE_URL = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_SITE_URL ?? "") : ""

// 儲存測驗答案到資料庫
export async function saveQuizAnswers(userId: string, answers: QuizAnswers) {
  try {
    console.log("Saving quiz answers for user:", userId)
    console.log("Quiz answers:", answers)

    const result = await saveUserProfile({
      id: userId,
      quiz_answers: answers,
    })

    if (result.success) {
      console.log("Quiz answers saved successfully")
      return { success: true }
    } else {
      throw new Error("Failed to save quiz answers")
    }
  } catch (error) {
    console.error("Error saving quiz answers:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "儲存測驗答案失敗",
    }
  }
}

// 從資料庫獲取用戶測驗資料
export async function getUserQuizData(userId: string): Promise<{ quiz_answers: QuizAnswers | null } | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/quiz-data?userId=${userId}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("[getUserQuizData] HTTP error", res.status)
      return null
    }

    const json = await res.json()
    return (json.quizData as { quiz_answers: QuizAnswers | null }) ?? null
  } catch (err) {
    console.error("[getUserQuizData] network error", err)
    return null
  }
}

// 儲存訂閱資料
export async function saveSubscription(subscriptionData: any) {
  try {
    console.log("Saving subscription data:", subscriptionData)

    const result = await saveUserSubscription(subscriptionData.user_id, subscriptionData)

    if (result.success) {
      console.log("Subscription saved successfully")
      return { success: true, data: result.data }
    } else {
      throw new Error("Failed to save subscription")
    }
  } catch (error) {
    console.error("Error saving subscription:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "儲存訂閱資料失敗",
    }
  }
}

// 獲取用戶訂閱資料 - 添加錯誤處理，避免阻斷登入流程
export async function getSubscriptions(userId: string): Promise<Subscription[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/subscriptions?userId=${userId}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`[getSubscriptions] HTTP error ${res.status}: ${res.statusText}`)

      // Try to get error message from response
      let errorMessage = `HTTP ${res.status}`
      try {
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } else {
          const textError = await res.text()
          errorMessage = textError.substring(0, 100) // Limit error message length
        }
      } catch (parseError) {
        console.error("[getSubscriptions] Failed to parse error response:", parseError)
      }

      console.error(`獲取訂閱記錄失敗: ${errorMessage}`)
      return []
    }

    const contentType = res.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error("[getSubscriptions] Response is not JSON:", contentType)
      console.error("獲取訂閱記錄失敗: Invalid response format")
      return []
    }

    const json = await res.json()
    return json.subscriptions as Subscription[]
  } catch (err) {
    console.error("[getSubscriptions] network error", err)

    if (err instanceof SyntaxError && err.message.includes("JSON")) {
      console.error(`獲取訂閱記錄失敗: ${err.message}`)
    } else {
      console.error(`獲取訂閱記錄失敗: ${err instanceof Error ? err.message : "Unknown error"}`)
    }

    return []
  }
}

// 更新用戶個人資料
export async function updateUserProfile(profileData: {
  id: string
  name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
}) {
  try {
    console.log("Updating user profile:", profileData.id)

    const result = await saveUserProfile(profileData)

    if (result.success) {
      console.log("Profile updated successfully")
      return { success: true, data: result.data }
    } else {
      throw new Error("Failed to update profile")
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新個人資料失敗",
    }
  }
}

// 刪除用戶帳號
export async function deleteUserAccount(userId: string) {
  try {
    console.log("Deleting user account:", userId)

    const supabase = createClient()

    // 開始交易 - 刪除所有相關資料
    const deleteOperations = []

    // 1. 刪除訂閱記錄
    deleteOperations.push(supabase.from("subscribers").delete().eq("user_id", userId))

    // 2. 刪除付款記錄（如果存在）
    deleteOperations.push(supabase.from("payments").delete().eq("user_id", userId))

    // 3. 刪除用戶資料
    deleteOperations.push(supabase.from("user_profiles").delete().eq("id", userId))

    // 執行所有刪除操作
    const results = await Promise.allSettled(deleteOperations)

    // 檢查是否有失敗的操作
    const failures = results.filter((result) => result.status === "rejected")
    if (failures.length > 0) {
      console.warn("Some delete operations failed:", failures)
    }

    // 4. 最後刪除認證用戶
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting auth user:", authError)
      throw new Error("刪除認證用戶失敗")
    }

    console.log("User account deleted successfully")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user account:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "刪除帳號失敗",
    }
  }
}

export async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("subscribers")
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)

    if (error) {
      console.error("更新訂閱狀態失敗:", error)
      throw new Error("更新訂閱狀態失敗")
    }

    revalidatePath("/member-center/profile")
    return { success: true }
  } catch (error) {
    console.error("更新訂閱狀態時發生錯誤:", error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("subscribers")
      .update({
        subscription_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)

    if (error) {
      console.error("取消訂閱失敗:", error)
      throw new Error("取消訂閱失敗")
    }

    revalidatePath("/member-center/profile")
    return { success: true }
  } catch (error) {
    console.error("取消訂閱時發生錯誤:", error)
    throw error
  }
}
