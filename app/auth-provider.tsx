"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { checkEmailVerificationStatus } from "@/lib/email-verification"
import { UserStorage } from "@/lib/client-storage"
import type { User, SupabaseClient, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  supabase: SupabaseClient
  isAuthenticated: boolean
  user: User | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>
  logout: () => Promise<void>
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>
  checkVerificationStatus: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType>({
  supabase: createClient(),
  isAuthenticated: false,
  user: null,
  session: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
  checkVerificationStatus: async () => ({ exists: false, verified: false }),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseClient = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const [authStateProcessed, setAuthStateProcessed] = useState(false)

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        console.log("=== 檢查用戶認證狀態 ===")

        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession()

        if (error && error.message !== "Auth session missing!") {
          console.error("獲取用戶時發生錯誤:", error)
        }

        const user = session?.user ?? null

        if (!mounted) return

        if (user) {
          console.log("用戶已登入:", user.email)
          setUser(user)
          setSession(session)

          // 確保用戶資料存在
          await ensureUserProfile(user)

          // 遷移舊的 localStorage 數據
          try {
            UserStorage.migrateOldData(user.id)
          } catch (migrationError) {
            console.warn("數據遷移時發生錯誤:", migrationError)
          }
        } else {
          console.log("用戶未登入 (無 Session)")
          setUser(null)
          setSession(null)
        }
      } catch (err) {
        console.error("檢查用戶狀態時發生錯誤:", err)
        if (mounted) {
          setUser(null)
          setSession(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (!authStateProcessed) {
      getUser()
    }

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("認證狀態變化:", event, session?.user?.email)

      setAuthStateProcessed(true)

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        // 當用戶登入時，確保用戶資料存在
        await ensureUserProfile(session.user)

        // 當用戶登入時，遷移舊數據
        try {
          UserStorage.migrateOldData(session.user.id)
        } catch (migrationError) {
          console.warn("登入時數據遷移發生錯誤:", migrationError)
        }
      } else {
        console.log("用戶已登出")
        setUser(null)
        setSession(null)
        setLoading(false)

        // 處理登出事件 - 檢查是否需要重定向到登入頁面
        if (event === "SIGNED_OUT") {
          console.log("Supabase 認證狀態: SIGNED_OUT")

          const protectedRoutes = ["/member-center", "/recommendations", "/subscribe"]

          const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

          // 如果在受保護的頁面，重定向到登入頁面
          if (isProtectedRoute) {
            console.log("在受保護頁面，重定向到登入頁面")
            setTimeout(() => {
              router.push("/login")
            }, 100)
          }
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabaseClient, router, pathname])

  // 確保用戶資料存在於 user_profiles 表中
  const ensureUserProfile = async (user: User) => {
    try {
      console.log("檢查用戶資料是否存在...")

      // 檢查用戶資料是否已存在
      const { data: profile, error: selectErr } = await supabaseClient
        .from("user_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

      if (selectErr) {
        console.error("檢查用戶資料時發生錯誤:", selectErr)
        // 如果查詢失敗，嘗試使用 API 創建
        await createUserProfileViaAPI(user)
        return
      }

      if (profile) {
        console.log("用戶資料已存在:", profile.id)
        return
      }

      // 資料不存在，嘗試使用 RPC 函數創建
      console.log("透過 RPC 建立用戶資料:", user.email)
      const { error: rpcErr } = await supabaseClient.rpc("ensure_user_profile", {
        p_user_id: user.id,
        p_name: user.user_metadata?.name || user.email?.split("@")[0] || "",
        p_email: user.email || "",
      })

      if (rpcErr) {
        console.error("確保用戶資料 (RPC) 時發生錯誤:", rpcErr)
        // 如果 RPC 失敗，嘗試使用 API
        await createUserProfileViaAPI(user)
      } else {
        console.log("用戶資料建立完成 (RPC)")
      }
    } catch (err) {
      console.error("ensureUserProfile 發生意外錯誤:", err)
      // 備用方案：使用 API
      await createUserProfileViaAPI(user)
    }
  }

  // 備用方案：通過 API 創建用戶資料
  const createUserProfileViaAPI = async (user: User) => {
    try {
      console.log("使用 API 創建用戶資料...")

      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "",
          email: user.email || "",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API 創建用戶資料失敗:", errorData)
      } else {
        const result = await response.json()
        console.log("API 創建用戶資料成功:", result)
      }
    } catch (error) {
      console.error("API 調用錯誤:", error)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("開始註冊流程:", email)

      // 檢查是否已經註冊但未驗證
      const verificationStatus = await checkEmailVerificationStatus(email)

      if (verificationStatus.exists && !verificationStatus.verified) {
        return {
          success: false,
          error: "此郵箱已註冊但尚未驗證，請檢查您的郵箱或重新發送驗證郵件",
          needsVerification: true,
        }
      }

      if (verificationStatus.exists && verificationStatus.verified) {
        return {
          success: false,
          error: "此郵箱已註冊並已驗證，請直接登入",
        }
      }

      // 使用正式上線的重定向 URL
      const redirectUrl = "https://sceut.vercel.app/auth/callback"

      console.log("Auth Provider 使用重定向 URL:", redirectUrl)

      // 進行註冊
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        console.error("註冊錯誤:", error)

        // 處理常見錯誤
        if (error.message.includes("User already registered")) {
          return {
            success: false,
            error: "此電子郵件已被註冊",
            needsVerification: true,
          }
        }
        if (error.message.includes("Invalid email")) {
          return { success: false, error: "請輸入有效的電子郵件地址" }
        }
        if (error.message.includes("Password should be at least")) {
          return { success: false, error: "密碼長度至少需要6位" }
        }
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log("註冊成功:", data.user.email)

        // 檢查是否需要郵箱驗證
        if (!data.user.email_confirmed_at && data.user.confirmation_sent_at) {
          return {
            success: true,
            needsVerification: true,
            error: "註冊成功！請檢查您的郵箱並點擊驗證連結。如果沒有收到郵件，請檢查垃圾郵件資料夾。",
          }
        }

        // 如果已經驗證（在某些配置下可能發生）
        return { success: true }
      }

      return { success: false, error: "註冊失敗" }
    } catch (error) {
      console.error("註冊過程中發生錯誤:", error)
      return { success: false, error: "註冊過程中發生錯誤" }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("嘗試登入:", email)

      // 清理輸入但保持原始大小寫
      const cleanEmail = email.trim()
      const cleanPassword = password.trim()

      if (!cleanEmail || !cleanPassword) {
        return { success: false, error: "請輸入電子郵件和密碼" }
      }

      // 基本郵件格式驗證
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(cleanEmail)) {
        return { success: false, error: "請輸入有效的電子郵件地址" }
      }

      console.log("正在驗證登入憑證...")
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      })

      if (error) {
        console.error("登入錯誤:", error)

        // 處理常見錯誤
        const msg = error.message || ""

        if (
          msg.toLowerCase().includes("invalid login credentials") ||
          msg.toLowerCase().includes("invalid credentials") ||
          msg.toLowerCase().includes("invalid email or password")
        ) {
          // 檢查用戶是否存在但未驗證
          try {
            const verificationStatus = await checkEmailVerificationStatus(cleanEmail)
            if (verificationStatus.exists && !verificationStatus.verified) {
              return {
                success: false,
                error: "請先驗證您的電子郵件",
                needsVerification: true,
              }
            }
          } catch (verifyError) {
            console.warn("檢查驗證狀態時發生錯誤:", verifyError)
          }

          return { success: false, error: "電子郵件或密碼錯誤，請檢查您的登入資訊" }
        } else if (
          msg.toLowerCase().includes("email not confirmed") ||
          msg.toLowerCase().includes("has not confirmed") ||
          msg.toLowerCase().includes("email_not_confirmed")
        ) {
          return {
            success: false,
            error: "請先驗證您的電子郵件",
            needsVerification: true,
          }
        } else if (msg.toLowerCase().includes("too many requests")) {
          return { success: false, error: "登入嘗試次數過多，請稍後再試" }
        } else if (msg.toLowerCase().includes("signup disabled")) {
          return { success: false, error: "此帳號尚未啟用，請聯繫管理員" }
        }

        return { success: false, error: `登入失敗: ${error.message}` }
      }

      if (data.user) {
        // 檢查郵箱是否已驗證
        if (!data.user.email_confirmed_at) {
          console.log("用戶郵箱未驗證")
          return {
            success: false,
            error: "請先驗證您的電子郵件",
            needsVerification: true,
          }
        }

        console.log("登入成功:", data.user.email)
        // 登入成功後不在這裡重定向，讓 onAuthStateChange 處理
        return { success: true }
      }

      return { success: false, error: "登入失敗，請稍後再試" }
    } catch (error) {
      console.error("登入過程中發生錯誤:", error)
      return { success: false, error: "登入過程中發生錯誤，請稍後再試" }
    }
  }

  const logout = async () => {
    console.log("=== AuthProvider logout 開始 ===")

    try {
      // 1. 立即設置用戶狀態為 null，防止 UI 顯示登入狀態
      console.log("立即清除用戶狀態...")
      setUser(null)
      setSession(null)

      // 2. 清除用戶相關的本地數據
      if (user) {
        try {
          console.log("清除用戶存儲數據...")
          UserStorage.clearUserData(user.id)
        } catch (e) {
          console.warn("清除用戶存儲時發生錯誤:", e)
        }
      }

      // 3. 清除舊的全局 localStorage 數據
      try {
        const globalKeys = [
          "quizAnswers",
          "selectedPerfume",
          "subscriptionData",
          "recommendations",
          "userQuizData",
          "perfumeRecommendations",
        ]

        globalKeys.forEach((key) => {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        })
      } catch (e) {
        console.warn("清除全局存儲時發生錯誤:", e)
      }

      // 4. 執行 Supabase 登出
      console.log("執行 Supabase 登出...")
      const { error } = await supabaseClient.auth.signOut()

      if (error) {
        console.error("Supabase 登出時發生錯誤:", error)
      } else {
        console.log("Supabase 登出成功")
      }

      console.log("=== AuthProvider logout 完成 ===")
    } catch (error) {
      console.error("登出過程中發生錯誤:", error)
      // 即使發生錯誤也要確保用戶狀態被清除
      setUser(null)
      setSession(null)
    }
  }

  const checkVerificationStatus = async (email: string) => {
    try {
      return await checkEmailVerificationStatus(email)
    } catch (error) {
      console.error("檢查驗證狀態時發生錯誤:", error)
      return { exists: false, verified: false }
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        supabase: supabaseClient,
        isAuthenticated,
        user,
        session,
        loading,
        login,
        logout,
        register,
        checkVerificationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// 獲取用戶函數（用於服務器端）
export async function getUser() {
  const supabase = createClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("獲取 session 失敗:", error)
      return null
    }

    return session?.user ?? null
  } catch (error) {
    console.error("獲取用戶時發生錯誤:", error)
    return null
  }
}
