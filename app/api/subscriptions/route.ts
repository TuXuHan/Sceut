import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if monthly_fee column exists, if not return empty array
    const { data: subscriptions, error } = await supabase
      .from("subscribers")
      .select(`
        id,
        user_id,
        subscription_status,
        created_at,
        updated_at,
        monthly_fee
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("獲取訂閱記錄失敗:", error)

      // If the error is about missing column, return empty array
      if (error.message.includes("column") && error.message.includes("does not exist")) {
        console.warn("Database schema issue detected, returning empty subscriptions")
        return NextResponse.json({ subscriptions: [] })
      }

      return NextResponse.json({ error: "獲取訂閱記錄失敗", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ subscriptions: subscriptions || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "服務器錯誤", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { user_id, paymentResult, profile, amount } = await req.json()

    if (!user_id || !paymentResult || !profile || !amount) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required data for subscription creation." 
      }, { status: 400 })
    }

    // Create subscription record
    const currentDate = new Date()
    const nextPaymentDate = new Date(currentDate)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1) // Next month

    const { error: insertError } = await supabase.from("subscribers").upsert({
      user_id: user_id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      postal_code: profile.postal_code,
      country: profile.country,
      subscription_status: "active",
      monthly_fee: amount,
      payment_method: paymentResult.card_info.type,
      payment_status: "active",
      last_payment_date: currentDate.toISOString(),
      next_payment_date: nextPaymentDate.toISOString(),
      payment_data: {
        transaction_id: paymentResult.rec_trade_id,
        card_info: {
          last_four: paymentResult.card_info.last_four,
          card_type: paymentResult.card_info.type,
          bin_code: paymentResult.card_info.bin_code,
        },
        amount: paymentResult.amount,
        currency: "TWD",
        payment_date: currentDate.toISOString(),
      },
      created_at: currentDate.toISOString(),
      updated_at: currentDate.toISOString(),
      card_token: paymentResult.card_secret.card_token,
      card_key: paymentResult.card_secret.card_key,
    }, {
      onConflict: 'user_id'  // Specify which column to use for conflict resolution
    })

    if (insertError) {
      console.error("Failed to save subscription:", insertError)
      return NextResponse.json(
        { success: false, message: "Failed to save subscription." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
      subscription_data: {
        user_id,
        subscription_status: "active",
        next_payment_date: nextPaymentDate.toISOString(),
      }
    })
  } catch (error) {
    console.error("Subscription creation error:", error)
    const message = error instanceof Error ? error.message : "An unexpected error occurred."
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
