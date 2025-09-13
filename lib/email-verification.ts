import { createClient } from "@/lib/supabase/client"

export async function checkEmailVerificationStatus(email: string) {
  try {
    const supabase = createClient()

    // 首先檢查當前用戶是否已登入且已驗證
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (user && user.email === email) {
      // 用戶已登入且郵箱匹配，檢查驗證狀態
      return {
        exists: true,
        verified: user.email_confirmed_at !== null,
      }
    }

    // 如果用戶未登入，我們無法直接檢查驗證狀態
    // 返回需要重新驗證的狀態
    return { exists: true, verified: false }
  } catch (error) {
    console.error("檢查郵箱驗證狀態時發生錯誤:", error)
    return { exists: false, verified: false }
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    console.log("[v0] 開始重新發送驗證郵件:", email)
    const supabase = createClient()

    console.log("[v0] 調用 supabase.auth.resend...")
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: "https://sceut.vercel.app/auth/callback",
      },
    })

    if (error) {
      console.error("[v0] 重新發送驗證郵件時發生錯誤:", error)
      console.error("[v0] 錯誤詳情:", {
        message: error.message,
        status: error.status,
        name: error.name,
      })

      if (error.message.includes("Email rate limit exceeded")) {
        return {
          success: false,
          error: "發送郵件過於頻繁，請稍後再試",
        }
      }

      if (error.message.includes("User not found")) {
        return {
          success: false,
          error: "找不到此郵箱的註冊記錄，請先註冊",
        }
      }

      if (error.message.includes("Email already confirmed")) {
        return {
          success: false,
          error: "此郵箱已經驗證完成，可以直接登入",
        }
      }

      return {
        success: false,
        error: error.message || "重新發送驗證郵件失敗",
      }
    }

    console.log("[v0] 驗證郵件重新發送成功")
    return {
      success: true,
      message: "驗證郵件已重新發送，請檢查您的郵箱",
    }
  } catch (error) {
    console.error("[v0] 重新發送驗證郵件過程中發生錯誤:", error)
    return {
      success: false,
      error: "重新發送驗證郵件過程中發生錯誤",
    }
  }
}
