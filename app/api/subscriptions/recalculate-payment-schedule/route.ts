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

/**
 * 根據 created_at 和目前時間推算應該的期數
 */
function calculateCurrentPeriod(createdAt: Date, periodType: string = "M"): number {
  const now = new Date()
  const diffMs = now.getTime() - createdAt.getTime()
  
  if (periodType === "M") {
    // 每月扣款
    const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
    return Math.max(1, months + 1) // 至少是第 1 期
  } else if (periodType === "D") {
    // 固定天期
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return Math.max(1, days + 1)
  } else if (periodType === "W") {
    // 每週
    const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
    return Math.max(1, weeks + 1)
  } else if (periodType === "Y") {
    // 每年
    const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))
    return Math.max(1, years + 1)
  }
  
  return 1
}

/**
 * 計算下次扣款日期
 */
function calculateNextPaymentDate(lastPaymentDate: Date, periodType: string = "M"): Date {
  const next = new Date(lastPaymentDate)
  
  if (periodType === "M") {
    next.setMonth(next.getMonth() + 1)
  } else if (periodType === "D") {
    next.setDate(next.getDate() + 1)
  } else if (periodType === "W") {
    next.setDate(next.getDate() + 7)
  } else if (periodType === "Y") {
    next.setFullYear(next.getFullYear() + 1)
  }
  
  return next
}

/**
 * 從 payment_data 中提取總期數
 */
function extractTotalTimes(paymentData: any): number | null {
  if (!paymentData) return null
  
  // 嘗試多個可能的欄位名
  const totalTimes = 
    paymentData.total_times ||
    paymentData.TotalTimes ||
    paymentData.auth_times ||
    paymentData.AuthTimes ||
    paymentData.PeriodTimes ||
    paymentData.period_times
  
  if (totalTimes) {
    return Number(totalTimes)
  }
  
  return null
}

/**
 * 從 payment_data 中提取週期類型
 */
function extractPeriodType(paymentData: any): string {
  if (!paymentData) return "M"
  
  const periodType = 
    paymentData.period_type ||
    paymentData.PeriodType
  
  return periodType || "M"
}

/* -----------------------------
   Main Function
----------------------------- */
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 開始重新計算扣款排程...")

    // 獲取所有活躍的訂閱記錄
    const { data: subscriptions, error: fetchError } = await supabase
      .from("subscribers")
      .select("*")
      .in("subscription_status", ["active", "paid"])

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
      completed: 0,
      errors: [] as Array<{ id: any; period_no: string | null; error: string }>,
    }

    // 處理每一筆訂閱記錄
    for (const subscription of subscriptions) {
      try {
        // 1. 確定第一期扣款時間（使用 created_at）
        const createdAt = subscription.created_at 
          ? new Date(subscription.created_at)
          : null

        if (!createdAt || isNaN(createdAt.getTime())) {
          console.error(`❌ 無效的 created_at: ${subscription.created_at} (訂閱 ${subscription.period_no || subscription.id})`)
          results.errors.push({
            id: subscription.id,
            period_no: subscription.period_no || null,
            error: `無效的 created_at: ${subscription.created_at}`,
          })
          continue
        }

        // 2. 提取總期數和週期類型
        const totalTimes = extractTotalTimes(subscription.payment_data)
        const periodType = extractPeriodType(subscription.payment_data)

        // 3. 計算目前應該是第幾期
        const currentPeriod = calculateCurrentPeriod(createdAt, periodType)

        // 4. 計算上次和下次扣款日期
        const lastPaymentDate = new Date(createdAt)
        if (periodType === "M") {
          lastPaymentDate.setMonth(lastPaymentDate.getMonth() + (currentPeriod - 1))
        } else if (periodType === "D") {
          lastPaymentDate.setDate(lastPaymentDate.getDate() + (currentPeriod - 1))
        } else if (periodType === "W") {
          lastPaymentDate.setDate(lastPaymentDate.getDate() + ((currentPeriod - 1) * 7))
        } else if (periodType === "Y") {
          lastPaymentDate.setFullYear(lastPaymentDate.getFullYear() + (currentPeriod - 1))
        }

        const nextPaymentDate = calculateNextPaymentDate(lastPaymentDate, periodType)

        // 5. 判斷訂閱狀態
        let subscriptionStatus = subscription.subscription_status
        if (totalTimes && currentPeriod >= totalTimes) {
          subscriptionStatus = "completed"
          results.completed++
        }

        // 6. 更新資料庫
        const updatePayload: any = {
          last_payment_date: lastPaymentDate.toISOString(),
          next_payment_date: nextPaymentDate.toISOString(),
          subscription_status: subscriptionStatus,
          updated_at: new Date().toISOString(),
          payment_data: {
            ...(subscription.payment_data ?? {}),
            already_times: currentPeriod,
            total_times: totalTimes || subscription.payment_data?.total_times || null,
            period_type: periodType,
            last_recalculated_at: new Date().toISOString(),
          },
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
          `第 ${currentPeriod} 期${totalTimes ? `/${totalTimes}` : ""}, ` +
          `上次 ${lastPaymentDate.toISOString()}, 下次 ${nextPaymentDate.toISOString()}, ` +
          `狀態 ${subscriptionStatus}`
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

    console.log("✅ 重新計算完成!")
    console.log(
      `📊 統計: 總共 ${results.total} 筆, ` +
      `更新 ${results.updated} 筆, ` +
      `完成 ${results.completed} 筆, ` +
      `跳過 ${results.skipped} 筆, ` +
      `錯誤 ${results.errors.length} 筆`
    )

    return NextResponse.json({
      success: true,
      message: "扣款排程重新計算完成",
      results,
    })
  } catch (error) {
    console.error("❌ 重新計算扣款排程時發生錯誤:", error)
    return NextResponse.json(
      {
        success: false,
        error: "重新計算扣款排程失敗",
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
      .select("*")
      .in("subscription_status", ["active", "paid"])

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
        const createdAt = sub.created_at ? new Date(sub.created_at) : null
        if (!createdAt || isNaN(createdAt.getTime())) {
          return null
        }

        const totalTimes = extractTotalTimes(sub.payment_data)
        const periodType = extractPeriodType(sub.payment_data)
        const currentPeriod = calculateCurrentPeriod(createdAt, periodType)

        const lastPaymentDate = new Date(createdAt)
        if (periodType === "M") {
          lastPaymentDate.setMonth(lastPaymentDate.getMonth() + (currentPeriod - 1))
        }

        const nextPaymentDate = calculateNextPaymentDate(lastPaymentDate, periodType)

        let subscriptionStatus = sub.subscription_status
        if (totalTimes && currentPeriod >= totalTimes) {
          subscriptionStatus = "completed"
        }

        return {
          id: sub.id,
          period_no: sub.period_no,
          current_last_payment_date: sub.last_payment_date,
          current_next_payment_date: sub.next_payment_date,
          current_subscription_status: sub.subscription_status,
          new_last_payment_date: lastPaymentDate.toISOString(),
          new_next_payment_date: nextPaymentDate.toISOString(),
          new_subscription_status: subscriptionStatus,
          calculated_period: currentPeriod,
          total_times: totalTimes,
          period_type: periodType,
          created_at: sub.created_at,
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

