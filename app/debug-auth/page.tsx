"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const searchParams = useSearchParams()
  const [authState, setAuthState] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const supabase = createClient()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[DEBUG] ${message}`)
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    setLoading(true)
    addLog("開始檢查認證狀態...")

    try {
      // 檢查 URL 參數
      const code = searchParams.get("code")
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type")
      const error = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")

      addLog(`URL 參數: code=${code ? "有" : "無"}, token_hash=${token_hash ? "有" : "無"}, type=${type}, error=${error}`)

      if (error) {
        addLog(`❌ URL 錯誤: ${error} - ${errorDescription}`)
        setAuthState({ error, errorDescription })
        return
      }

      // 檢查當前會話
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      addLog(`會話檢查: ${sessionData?.session ? "有會話" : "無會話"}`)
      
      if (sessionError) {
        addLog(`❌ 會話錯誤: ${sessionError.message}`)
      }

      setSession(sessionData)

      // 檢查當前用戶
      const { data: userData, error: userError } = await supabase.auth.getUser()
      addLog(`用戶檢查: ${userData?.user ? "有用戶" : "無用戶"}`)
      
      if (userError) {
        addLog(`❌ 用戶錯誤: ${userError.message}`)
      }

      if (userData?.user) {
        addLog(`👤 用戶郵箱: ${userData.user.email}`)
        addLog(`📧 郵箱已驗證: ${userData.user.email_confirmed_at ? "是" : "否"}`)
        if (userData.user.email_confirmed_at) {
          addLog(`📅 驗證時間: ${new Date(userData.user.email_confirmed_at).toLocaleString()}`)
        }
      }

      setUser(userData)

      // 如果有驗證代碼，嘗試處理
      if (code) {
        addLog("🔄 發現驗證代碼，嘗試處理...")
        await handleCodeVerification(code)
      } else if (token_hash && type) {
        addLog("🔄 發現 token_hash，嘗試處理...")
        await handleTokenVerification(token_hash, type)
      }

    } catch (error) {
      addLog(`❌ 檢查認證狀態時發生錯誤: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeVerification = async (code: string) => {
    try {
      addLog("🔄 開始處理驗證代碼...")
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        addLog(`❌ 代碼交換失敗: ${error.message}`)
        if (error.message.includes("already_confirmed") || error.message.includes("email_confirmed")) {
          addLog("✅ 郵箱已確認，視為成功")
        }
      } else {
        addLog("✅ 代碼交換成功")
        if (data.user) {
          addLog(`👤 用戶: ${data.user.email}`)
          addLog(`📧 郵箱已驗證: ${data.user.email_confirmed_at ? "是" : "否"}`)
        }
      }
    } catch (error) {
      addLog(`❌ 處理驗證代碼時發生錯誤: ${error}`)
    }
  }

  const handleTokenVerification = async (token_hash: string, type: string) => {
    try {
      addLog("🔄 開始處理 token 驗證...")
      
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })
      
      if (error) {
        addLog(`❌ Token 驗證失敗: ${error.message}`)
        if (error.message.includes("already_confirmed") || error.message.includes("email_confirmed")) {
          addLog("✅ 郵箱已確認，視為成功")
        }
      } else {
        addLog("✅ Token 驗證成功")
        if (data.user) {
          addLog(`👤 用戶: ${data.user.email}`)
          addLog(`📧 郵箱已驗證: ${data.user.email_confirmed_at ? "是" : "否"}`)
        }
      }
    } catch (error) {
      addLog(`❌ 處理 token 驗證時發生錯誤: ${error}`)
    }
  }

  const testEmailVerification = async () => {
    setLoading(true)
    addLog("🔄 測試郵箱驗證...")

    try {
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email: "test@example.com",
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        addLog(`❌ 測試發送失敗: ${error.message}`)
      } else {
        addLog("✅ 測試發送成功")
      }
    } catch (error) {
      addLog(`❌ 測試時發生錯誤: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>認證調試頁面</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkAuthState} disabled={loading}>
                {loading ? "檢查中..." : "重新檢查認證狀態"}
              </Button>
              <Button onClick={testEmailVerification} variant="outline" disabled={loading}>
                測試郵箱驗證
              </Button>
              <Button onClick={clearLogs} variant="outline">
                清除日誌
              </Button>
            </div>

            {/* 當前狀態 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">會話狀態</CardTitle>
                </CardHeader>
                <CardContent>
                  {session?.session ? (
                    <div className="text-sm space-y-1">
                      <p><strong>有會話:</strong> 是</p>
                      <p><strong>用戶 ID:</strong> {session.session.user.id}</p>
                      <p><strong>郵箱:</strong> {session.session.user.email}</p>
                      <p><strong>已驗證:</strong> {session.session.user.email_confirmed_at ? "是" : "否"}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">無會話</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">用戶狀態</CardTitle>
                </CardHeader>
                <CardContent>
                  {user?.user ? (
                    <div className="text-sm space-y-1">
                      <p><strong>有用戶:</strong> 是</p>
                      <p><strong>用戶 ID:</strong> {user.user.id}</p>
                      <p><strong>郵箱:</strong> {user.user.email}</p>
                      <p><strong>已驗證:</strong> {user.user.email_confirmed_at ? "是" : "否"}</p>
                      {user.user.email_confirmed_at && (
                        <p><strong>驗證時間:</strong> {new Date(user.user.email_confirmed_at).toLocaleString()}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">無用戶</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 錯誤狀態 */}
            {authState?.error && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800">錯誤狀態</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>錯誤:</strong> {authState.error}</p>
                  <p><strong>描述:</strong> {authState.errorDescription}</p>
                </CardContent>
              </Card>
            )}

            {/* 日誌 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">調試日誌</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-gray-500">暫無日誌</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
