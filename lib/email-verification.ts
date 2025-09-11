import { createClient } from "@/lib/supabase/client"

export async function checkEmailVerificationStatus(email: string) {
  try {
    const supabase = createClient()

    // 檢查用戶是否存在於 auth.users 表中
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.log("用戶未登入，檢查是否已註冊...")
    }

    // 嘗試使用 signInWithPassword 來檢查用戶是否存在
    // 這是一個間接的方法，因為 Supabase 不允許直接查詢 auth.users
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: "dummy_password_for_check",
    })

    if (signInError) {
      const errorMessage = signInError.message.toLowerCase()

      if (errorMessage.includes("invalid login credentials")) {
        // 可能是密碼錯誤，但用戶存在
        return { exists: true, verified: true }
      } else if (errorMessage.includes("email not confirmed")) {
        // 用戶存在但未驗證
        return { exists: true, verified: false }
      } else if (errorMessage.includes("user not found")) {
        // 用戶不存在
        return { exists: false, verified: false }
      }

      // 其他錯誤，假設用戶不存在
      return { exists: false, verified: false }
    }

    // 如果沒有錯誤，說明用戶存在且已驗證（但這種情況不太可能發生）
    return { exists: true, verified: true }
  } catch (error) {
    console.error("檢查郵箱驗證狀態時發生錯誤:", error)
    return { exists: false, verified: false }
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("重新發送驗證郵件時發生錯誤:", error)

      if (error.message.includes("Email rate limit exceeded")) {
        return {
          success: false,
          error: "發送郵件過於頻繁，請稍後再試",
        }
      }

      return {
        success: false,
        error: error.message || "重新發送驗證郵件失敗",
      }
    }

    return {
      success: true,
      message: "驗證郵件已重新發送，請檢查您的郵箱",
    }
  } catch (error) {
    console.error("重新發送驗證郵件過程中發生錯誤:", error)
    return {
      success: false,
      error: "重新發送驗證郵件過程中發生錯誤",
    }
  }
}
