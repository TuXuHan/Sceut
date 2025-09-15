"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/auth-provider"
import { getUserProfile } from "@/lib/user-data-service"
import { UserStorage } from "@/lib/client-storage"
import { createClient } from "@/lib/supabase/client"
import { forceReadFromSupabase } from "@/lib/direct-supabase-reader"
import { parseProfileData, isProfileComplete } from "@/lib/profile-data-parser"

export default function DebugSubscribePage() {
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null)
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [checkResult, setCheckResult] = useState<any>(null)
  const { user } = useAuth()

  const checkProfiles = async () => {
    if (!user) return

    setLoading(true)
    try {
      // 檢查 Supabase 個人資料
      let supabaseData = null
      try {
        console.log("🔍 嘗試從 Supabase 獲取個人資料...")
        supabaseData = await getUserProfile(user.id)
        console.log("📋 Supabase 資料 (原始函數):", supabaseData)
        
        if (!supabaseData) {
          console.log("🔄 原始函數返回 null，嘗試直接讀取...")
          supabaseData = await forceReadFromSupabase(user.id)
          console.log("📋 Supabase 資料 (直接讀取):", supabaseData)
        }
      } catch (error) {
        console.warn("❌ Supabase 獲取失敗:", error)
        // 嘗試直接讀取作為備用方案
        try {
          supabaseData = await forceReadFromSupabase(user.id)
          console.log("📋 Supabase 資料 (備用方案):", supabaseData)
        } catch (directError) {
          console.warn("❌ 直接讀取也失敗:", directError)
        }
      }
      setSupabaseProfile(supabaseData)

      // 檢查客戶端存儲個人資料
      const clientData = UserStorage.getUserProfile(user.id)
      setClientProfile(clientData)

      // 模擬訂閱頁面的檢查邏輯
      const userEmail = user.email || user.user_metadata?.email
      const hasEmail = !!userEmail

      // 分別解析兩種資料來源
      const supabaseParsed = parseProfileData(supabaseData)
      const clientParsed = parseProfileData(clientData)
      
      // 訂閱頁面會優先使用 Supabase 資料，如果沒有才用客戶端資料
      const profileData = supabaseData || clientData
      const parsedData = parseProfileData(profileData)
      const profileComplete = isProfileComplete(parsedData)

      const result = {
        hasEmail,
        profileComplete,
        profileSource: supabaseData ? "Supabase" : "客戶端存儲",
        userEmail: userEmail || "未設定",
        parsedData,
        rawData: profileData,
        supabaseParsed,
        clientParsed,
        supabaseComplete: isProfileComplete(supabaseParsed),
        clientComplete: isProfileComplete(clientParsed)
      }

      setCheckResult(result)

      console.log("🔍 個人資料檢查結果:", result)
    } catch (error) {
      console.error("檢查個人資料失敗:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveTestProfile = () => {
    if (!user) return

    const testProfile = {
      id: user.id,
      name: "測試用戶",
      full_name: "測試用戶",
      email: user.email || "test@example.com",
      phone: "0912345678",
      address: "台北市信義區信義路五段7號",
      city: "台北市",
      postal_code: "110",
      country: "台灣"
    }

    UserStorage.saveUserProfile(user.id, testProfile)
    setClientProfile(testProfile)
    console.log("✅ 已儲存測試個人資料")
    
    // 重新檢查
    setTimeout(() => {
      checkProfiles()
    }, 500)
  }

  useEffect(() => {
    if (user) {
      checkProfiles()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>訂閱頁面調試</CardTitle>
            </CardHeader>
            <CardContent>
              <p>請先登入以查看個人資料狀態</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>訂閱頁面個人資料檢查調試</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkProfiles} disabled={loading}>
                {loading ? "檢查中..." : "重新檢查個人資料"}
              </Button>
              <Button onClick={saveTestProfile} variant="outline">
                儲存測試資料
              </Button>
            </div>

            {/* 檢查結果 */}
            {checkResult && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">檢查結果</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 基本狀態 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">用戶郵箱:</span>
                        <span className={`ml-2 ${checkResult.hasEmail ? "text-green-600" : "text-red-600"}`}>
                          {checkResult.hasEmail ? "✅ 已設定" : "❌ 未設定"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">資料來源:</span>
                        <span className="ml-2 text-blue-600">{checkResult.profileSource}</span>
                      </div>
                      <div>
                        <span className="font-medium">整體狀態:</span>
                        <span className={`ml-2 font-bold ${checkResult.profileComplete ? "text-green-600" : "text-red-600"}`}>
                          {checkResult.profileComplete ? "✅ 完整" : "❌ 不完整"}
                        </span>
                      </div>
                    </div>

                    {/* 資料來源比較 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-sm mb-2">Supabase 資料完整性</h4>
                        <span className={`text-sm ${checkResult.supabaseComplete ? "text-green-600" : "text-red-600"}`}>
                          {checkResult.supabaseComplete ? "✅ 完整" : "❌ 不完整"}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-sm mb-2">客戶端存儲完整性</h4>
                        <span className={`text-sm ${checkResult.clientComplete ? "text-green-600" : "text-red-600"}`}>
                          {checkResult.clientComplete ? "✅ 完整" : "❌ 不完整"}
                        </span>
                      </div>
                    </div>

                    {/* 解析後的資料 */}
                    {checkResult.parsedData && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-sm mb-2">智能解析結果 (訂閱頁面會使用的資料)</h4>
                        <div className="text-xs space-y-1">
                          <div>姓名: <span className="font-mono">{checkResult.parsedData.name || "未填寫"}</span></div>
                          <div>郵箱: <span className="font-mono">{checkResult.parsedData.email || "未填寫"}</span></div>
                          <div>電話: <span className="font-mono">{checkResult.parsedData.phone || "未填寫"}</span></div>
                          <div>地址: <span className="font-mono">{checkResult.parsedData.address || "未填寫"}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supabase 資料 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Supabase 資料
                    {checkResult?.supabaseComplete && <span className="text-green-600 text-sm">✅</span>}
                    {checkResult?.supabaseComplete === false && <span className="text-red-600 text-sm">❌</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {supabaseProfile ? (
                    <div className="space-y-3">
                      <div className="text-sm space-y-1">
                        <p><strong>姓名:</strong> {supabaseProfile.name || supabaseProfile.full_name || "未設定"}</p>
                        <p><strong>郵箱:</strong> {supabaseProfile.email || "未設定"}</p>
                        <p><strong>電話:</strong> {supabaseProfile.phone || "未設定"}</p>
                        <p><strong>地址:</strong> {supabaseProfile.address || "未設定"}</p>
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">查看原始資料</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(supabaseProfile, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <p className="text-gray-500">無資料或 Supabase 未配置</p>
                  )}
                </CardContent>
              </Card>

              {/* 客戶端存儲資料 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    客戶端存儲資料
                    {checkResult?.clientComplete && <span className="text-green-600 text-sm">✅</span>}
                    {checkResult?.clientComplete === false && <span className="text-red-600 text-sm">❌</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientProfile ? (
                    <div className="space-y-3">
                      <div className="text-sm space-y-1">
                        <p><strong>姓名:</strong> {clientProfile.name || clientProfile.full_name || "未設定"}</p>
                        <p><strong>郵箱:</strong> {clientProfile.email || "未設定"}</p>
                        <p><strong>電話:</strong> {clientProfile.phone || "未設定"}</p>
                        <p><strong>地址:</strong> {clientProfile.address || "未設定"}</p>
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">查看原始資料</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(clientProfile, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <p className="text-gray-500">無資料</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">調試說明：</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Supabase 資料</strong>：你在 member-center 填寫的原始資料（可能有欄位錯亂問題）</li>
                <li>• <strong>客戶端存儲資料</strong>：你在測試頁面填寫的資料（格式正確）</li>
                <li>• <strong>智能解析結果</strong>：系統會自動識別正確的欄位，即使資料庫欄位錯亂</li>
                <li>• <strong>訂閱頁面邏輯</strong>：優先使用 Supabase 資料，如果沒有才用客戶端存儲</li>
                <li>• 檢查瀏覽器控制台查看詳細的調試信息</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
