import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/* -----------------------------
   Supabase (Service Role)
----------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/* -----------------------------
   Utils
----------------------------- */
function parseNewebPayDate(dateStr?: string) {
  if (!dateStr) return null

  // yyyyMMdd
  if (/^\d{8}$/.test(dateStr)) {
    return new Date(
      `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
    )
  }

  // yyyyMMddHHmmss
  if (/^\d{14}$/.test(dateStr)) {
    return new Date(
      `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T` +
      `${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}`
    )
  }

  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

// 從訂閱資料中推導「最後扣款時間」
function inferLastChargeDate(subscription: any): Date | null {
  const pd = subscription?.payment_data || {}
  // 可能的欄位（依優先序）
  const candidates = [
    pd.last_auth_date,
    pd.auth_time,
    pd.AuthDate,
    pd.PaymentDate,
    subscription.last_payment_date,
    subscription.created_at,
  ]
  for (const value of candidates) {
    const parsed = parseNewebPayDate(value)
    if (parsed) return parsed
  }
  return null
}

/* -----------------------------
   Main Function
----------------------------- */
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 開始重新整理扣款時間...")

    // 獲取所有有 payment_data 的訂閱記錄
    const { data: subscriptions, error: fetchError } = await supabase
      .from("subscribers")
      .select("id, period_no, payment_data, last_payment_date, next_payment_date, created_at")
      .not("payment_data", "is", null)

    if (fetchError) {
      console.error("❌ 獲取訂閱記錄失敗:", fetchError)
      return NextResponse.json(
        { success: false, error: "獲取訂閱記錄失敗", details: fetchError },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "沒有找到需要處理的訂閱記錄",
        processed: 0,
      })
    }

    console.log(`📊 找到 ${subscriptions.length} 筆訂閱記錄需要處理`)

    const results = {
      total: subscriptions.length,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ id: any; period_no: string | null; error: string }>,
    }

    // 處理每一筆訂閱記錄
    for (const subscription of subscriptions) {
      try {
        const paymentData = subscription.payment_data as any
        // 推導扣款日期（兼容多種欄位）
        const parsedDate = inferLastChargeDate(subscription)

        if (!parsedDate) {
          console.log(`⏭️  跳過訂閱 ${subscription.period_no || subscription.id}: 找不到可用的扣款日期欄位`)
          results.skipped++
          continue
        }

        // 計算下次扣款日期（通常是下個月同一天）
        const nextPaymentDate = new Date(parsedDate)
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

        // 如果已經有 next_auth_date，使用它
        const nextAuthDateRaw = (paymentData?.next_auth_date ?? paymentData?.NextAuthDate)
        const nextAuthDate = nextAuthDateRaw
          ? parseNewebPayDate(nextAuthDateRaw)
          : null

        const finalNextDate = nextAuthDate || nextPaymentDate

        // 更新資料庫
        const updatePayload: any = {
          last_payment_date: parsedDate.toISOString(),
          next_payment_date: finalNextDate.toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: updateError } = await supabase
          .from("subscribers")
          .update(updatePayload)
          .eq("id", subscription.id)

        if (updateError) {
          console.error(`❌ 更新失敗 (訂閱 ${subscription.period_no || subscription.id}):`, updateError)
          results.errors.push({
            id: subscription.id,
            period_no: subscription.period_no || null,
            error: updateError.message,
          })
          continue
        }

        console.log(
          `✅ 已更新訂閱 ${subscription.period_no || subscription.id}: ` +
          `上次扣款 ${parsedDate.toISOString()}, 下次扣款 ${finalNextDate.toISOString()}`
        )
        results.updated++
      } catch (error) {
        console.error(`❌ 處理訂閱 ${subscription.period_no || subscription.id} 時發生錯誤:`, error)
        results.errors.push({
          id: subscription.id,
          period_no: subscription.period_no || null,
          error: error instanceof Error ? error.message : "未知錯誤",
        })
      }
    }

    console.log("✅ 重新整理完成!")
    console.log(`📊 統計: 總共 ${results.total} 筆, 更新 ${results.updated} 筆, 跳過 ${results.skipped} 筆, 錯誤 ${results.errors.length} 筆`)

    return NextResponse.json({
      success: true,
      message: "扣款時間重新整理完成",
      results,
    })
  } catch (error) {
    console.error("❌ 重新整理扣款時間時發生錯誤:", error)
    return NextResponse.json(
      {
        success: false,
        error: "重新整理扣款時間失敗",
        details: error instanceof Error ? error.message : "未知錯誤",
      },
      { status: 500 }
    )
  }
}

/* -----------------------------
   GET - 預覽模式（不實際更新）
----------------------------- */
export async function GET(request: NextRequest) {
  try {
    console.log("👀 預覽模式：檢查需要更新的記錄...")

    const { data: subscriptions, error: fetchError } = await supabase
      .from("subscribers")
      .select("id, period_no, payment_data, last_payment_date, next_payment_date, created_at")
      .not("payment_data", "is", null)

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: "獲取訂閱記錄失敗", details: fetchError },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "沒有找到需要處理的訂閱記錄",
        preview: [],
      })
    }

    const preview = subscriptions
      .map((sub) => {
        const parsedDate = inferLastChargeDate(sub)
        if (!parsedDate) return null
        const nextPaymentDate = new Date(parsedDate)
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
        return {
          id: sub.id,
          period_no: sub.period_no,
          current_last_payment_date: sub.last_payment_date,
          current_next_payment_date: sub.next_payment_date,
          new_last_payment_date: parsedDate.toISOString(),
          new_next_payment_date: nextPaymentDate.toISOString(),
        }
      })
      .filter((item) => item !== null)

    return NextResponse.json({
      success: true,
      message: "預覽模式：以下是將要更新的記錄",
      total: subscriptions.length,
      preview,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "預覽失敗",
        details: error instanceof Error ? error.message : "未知錯誤",
      },
      { status: 500 }
    )
  }
}
