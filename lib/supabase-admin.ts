import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase environment variables not configured properly")
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => ({ data: [], error: { message: "Supabase not configured" } }),
        insert: () => ({ data: null, error: { message: "Supabase not configured" } }),
        upsert: () => ({ data: null, error: { message: "Supabase not configured" } }),
        update: () => ({ data: null, error: { message: "Supabase not configured" } }),
        delete: () => ({ data: null, error: { message: "Supabase not configured" } }),
        eq: function () {
          return this
        },
        order: function () {
          return this
        },
        single: function () {
          return this
        },
      }),
      auth: {
        admin: {
          listUsers: () => ({ data: { users: [] }, error: { message: "Supabase not configured" } }),
          updateUserById: () => ({ data: null, error: { message: "Supabase not configured" } }),
          deleteUser: () => ({ data: null, error: { message: "Supabase not configured" } }),
        },
      },
    } as any
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
