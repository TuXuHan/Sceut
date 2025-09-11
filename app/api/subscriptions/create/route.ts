import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, periodNo, authTime, periodAmt, selectedPerfume, userProfile, merchantOrderNo } = body

    if (!userId || !periodNo || !authTime || !periodAmt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("authTime", authTime)

    // Parse auth time to get payment date
    const authTimeStr = authTime.toString()
    const year = Number.parseInt(authTimeStr.substring(0, 4))
    const month = Number.parseInt(authTimeStr.substring(4, 6))
    const day = Number.parseInt(authTimeStr.substring(6, 8))
    const hour = Number.parseInt(authTimeStr.substring(8, 10))
    const minute = Number.parseInt(authTimeStr.substring(10, 12))
    const second = Number.parseInt(authTimeStr.substring(12, 14))

    const lastPaymentDate = new Date(year, month - 1, day, hour, minute, second)
    const nextPaymentDate = new Date(year, month - 1, day, hour, minute, second)
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

    console.log("Creating subscription with data:", subscriptionData)

    // Upsert into subscribers table (insert or update if user_id already exists)
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .upsert(subscriptionData, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create subscription", details: error }, { status: 500 })
    }

    console.log("Subscription created successfully:", data)

    return NextResponse.json({
      success: true,
      subscription: data,
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
