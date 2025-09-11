import { type NextRequest, NextResponse } from "next/server"
import { parsePeriodicPaymentResponse } from "@/lib/newebpay"
import { createClient } from "@/lib/supabase/server"

async function processPeriodicPaymentCallback(result: any) {
  try {
    console.log("Processing periodic payment callback:", result)

    const { PeriodNo, AuthDate, AuthAmt, NextAuthDate, AlreadyTimes, TotalTimes, AuthCode, TradeNo, RespondCode } =
      result

    const supabase = await createClient()

    // Find the subscription by period_no
    const { data: subscription, error: findError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("period_no", PeriodNo)
      .single()

    if (findError) {
      console.error("Error finding subscription:", findError)
      return
    }

    if (!subscription) {
      console.error("Subscription not found for period_no:", PeriodNo)
      return
    }

    // Parse auth date
    const authDate = new Date(AuthDate)
    const nextAuthDate = new Date(NextAuthDate)

    let subscription_status = "active"
    if (nextAuthDate === authDate) {
      console.log("Final period detected - marking subscription as completed")
      subscription_status = "completed"
    }

    // Update subscription with new payment information
    const updateData = {
      last_payment_date: authDate.toISOString(),
      next_payment_date: nextAuthDate.toISOString(),
      payment_status: "paid",
      subscription_status: subscription_status,
      monthly_fee: Number.parseInt(AuthAmt),
      updated_at: new Date().toISOString(),
      payment_data: {
        ...subscription.payment_data,
        last_auth_date: AuthDate,
        last_auth_amount: AuthAmt,
        last_auth_code: AuthCode,
        last_trade_no: TradeNo,
        already_times: Number.parseInt(AlreadyTimes),
        total_times: Number.parseInt(TotalTimes),
        respond_code: RespondCode,
      },
    }

    // Update the subscription
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("subscribers")
      .update(updateData)
      .eq("period_no", PeriodNo)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating subscription:", updateError)
      return
    }

    console.log("Subscription updated successfully:", updatedSubscription)
  } catch (error) {
    console.error("Error processing periodic payment callback:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("NeWebPay callback received")
    console.log("Request URL:", request.url)
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))

    const formData = await request.formData()
    const callbackData: any = {}

    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      callbackData[key] = value
    }

    console.log("Received callback data from NeWebPay:", callbackData)

    // Handle different types of callbacks
    if (callbackData.Period) {
      // Periodic payment callback
      const parsedResponse = parsePeriodicPaymentResponse(callbackData.Period)
      console.log("Parsed periodic payment callback:", parsedResponse)

      // Process the callback data
      if (parsedResponse.Status === "SUCCESS" && parsedResponse.Result) {
        await processPeriodicPaymentCallback(parsedResponse.Result)
      }

      return NextResponse.json({
        success: true,
        message: "Callback processed successfully",
        data: parsedResponse,
      })
    } else {
      // Other types of callbacks
      console.log("Unknown callback type:", callbackData)

      return NextResponse.json({
        success: true,
        message: "Callback received (unknown type)",
        data: callbackData,
      })
    }
  } catch (error) {
    console.error("Error processing NeWebPay callback:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process callback",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "NeWebPay Callback API",
    endpoints: {
      POST: "Handle webhook callbacks from NeWebPay",
      GET: "Get API information",
    },
    note: "This endpoint receives webhook notifications from NeWebPay for payment status updates",
  })
}
