import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const hasSupabaseConfig = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY

    if (!hasSupabaseConfig) {
      console.warn("Supabase not configured, returning mock data")
      return NextResponse.json({
        subscriptions: [],
        message: "Database not configured - please set up Supabase integration",
      })
    }

    const supabase = await createClient()

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
      console.error("獲取訂閱記錄失敗:", error.message)

      if (error.message.includes("column") && error.message.includes("does not exist")) {
        console.warn("Database schema issue detected, returning empty subscriptions")
        return NextResponse.json({ subscriptions: [] })
      }

      return NextResponse.json(
        {
          error: "獲取訂閱記錄失敗",
          details: error.message,
          subscriptions: [],
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ subscriptions: subscriptions || [] })
  } catch (error) {
    console.error("API error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`獲取訂閱記錄失敗: ${errorMessage}`)

    if (errorMessage.includes("Supabase configuration missing") || errorMessage.includes("Missing Supabase")) {
      return NextResponse.json(
        {
          error: "Database not configured",
          details: "Please set up Supabase integration in your project settings",
          subscriptions: [],
        },
        { status: 200 }, // Return 200 instead of 500 for configuration issues
      )
    }

    return NextResponse.json(
      {
        error: "服務器錯誤",
        details: errorMessage,
        subscriptions: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const hasSupabaseConfig = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY

    if (!hasSupabaseConfig) {
      return NextResponse.json(
        {
          success: false,
          message: "Database not configured - please set up Supabase integration",
        },
        { status: 503 }, // Service unavailable
      )
    }

    const supabase = await createClient()
    const { user_id, paymentResult, profile, amount } = await req.json()

    if (!user_id || !paymentResult || !profile || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required data for subscription creation.",
        },
        { status: 400 },
      )
    }

    const currentDate = new Date()
    const nextPaymentDate = new Date(currentDate)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

    const { error: insertError } = await supabase.from("subscribers").upsert(
      {
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
      },
      {
        onConflict: "user_id",
      },
    )

    if (insertError) {
      console.error("Failed to save subscription:", insertError)
      return NextResponse.json({ success: false, message: "Failed to save subscription." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
      subscription_data: {
        user_id,
        subscription_status: "active",
        next_payment_date: nextPaymentDate.toISOString(),
      },
    })
  } catch (error) {
    console.error("Subscription creation error:", error)
    const message = error instanceof Error ? error.message : "An unexpected error occurred."

    if (message.includes("Supabase configuration missing")) {
      return NextResponse.json(
        {
          success: false,
          message: "Database not configured - please set up Supabase integration",
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
