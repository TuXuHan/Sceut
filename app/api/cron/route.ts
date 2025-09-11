import { payByToken } from "@/lib/api/payment";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient()

  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("user_id, name, card_token, card_key, monthly_fee")
    .eq("payment_status", "active")
    .lte("next_payment_date", new Date().toISOString())

  console.log("🔍 Subscribers:", subscribers)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  for (const subscriber of subscribers) {
    const paymentResult = await payByToken(subscriber.card_token, subscriber.card_key, subscriber.monthly_fee)
    console.log("🔍 Payment result:", paymentResult)

    if (paymentResult.status !== 0) {
      console.error("🔍 Payment failed:", paymentResult)
      await supabase.from("subscribers").update({
        payment_status: "failed",
        error_message: paymentResult.msg,
      }).eq("user_id", subscriber.user_id)
      continue
    }

    const currentDate = new Date()
    const nextPaymentDate = new Date(currentDate)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

    await supabase.from("subscribers").update({
      payment_data: paymentResult,
      last_payment_date: currentDate.toISOString(),
      next_payment_date: nextPaymentDate.toISOString(),
    }).eq("user_id", subscriber.user_id)
  }

  return NextResponse.json({ message: "Cron job executed", subscribers, error })
}
