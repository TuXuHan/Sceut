import { NextRequest, NextResponse } from "next/server"
import { parsePeriodicPaymentResponse } from "@/lib/newebpay"
import { createClient } from "@supabase/supabase-js"

/* -----------------------------
   Supabase (Service Role)
----------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 🔥 一定要用這個
)

/* -----------------------------
   Utils
----------------------------- */
function parseNewebPayDate(dateStr?: string) {
  if (!dateStr) return null

  const s = String(dateStr).trim()

  // yyyyMMdd
  if (/^\d{8}$/.test(s)) {
    // NewebPay 多以台灣時間表示；用 +08:00 明確指定時區
    return new Date(
      `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00+08:00`
    )
  }

  // yyyyMMddHHmmss
  if (/^\d{14}$/.test(s)) {
    return new Date(
      `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T` +
      `${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}+08:00`
    )
  }

  // yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(`${s}T00:00:00+08:00`)
  }

  // yyyy-MM-dd HH:mm:ss (NewebPay 文件常見格式)
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s)) {
    return new Date(`${s.replace(" ", "T")}+08:00`)
  }

  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

/* -----------------------------
   Main Processor
----------------------------- */
async function processPeriodicPaymentCallback(result: any) {
  console.log("▶ Processing periodic payment:", result)

  const periodNoRaw = result?.PeriodNo ?? result?.periodNo
  const periodNo = periodNoRaw ? String(periodNoRaw).trim() : ""
  const merchantOrderNo = result?.MerchantOrderNo ?? result?.MerOrderNo

  // 兼容欄位：每期通知多為 AuthDate / NextAuthDate；建立委託會是 AuthTime
  const authDateStr = result?.AuthDate ?? result?.AuthTime
  const nextAuthDateStr = result?.NextAuthDate ?? result?.NewNextTime
  const authAmt = result?.AuthAmt ?? result?.PeriodAmt
  const alreadyTimesRaw = result?.AlreadyTimes ?? result?.AuthTimes
  const totalTimesRaw = result?.TotalTimes ?? result?.PeriodTimes
  const authCode = result?.AuthCode
  const tradeNo = result?.TradeNo
  const respondCode = result?.RespondCode

  /* ---------- Find subscription ---------- */
  let subscriptionQuery = supabase
    .from("subscribers")
    .select("*")
  if (periodNo) subscriptionQuery = subscriptionQuery.eq("period_no", periodNo)

  let { data: subscription, error: findError } = await subscriptionQuery.maybeSingle()

  // fallback：若 period_no 找不到，改用 merchant_order_no（有些情境 period_no 可能沒落庫）
  if (!subscription && merchantOrderNo) {
    const retry = await supabase
      .from("subscribers")
      .select("*")
      .eq("merchant_order_no", String(merchantOrderNo).trim())
      .maybeSingle()
    subscription = retry.data
    findError = findError ?? retry.error
  }

  if (findError) {
    console.error("❌ Find subscription failed:", findError)
    return
  }

  if (!subscription) {
    console.error("❌ Subscription not found:", { periodNo, merchantOrderNo })
    return
  }

  /* ---------- Parse dates ---------- */
  const authDate = parseNewebPayDate(authDateStr)
  const nextAuthDate = parseNewebPayDate(nextAuthDateStr)

  if (!authDate) {
    console.error("❌ Invalid AuthDate/AuthTime:", authDateStr)
    return
  }

  /* ---------- Determine status ---------- */
  const already = Number(alreadyTimesRaw)
  const total = Number(totalTimesRaw)
  const canComputeStatus = Number.isFinite(already) && Number.isFinite(total) && total > 0
  const subscription_status = canComputeStatus
    ? (already >= total ? "completed" : "active")
    : (subscription.subscription_status ?? "active")

  /* ---------- Update ---------- */
  const nowIso = new Date().toISOString()
  const existingPaymentData = (subscription.payment_data ?? {}) as any
  const existingEvents: any[] = Array.isArray(existingPaymentData?.newebpay_events)
    ? existingPaymentData.newebpay_events
    : []
  const newEvent = {
    received_at: nowIso,
    period_no: periodNo || subscription.period_no,
    merchant_order_no: merchantOrderNo ?? null,
    // 保存原始回傳欄位，方便追查 callback 是否有進來、進來帶了什麼
    result,
  }
  const mergedEvents = [...existingEvents, newEvent].slice(-30)

  const updatePayload = {
    last_payment_date: authDate.toISOString(),
    next_payment_date: nextAuthDate?.toISOString() ?? null,
    payment_status: "paid",
    subscription_status,
    monthly_fee: authAmt != null ? Number(authAmt) : subscription.monthly_fee,
    updated_at: nowIso,
    payment_data: {
      ...existingPaymentData,
      last_auth_date: authDateStr ?? null,
      last_auth_date_iso: authDate.toISOString(),
      last_auth_amount: authAmt ?? null,
      last_auth_code: authCode ?? null,
      last_trade_no: tradeNo ?? null,
      already_times: Number.isFinite(already) ? already : null,
      total_times: Number.isFinite(total) ? total : null,
      respond_code: respondCode ?? null,
      next_auth_date: nextAuthDateStr ?? null,
      newebpay_events: mergedEvents,
    },
  }

  const { error: updateError } = await supabase
    .from("subscribers")
    .update(updatePayload)
    .eq("id", subscription.id)

  if (updateError) {
    console.error("❌ Update subscription failed:", updateError)
    return
  }

  console.log("✅ Subscription updated:", { periodNo: subscription.period_no, id: subscription.id })
}

/* -----------------------------
   Route Handler
----------------------------- */
export async function POST(request: NextRequest) {
  try {
    console.log("📩 NewebPay callback received")
    console.log("Request URL:", request.url)
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))

    // NewebPay 可能送 multipart/form-data 或 x-www-form-urlencoded
    // 為避免解析失敗，先嘗試 formData；失敗則回退到 text + URLSearchParams
    let callbackData: Record<string, any> = {}
    try {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        callbackData[key] = value
      }
    } catch (e) {
      const raw = await request.text()
      const params = new URLSearchParams(raw)
      callbackData = Object.fromEntries(params.entries())
    }

    console.log("Raw callback data:", callbackData)

    const periodEncrypted = callbackData.Period ?? callbackData.period
    if (!periodEncrypted) {
      return NextResponse.json({
        success: true,
        message: "Callback received (non-periodic)",
        data: callbackData,
      })
    }

    const parsed = parsePeriodicPaymentResponse(periodEncrypted)
    console.log("Parsed periodic response:", parsed)

    if (parsed.Status === "SUCCESS" && parsed.Result) {
      await processPeriodicPaymentCallback(parsed.Result)
    } else {
      console.warn("⚠ Periodic payment not success:", parsed)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Callback error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/* -----------------------------
   GET
----------------------------- */
export async function GET() {
  return NextResponse.json({
    message: "NewebPay Callback API",
  })
}
