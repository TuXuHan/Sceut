"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, User, Trash2, Save, CreditCard } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useDebouncedLoading } from "@/hooks/use-debounced-loading"
import { useRouter } from "next/navigation" // Added useRouter import

interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
  "711": string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "台灣",
    "711": "",
  })
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "台灣",
    "711": "",
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { loading, startLoading, stopLoading, shouldSkipLoad, resetLoadingState } = useDebouncedLoading({
    debounceMs: 500,
    maxRetries: 1
  })

  const { user, supabase } = useAuth()
  const { toast } = useToast()
  const router = useRouter() // Added router instance

  useEffect(() => {
    if (user && supabase) {
      resetLoadingState()
      loadProfile()
    }
  }, [user, supabase])

  // 页面可见性变化时重新加载数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && supabase) {
        resetLoadingState()
        loadProfile(true)
      }
    }

    const handleFocus = () => {
      if (user && supabase) {
        resetLoadingState()
        loadProfile(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [user, supabase])

  const loadProfile = async (forceReload = false) => {
    if (!user) return

    // 使用智能防抖机制
    if (shouldSkipLoad(forceReload)) {
      stopLoading()
      return
    }

    try {
      console.log("📊 載入個人資料...")
      startLoading()

      // 使用 fetch API 查詢用戶資料
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("環境變數未設定")
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=id,name,email,phone,address,city,postal_code,country,711&id=eq.${user.id}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("✅ 資料載入成功:", data)
        
        if (data && data.length > 0) {
          const userData = data[0]
          const profileData = {
            name: userData.name || user.user_metadata?.name || "",
            email: userData.email || user.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            postal_code: userData.postal_code || "",
            country: userData.country || "台灣",
            "711": userData["711"] || "",
          }
          
          setProfile(profileData)
          setOriginalProfile(profileData)
          
          toast({
            title: "資料載入成功",
            description: "已載入您的個人資料",
          })
          return
        }
      }
      
      // 如果沒有找到資料，使用預設值
      console.log("⚠️ 沒有找到資料，使用預設值")
      const defaultProfile = {
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        country: "台灣",
        "711": "",
      }
      
      setProfile(defaultProfile)
      setOriginalProfile(defaultProfile)
    } catch (error) {
      console.error("❌ 載入個人資料失敗:", error)
      
      // 如果是查询超时，使用默认值
      if (error instanceof Error && error.message === '查詢超時') {
        console.log("⚠️ 查詢超時，使用預設值")
        const defaultProfile = {
          name: user.user_metadata?.name || "",
          email: user.email || "",
          phone: "",
          address: "",
          city: "",
          postal_code: "",
          country: "台灣",
          "711": "",
        }
        setProfile(defaultProfile)
        setOriginalProfile(defaultProfile)
        
        toast({
          variant: "destructive",
          title: "載入超時",
          description: "數據庫連接超時，已載入預設值",
        })
      } else {
        toast({
          variant: "destructive",
          title: "載入失敗",
          description: "載入個人資料失敗，請稍後再試",
        })
      }
    } finally {
      stopLoading()
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const hasChanges = () => {
    return JSON.stringify(profile) !== JSON.stringify(originalProfile)
  }

  const handleSave = async () => {
    if (!hasChanges() || !user || !supabase) return

    try {
      setSaving(true)

      // 使用 upsert 來插入或更新記錄
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          name: profile.name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim(),
          city: profile.city.trim(),
          postal_code: profile.postal_code.trim(),
          country: profile.country.trim(),
          "711": profile["711"].trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" })

      if (error) {
        throw error
      }

      setOriginalProfile(profile)
      toast({
        title: "儲存成功",
        description: "個人資料已成功更新！",
      })
    } catch (error) {
      console.error("儲存個人資料失敗:", error)
      const errorMessage = error instanceof Error ? error.message : "未知錯誤"
      toast({
        variant: "destructive",
        title: "儲存失敗",
        description: `儲存失敗：${errorMessage}。請稍後再試。`,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || !supabase) return

    try {
      setDeleting(true)

      // 刪除用戶相關的所有資料
      const userId = user.id

      // 刪除 user_profiles
      await supabase.from("user_profiles").delete().eq("id", userId)

      // 刪除 subscribers
      await supabase.from("subscribers").delete().eq("user_id", userId)

      // 刪除其他相關表的資料
      try {
        await supabase.from("payments").delete().eq("user_id", userId)
      } catch (error) {
        console.log("No payments table or no records to delete")
      }

      toast({
        title: "帳號已刪除",
        description: "您的帳號和所有相關資料已被刪除",
      })

      // 登出並重定向到首頁
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("刪除帳號失敗:", error)
      toast({
        variant: "destructive",
        title: "刪除失敗",
        description: "刪除帳號失敗，請稍後再試",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#A69E8B]" />
            <p className="text-gray-600">載入個人資料中...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extralight text-gray-800 mb-2 tracking-wide">個人資料</h1>
          <p className="text-gray-600 font-light">管理您的個人資訊和帳號設定</p>
        </div>

        <Card className="border-[#E8E2D9] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-light text-[#6D5C4A] tracking-wide">
              <User className="w-5 h-5 mr-2" />
              基本資料
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-light text-gray-700">
                  姓名 *
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="請輸入您的姓名"
                  className="rounded-none border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-light text-gray-700">
                  電子郵件 *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="請輸入您的電子郵件"
                  className="rounded-none border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-light text-gray-700">
                  電話 *
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="請輸入您的電話號碼"
                  className="rounded-none border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="711" className="text-sm font-light text-gray-700">
                  送貨7-11店家名稱 *
                </Label>
                <Input
                  id="711"
                  value={profile["711"]}
                  onChange={(e) => handleInputChange("711", e.target.value)}
                  placeholder="請輸入7-11店家名稱"
                  className="rounded-none border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-light text-gray-700">
                地址（街道，選填）
              </Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="請輸入您的詳細地址（選填）"
                className="rounded-none border-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-light text-gray-700">
                  縣市 *
                </Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="請輸入縣市名稱"
                  className="rounded-none border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code" className="text-sm font-light text-gray-700">
                  郵遞區號
                </Label>
                <Input
                  id="postal_code"
                  value={profile.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  placeholder="郵遞區號"
                  className="rounded-none border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-light text-gray-700">
                  國家
                </Label>
                <Input
                  id="country"
                  value={profile.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="國家"
                  className="rounded-none border-gray-300"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-1">付款方式</h3>
                  <p className="text-sm text-gray-600 font-light">管理您的付款設定和訂閱方案</p>
                </div>
                <Button
                  onClick={() => (window.location.href = "/subscribe")} // Using window.location.href for direct navigation to /subscribe
                  variant="outline"
                  className="rounded-none border-[#A69E8B] text-[#A69E8B] hover:bg-[#A69E8B] hover:text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  設定付款方式
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges() || saving}
                className="bg-[#A69E8B] hover:bg-[#8A7B6C] text-white rounded-none text-sm font-light tracking-widest uppercase"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    儲存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    儲存變更
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              危險區域
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-red-800 mb-2">刪除帳號</h3>
              <p className="text-sm text-red-600 mb-4">刪除帳號後，您的所有資料將被永久刪除，包括：</p>
              <ul className="text-sm text-red-600 list-disc list-inside space-y-1 mb-4">
                <li>個人資料和偏好設定</li>
                <li>訂閱記錄和配送資訊</li>
                <li>測驗結果和推薦記錄</li>
                <li>付款資訊和交易記錄</li>
              </ul>
              <p className="text-sm text-red-600 font-medium">此操作無法復原，請謹慎考慮。</p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting} className="rounded-none">
                  <Trash2 className="w-4 h-4 mr-2" />
                  刪除帳號
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">確認刪除帳號</AlertDialogTitle>
                  <AlertDialogDescription>
                    您確定要刪除您的帳號嗎？此操作將永久刪除您的所有資料，包括個人資料、訂閱記錄、測驗結果等。
                    <br />
                    <br />
                    <strong>此操作無法復原。</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-none">取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 rounded-none"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        刪除中...
                      </>
                    ) : (
                      "確認刪除"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
