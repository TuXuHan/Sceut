"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Script from "next/script"
import { useAuth } from "@/app/auth-provider"
import { getTapPayConfig } from "@/lib/actions/tappay-config"

const AMOUNT = 1

// TapPay 全域物件型別定義
declare global {
  interface Window {
    TPDirect: {
      setupSDK: (appId: string, appKey: string, serverType: "sandbox" | "production") => void
      card: {
        setup: (config: {
          fields: {
            number: { element: string; placeholder: string }
            expirationDate: { element: string; placeholder: string }
            ccv: { element: string; placeholder: string }
          }
          styles: Record<string, Record<string, string>>
          isMaskCreditCardNumber?: boolean
          maskCreditCardNumberRange?: {
            beginIndex: number
            endIndex: number
          }
        }) => number
        onUpdate: (callback: (update: any) => void) => void
        getPrime: (callback: (result: any) => void) => void
        getTappayFieldsStatus: () => any
      }
    }
  }
}

interface TapPayPaymentFormProps {
  amount: number
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: string) => void
  disabled?: boolean
}

export default function TapPayPaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled,
}: TapPayPaymentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [tapPayConfig, setTapPayConfig] = useState<{
    appId: string
    appKey: string
    serverType: "sandbox" | "production"
  } | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getTapPayConfig()
        setTapPayConfig(config)
      } catch (error) {
        console.error("Failed to fetch TapPay configuration:", error)
        onPaymentError("TapPay configuration error")
      }
    }

    fetchConfig()
  }, [onPaymentError])

  useEffect(() => {
    if (typeof window === "undefined" || !tapPayConfig) return

    const initTapPay = () => {
      const TPDirect = window.TPDirect

      const { appId, appKey, serverType } = tapPayConfig

      // 1. setup SDK
      TPDirect.setupSDK(appId, appKey, serverType)

      // 2. setup fields
      TPDirect.card.setup({
        fields: {
          number: {
            element: "#card-number",
            placeholder: "**** **** **** ****",
          },
          expirationDate: {
            element: "#card-expiration-date",
            placeholder: "MM / YY",
          },
          ccv: {
            element: "#card-ccv",
            placeholder: "後三碼",
          },
        },
        styles: {
          input: {
            color: "gray",
          },
          ".valid": {
            color: "green",
          },
          ".invalid": {
            color: "red",
          },
        },
        isMaskCreditCardNumber: true,
        maskCreditCardNumberRange: {
          beginIndex: 6,
          endIndex: 11,
        },
      })

      // 3. monitor updates
      TPDirect.card.onUpdate((update: any) => {
        console.log("Update:", update)
      })
    }

    if (window.TPDirect) {
      initTapPay()
    } else {
      // If script isn't loaded yet, wait for it
      window.addEventListener("tappayReady", initTapPay)
    }
  }, [tapPayConfig])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const TPDirect = window.TPDirect
    const status = TPDirect.card.getTappayFieldsStatus()

    if (!status.canGetPrime) {
      alert("請完整填寫信用卡資訊")
      return
    }

    TPDirect.card.getPrime(async (result: any) => {
      if (result.status !== 0) {
        alert("獲取付款資訊失敗: " + result.msg)
        return
      }

      const prime = result.card.prime
      console.log("Prime: " + prime)

      try {
        console.log("🔍 Sending payment request with user_id:", user?.id)
        const response = await fetch("/api/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            prime,
            amount: AMOUNT,
          }),
        })
        console.log("🔍 Payment response:", response.status)

        const getPaymentURL = await response.json()

        if (getPaymentURL.success) {
          window.location.href = getPaymentURL.paymentResult.payment_url

          console.log("🔍 Payment successful, creating subscription...")

          // Create subscription record
          const subscriptionResponse = await fetch("/api/subscriptions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user?.id,
              paymentResult: getPaymentURL.paymentResult,
              profile: getPaymentURL.profile,
              amount: AMOUNT,
            }),
          })

          const subscriptionResult = await subscriptionResponse.json()

          if (subscriptionResult.success) {
            console.log("🔍 Subscription created successfully:", subscriptionResult)
            onPaymentSuccess(getPaymentURL)
          } else {
            console.error("🔍 Failed to create subscription:", subscriptionResult)
            alert("付款成功，但訂閱記錄創建失敗: " + subscriptionResult.message)
            onPaymentError("Subscription creation failed: " + subscriptionResult.message)
          }
        } else {
          console.log("🔍 Payment result:", getPaymentURL)
          if (response.status === 402) {
            alert("付款失敗: " + getPaymentURL.message)
            window.location.href = "/member-center/profile"
            onPaymentError(getPaymentURL.message)
          } else {
            alert("付款失敗: " + getPaymentURL.message)
            onPaymentError(getPaymentURL.message)
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "付款處理發生錯誤"
        alert("付款錯誤: " + errorMessage)
        onPaymentError(errorMessage)
      }
    })
  }

  if (!tapPayConfig) {
    return (
      <div className="max-w-md mx-auto space-y-4 p-6">
        <div className="text-center text-gray-600">載入付款系統中...</div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://js.tappaysdk.com/sdk/tpdirect/v5.19.2"
        strategy="afterInteractive"
        onLoad={() => {
          window.dispatchEvent(new Event("tappayReady"))
        }}
      />
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">信用卡號碼</label>
          <div className="tpfield" id="card-number"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">到期日期</label>
            <div className="tpfield" id="card-expiration-date"></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">安全碼</label>
            <div className="tpfield" id="card-ccv"></div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#A69E8B] hover:bg-[#8A7B6C] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          確認付款 NT$ {amount.toLocaleString()}
        </button>
      </form>

      <style jsx>{`
         .tpfield, .form-field {
           height: 40px;
           width: 100%;
           border: 1px solid #d1d5db;
           border-radius: 6px;
           padding: 8px 12px;
           font-size: 14px;
           transition: border-color 0.2s, box-shadow 0.2s;
           background-color: white;
         }
         
         .form-field:focus {
           outline: none;
           border-color: #66afe9;
           box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
             0 0 8px rgba(102, 175, 233, 0.6);
         }
         
         .tappay-field-focus {
           border-color: #66afe9 !important;
           outline: 0;
           box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
             0 0 8px rgba(102, 175, 233, 0.6);
         }
       `}</style>
    </>
  )
}
