"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { Loader2, User, Save, CreditCard } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useDebouncedLoading } from "@/hooks/use-debounced-loading"
import { useRouter } from "next/navigation" // Added useRouter import
import AddressForm from "@/components/address-form"

interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
  "711": string
  delivery_method?: "711" | "home" | ""
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
    delivery_method: "",
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
    delivery_method: "",
  })
  const [addressFormValid, setAddressFormValid] = useState(false)
  const [saving, setSaving] = useState(false)
  const { loading, startLoading, stopLoading, shouldSkipLoad, resetLoadingState } = useDebouncedLoading({
    debounceMs: 500,
    maxRetries: 1
  })

  const { user, supabase } = useAuth()
  const { toast } = useToast()
  const router = useRouter() // Added router instance

  // 類型安全的函數來創建UserProfile對象
  const createUserProfile = (data: any): UserProfile => ({
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    city: data.city || "",
    postal_code: data.postal_code || "",
    country: data.country || "台灣",
    "711": data["711"] || "",
    delivery_method: (data.delivery_method as "711" | "home" | "") || "",
  })

  // 檢查是否有變更
  const hasChanges = () => {
    const hasChangesResult = JSON.stringify(profile) !== JSON.stringify(originalProfile)
    // 移除調試日誌，避免頻繁輸出
    return hasChangesResult
  }

  useEffect(() => {
    if (user && supabase) {
      resetLoadingState()
      loadProfile()
    }
  }, [user, supabase])

  // 防止 Backspace 返回上一頁
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 只處理 Backspace 鍵
      if (event.key === 'Backspace') {
        const target = event.target as HTMLElement
        
        // 檢查是否在可編輯元素中
        const isInput = target instanceof HTMLInputElement
        const isTextArea = target instanceof HTMLTextAreaElement
        const isContentEditable = target.contentEditable === 'true' || target.isContentEditable
        const isEditable = isInput || isTextArea || isContentEditable
        
        // 只在非可編輯元素中阻止 Backspace
        if (!isEditable) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          return false
        } else {
          // 在可編輯元素中，阻止事件冒泡但允許預設行為
          event.stopPropagation()
        }
      }
    }

    // 使用 capture 模式，確保優先處理
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

  // 頁面離開前確認 - 暫時禁用，避免干擾編輯操作
  // useEffect(() => {
  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     console.log("🔍 beforeunload 事件觸發")
  //     // 如果有未儲存的變更，顯示確認對話框
  //     if (hasChanges()) {
  //       console.log("⚠️ 有未儲存變更，顯示確認對話框")
  //       event.preventDefault()
  //       event.returnValue = '您有未儲存的變更，確定要離開嗎？'
  //       return '您有未儲存的變更，確定要離開嗎？'
  //     } else {
  //       console.log("✅ 無變更，允許離開")
  //     }
  //   }

  //   // 添加事件監聽器
  //   window.addEventListener('beforeunload', handleBeforeUnload)

  //   // 清理事件監聽器
  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload)
  //   }
  // }, [hasChanges])

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
      startLoading()

      // 使用 fetch API 查詢用戶資料
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("環境變數未設定")
      }
      

      // 暫時只查詢現有欄位，直到資料庫遷移完成
      const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=id,name,email,phone,address,city,postal_code,country,711,delivery_method&id=eq.${user.id}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data && data.length > 0) {
          const userData = data[0]
          const profileData = createUserProfile({
            ...userData,
            name: userData.name || user.user_metadata?.name || "",
            email: userData.email || user.email || "",
          })
          
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
      const defaultProfile = createUserProfile({
        name: user.user_metadata?.name || "",
        email: user.email || "",
      })
      
      setProfile(defaultProfile)
      setOriginalProfile(defaultProfile)
    } catch (error) {
      console.error("❌ 載入個人資料失敗:", error)
      
      // 如果是查询超时，使用默认值
      if (error instanceof Error && error.message === '查詢超時') {
        const defaultProfile = createUserProfile({
          name: user.user_metadata?.name || "",
          email: user.email || "",
        })
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

  const handleAddressFormChange = useCallback((addressData: any, isValid: boolean) => {
    setAddressFormValid(isValid)
    setProfile((prev) => ({
      ...prev,
      delivery_method: addressData.deliveryMethod as "711" | "home" | "",
      city: addressData.city,
      "711": addressData.store711,
      address: addressData.fullAddress, // 使用現有的 address 欄位
      postal_code: addressData.postalCode,
    }))
  }, [])

  // 使用 useMemo 穩定 AddressForm 的 initialData
  // 只在組件首次加載時設置，之後不再更新，避免失焦
  const addressFormInitialData = useMemo(() => ({
    deliveryMethod: (originalProfile.delivery_method || "") as "" | "711" | "home",
    city: originalProfile.city,
    store711: originalProfile["711"] || "",
    fullAddress: originalProfile.address || "",
    postalCode: originalProfile.postal_code,
  }), [originalProfile.delivery_method, originalProfile.city, originalProfile["711"], originalProfile.address, originalProfile.postal_code])

  const handleSave = async () => {
    console.log("💾 開始儲存個人資料...")
    
    if (!hasChanges()) {
      console.log("⚠️ 沒有變更，取消儲存")
      return
    }
    
    if (!user || !supabase) {
      console.log("⚠️ 用戶或 Supabase 客戶端不存在")
      return
    }

    try {
      console.log("🔄 設置 saving 狀態為 true")
      setSaving(true)

      // 儲存所有欄位，包括配送方式（安全處理可能的 null/undefined）
      const profileData = {
        id: user.id,
        name: (profile.name || "").trim(),
        email: (profile.email || "").trim(),
        phone: (profile.phone || "").trim(),
        address: (profile.address || "").trim(),
        city: (profile.city || "").trim(),
        postal_code: (profile.postal_code || "").trim(),
        country: (profile.country || "台灣").trim(),
        "711": (profile["711"] || "").trim(),
        delivery_method: profile.delivery_method || "",
        updated_at: new Date().toISOString(),
      }

      console.log("📤 準備儲存的資料:", profileData)
      console.log("📊 資料欄位檢查:", {
        hasName: !!profileData.name,
        hasEmail: !!profileData.email,
        hasPhone: !!profileData.phone,
        hasDeliveryMethod: !!profileData.delivery_method,
        deliveryMethod: profileData.delivery_method,
      })

      // 使用 upsert 來插入或更新記錄（添加超時保護）
      console.log("📡 開始 Supabase upsert 請求...")
      
      const upsertPromise = supabase
        .from("user_profiles")
        .upsert(profileData, { onConflict: "id" })
        .select()
      
      // 設置 10 秒超時
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("儲存請求超時（10秒）")), 10000)
      )
      
      const { error, data } = await Promise.race([upsertPromise, timeoutPromise]) as any

      if (error) {
        console.error("❌ Supabase 儲存失敗:", error)
        throw error
      }

      console.log("✅ Supabase 儲存成功:", data)

      // 更新原始資料，清除變更狀態
      setOriginalProfile({ ...profile })
      console.log("✅ 已更新 originalProfile")
      
      toast({
        title: "儲存成功",
        description: "個人資料已成功更新！",
      })
      
      console.log("✅ Toast 顯示成功")
    } catch (error) {
      console.error("❌ 儲存個人資料失敗:", error)
      const errorMessage = error instanceof Error ? error.message : "未知錯誤"
      toast({
        variant: "destructive",
        title: "儲存失敗",
        description: `儲存失敗：${errorMessage}。請稍後再試。`,
      })
      console.log("❌ 錯誤 Toast 顯示完成")
    } finally {
      console.log("🔄 設置 saving 狀態為 false")
      setSaving(false)
      console.log("✅ handleSave 完成")
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
          </CardContent>
        </Card>

        {/* 新的地址填寫表單 */}
        <AddressForm
          initialData={addressFormInitialData}
          onDataChange={handleAddressFormChange}
        />

        <Card className="border-[#E8E2D9] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-light text-[#6D5C4A] tracking-wide">
              <CreditCard className="w-5 h-5 mr-2" />
              付款與訂閱
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges() || saving || !addressFormValid}
                className="bg-[#A69E8B] hover:bg-[#8A7B6C] text-white rounded-none text-sm font-light tracking-widest uppercase disabled:opacity-50"
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
            
            {!addressFormValid && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                ⚠️ 請先完成配送地址設定才能儲存
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AuthGuard>
  )
}
