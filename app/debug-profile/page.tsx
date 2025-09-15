"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/auth-provider"
import { getUserProfile } from "@/lib/user-data-service"
import { UserStorage } from "@/lib/client-storage"

export default function DebugProfilePage() {
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null)
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const checkProfiles = async () => {
    if (!user) return

    setLoading(true)
    try {
      // 檢查 Supabase 個人資料
      const supabaseData = await getUserProfile(user.id)
      setSupabaseProfile(supabaseData)

      // 檢查客戶端存儲個人資料
      const clientData = UserStorage.getUserProfile(user.id)
      setClientProfile(clientData)

      console.log("🔍 個人資料檢查結果:")
      console.log("Supabase 資料:", supabaseData)
      console.log("客戶端存儲資料:", clientData)
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
      phone: "0912345678",
      address: "台北市信義區信義路五段7號",
      city: "台北市",
      postal_code: "110",
      country: "台灣"
    }

    UserStorage.saveUserProfile(user.id, testProfile)
    setClientProfile(testProfile)
    console.log("✅ 已儲存測試個人資料")
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
              <CardTitle>個人資料調試</CardTitle>
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
            <CardTitle>個人資料調試</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkProfiles} disabled={loading}>
                {loading ? "檢查中..." : "檢查個人資料"}
              </Button>
              <Button onClick={saveTestProfile} variant="outline">
                儲存測試資料
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supabase 資料 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supabase 資料</CardTitle>
                </CardHeader>
                <CardContent>
                  {supabaseProfile ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>姓名:</strong> {supabaseProfile.name || "未設定"}</p>
                      <p><strong>電話:</strong> {supabaseProfile.phone || "未設定"}</p>
                      <p><strong>地址:</strong> {supabaseProfile.address || "未設定"}</p>
                      <p><strong>城市:</strong> {supabaseProfile.city || "未設定"}</p>
                      <p><strong>郵遞區號:</strong> {supabaseProfile.postal_code || "未設定"}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">無資料或 Supabase 未配置</p>
                  )}
                </CardContent>
              </Card>

              {/* 客戶端存儲資料 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">客戶端存儲資料</CardTitle>
                </CardHeader>
                <CardContent>
                  {clientProfile ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>姓名:</strong> {clientProfile.name || "未設定"}</p>
                      <p><strong>電話:</strong> {clientProfile.phone || "未設定"}</p>
                      <p><strong>地址:</strong> {clientProfile.address || "未設定"}</p>
                      <p><strong>城市:</strong> {clientProfile.city || "未設定"}</p>
                      <p><strong>郵遞區號:</strong> {clientProfile.postal_code || "未設定"}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">無資料</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 個人資料完整性檢查 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">個人資料完整性檢查</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>用戶郵箱:</strong> {user.email || "未設定"}</p>
                  <p><strong>電話號碼:</strong> {
                    (supabaseProfile?.phone || clientProfile?.phone) ? "✅ 已填寫" : "❌ 未填寫"
                  }</p>
                  <p><strong>地址:</strong> {
                    (supabaseProfile?.address || clientProfile?.address) ? "✅ 已填寫" : "❌ 未填寫"
                  }</p>
                  <p><strong>整體狀態:</strong> {
                    user.email && (supabaseProfile?.phone || clientProfile?.phone) && (supabaseProfile?.address || clientProfile?.address)
                      ? "✅ 完整" : "❌ 不完整"
                  }</p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">調試說明：</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 點擊「檢查個人資料」查看 Supabase 和客戶端存儲的資料</li>
                <li>• 點擊「儲存測試資料」在客戶端存儲中創建測試資料</li>
                <li>• 如果 Supabase 未配置，系統會使用客戶端存儲的資料</li>
                <li>• 檢查瀏覽器控制台查看詳細的調試信息</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
