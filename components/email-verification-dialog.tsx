"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { resendVerificationEmail, checkEmailVerificationStatus } from "@/lib/email-verification"
import { Loader2, Mail, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

interface EmailVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  onVerificationComplete?: () => void
}

export function EmailVerificationDialog({
  open,
  onOpenChange,
  email,
  onVerificationComplete,
}: EmailVerificationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [verificationStatus, setVerificationStatus] = useState<any>(null)

  const handleResendEmail = async () => {
    setLoading(true)
    setMessage("")

    try {
      console.log("[v0] 用戶點擊重新發送驗證郵件:", email)
      const result = await resendVerificationEmail(email)
      console.log("[v0] 重新發送結果:", result)

      if (result.success) {
        setMessage(result.message || "驗證郵件已重新發送")
        setMessageType("success")
      } else {
        setMessage(result.error || "重發郵件失敗")
        setMessageType("error")
      }
    } catch (error) {
      console.error("[v0] 重發郵件時發生錯誤:", error)
      setMessage("重發郵件時發生錯誤")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    setCheckingStatus(true)
    setMessage("")

    try {
      const status = await checkEmailVerificationStatus(email)
      setVerificationStatus(status)

      if (status.verified) {
        setMessage("您的郵箱已驗證！可以關閉此對話框並重新登入。")
        setMessageType("success")
        onVerificationComplete?.()
      } else if (status.exists) {
        setMessage("郵箱尚未驗證，請檢查您的郵箱（包括垃圾郵件資料夾）")
        setMessageType("info")
      } else {
        setMessage("找不到此郵箱的註冊記錄")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("檢查驗證狀態時發生錯誤")
      setMessageType("error")
    } finally {
      setCheckingStatus(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            郵箱驗證
          </DialogTitle>
          <DialogDescription>
            我們已向 <strong>{email}</strong> 發送了驗證郵件。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {message && (
            <div className={`p-3 rounded border flex items-start gap-2 ${getMessageClass()}`}>
              {getMessageIcon()}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium">請按照以下步驟完成驗證：</h4>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>檢查您的郵箱收件匣</li>
              <li>如果沒有找到郵件，請檢查垃圾郵件資料夾</li>
              <li>點擊郵件中的驗證連結</li>
              <li>返回此頁面並點擊「檢查驗證狀態」</li>
            </ol>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleCheckStatus} disabled={checkingStatus} className="w-full" variant="default">
              {checkingStatus ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  檢查中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  檢查驗證狀態
                </>
              )}
            </Button>

            <Button onClick={handleResendEmail} disabled={loading} variant="outline" className="w-full bg-transparent">
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  發送中...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  重新發送驗證郵件
                </>
              )}
            </Button>
          </div>

          {verificationStatus && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>狀態詳情：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>用戶存在: {verificationStatus.exists ? "是" : "否"}</li>
                <li>已驗證: {verificationStatus.verified ? "是" : "否"}</li>
                {verificationStatus.confirmationSentAt && (
                  <li>驗證郵件發送時間: {new Date(verificationStatus.confirmationSentAt).toLocaleString()}</li>
                )}
              </ul>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>
              <strong>提示：</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>驗證郵件可能需要幾分鐘才能送達</li>
              <li>請確保檢查垃圾郵件資料夾</li>
              <li>如果持續收不到郵件，請聯繫客服</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  function getMessageIcon() {
    switch (messageType) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Mail className="w-4 h-4 text-blue-600" />
    }
  }

  function getMessageClass() {
    switch (messageType) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }
}
