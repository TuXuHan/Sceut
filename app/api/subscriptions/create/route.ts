import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendSubscriptionConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("=== 開始處理訂閱創建請求 ===")
    
    const body = await request.json()
    console.log("📥 收到的請求資料:", JSON.stringify(body, null, 2))
    
    const { userId, periodNo, authTime, periodAmt, selectedPerfume, userProfile, merchantOrderNo } = body

    if (!userId || !periodNo || !authTime || !periodAmt) {
      console.log("❌ 缺少必要欄位")
      console.log("userId:", userId)
      console.log("periodNo:", periodNo)
      console.log("authTime:", authTime)
      console.log("periodAmt:", periodAmt)
      return NextResponse.json({ 
        error: "缺少必要欄位",
        missing: {
          userId: !userId,
          periodNo: !periodNo,
          authTime: !authTime,
          periodAmt: !periodAmt
        }
      }, { status: 400 })
    }

    console.log("✅ 必要欄位檢查通過")
    console.log("authTime", authTime)

    // Parse auth time to get payment date
    console.log("📅 開始解析 authTime...")
    const authTimeStr = authTime.toString()
    console.log("authTimeStr:", authTimeStr)
    
    try {
      const year = Number.parseInt(authTimeStr.substring(0, 4))
      const month = Number.parseInt(authTimeStr.substring(4, 6))
      const day = Number.parseInt(authTimeStr.substring(6, 8))
      const hour = Number.parseInt(authTimeStr.substring(8, 10))
      const minute = Number.parseInt(authTimeStr.substring(10, 12))
      const second = Number.parseInt(authTimeStr.substring(12, 14))

      console.log(`解析結果: ${year}-${month}-${day} ${hour}:${minute}:${second}`)

      const lastPaymentDate = new Date(year, month - 1, day, hour, minute, second)
      const nextPaymentDate = new Date(year, month - 1, day, hour, minute, second)
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
      
      console.log("上次付款日期:", lastPaymentDate.toISOString())
      console.log("下次付款日期:", nextPaymentDate.toISOString())
    } catch (parseError) {
      console.error("❌ 解析 authTime 失敗:", parseError)
      throw new Error(`解析 authTime 失敗: ${parseError}`)
    }

    const lastPaymentDate = new Date(
      Number.parseInt(authTimeStr.substring(0, 4)),
      Number.parseInt(authTimeStr.substring(4, 6)) - 1,
      Number.parseInt(authTimeStr.substring(6, 8)),
      Number.parseInt(authTimeStr.substring(8, 10)),
      Number.parseInt(authTimeStr.substring(10, 12)),
      Number.parseInt(authTimeStr.substring(12, 14))
    )
    const nextPaymentDate = new Date(lastPaymentDate)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

    // Prepare subscription data
    const subscriptionData = {
      user_id: userId,
      name: userProfile?.full_name || userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.phone || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      postal_code: userProfile?.postal_code || "",
      country: userProfile?.country || "台灣",
      subscription_status: "active",
      payment_status: "paid",
      payment_method: "CREDIT",
      monthly_fee: Number.parseInt(periodAmt),
      period_no: periodNo,
      merchant_order_no: merchantOrderNo,
      created_at: lastPaymentDate.toISOString(),
      last_payment_date: lastPaymentDate.toISOString(),
      next_payment_date: nextPaymentDate.toISOString(),
      payment_data: {
        period_no: periodNo,
        auth_time: authTime,
        period_amt: periodAmt,
        selected_perfume: selectedPerfume,
        merchant_order_no: merchantOrderNo,
      },
      updated_at: new Date().toISOString(),
    }

    console.log("📝 準備寫入的訂閱資料:", JSON.stringify(subscriptionData, null, 2))

    // Upsert into subscribers table (insert or update if user_id already exists)
    console.log("💾 開始寫入 Supabase...")
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .upsert(subscriptionData, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase 寫入錯誤:", error)
      console.error("錯誤詳情:", JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: "建立訂閱失敗", 
        details: error,
        supabaseError: {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      }, { status: 500 })
    }

    console.log("✅ 訂閱創建成功!")
    console.log("📦 返回的資料:", JSON.stringify(data, null, 2))

    // 發送訂閱確認郵件
    if (data.email) {
      console.log("📧 準備發送訂閱確認郵件...")
      const emailResult = await sendSubscriptionConfirmationEmail({
        to: data.email,
        userName: data.name || "用戶",
        subscriptionId: data.id,
        periodNo: data.period_no,
        monthlyFee: data.monthly_fee,
        nextPaymentDate: data.next_payment_date,
        perfumeName: selectedPerfume?.name,
        perfumeBrand: selectedPerfume?.brand,
      })

      if (emailResult.success) {
        console.log("✅ 訂閱確認郵件發送成功")
      } else {
        console.log("⚠️ 訂閱確認郵件發送失敗，但不影響訂閱創建:", emailResult.error)
      }
    } else {
      console.log("⚠️ 無法發送郵件：用戶沒有提供電子郵件地址")
    }

    return NextResponse.json({
      success: true,
      subscription: data,
    })
  } catch (error) {
    console.error("❌ 創建訂閱時發生錯誤:", error)
    console.error("錯誤堆疊:", error instanceof Error ? error.stack : "無堆疊資訊")
    
    return NextResponse.json({ 
      error: "伺服器內部錯誤",
      message: error instanceof Error ? error.message : "未知錯誤",
      type: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 })
  }
}
