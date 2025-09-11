import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || "https://bbrnbyzjmxgxnczzymdt.supabase.co"
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA2MDYyMDc4N30.YourServiceRoleKeyHere"

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase 環境變數未設定完整")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ✅ 只留這一個
export const supabaseAdmin = createAdminClient()

// 檢查用戶驗證狀態
export async function checkUserVerificationStatus(email: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error("Error fetching users:", error)
      return { verified: false, exists: false, error: error.message }
    }

    const user = data.users.find((u) => u.email === email)

    if (!user) {
      return { verified: false, exists: false }
    }

    return {
      verified: !!user.email_confirmed_at,
      exists: true,
      user: user,
      confirmationSentAt: user.confirmation_sent_at,
      emailConfirmedAt: user.email_confirmed_at,
    }
  } catch (error: any) {
    console.error("Error checking user status:", error)
    return { verified: false, exists: false, error: error.message }
  }
}

// 手動驗證用戶（管理員功能）
export async function manuallyVerifyUser(email: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(email, {
      email_confirm: true,
    })

    if (error) {
      console.error("Error manually verifying user:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in manual verification:", error)
    return { success: false, error: error.message }
  }
}
