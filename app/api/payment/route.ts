import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { payByPrime } from "@/lib/api/payment"

export async function POST(req: NextRequest) {
  // Debug request headers
  console.log("📨 Request headers:", {
    authorization: req.headers.get("authorization"),
    cookie: req.headers.get("cookie"),
    userAgent: req.headers.get("user-agent")
  })

  try {
    const supabase = await createClient()

    const { user_id, prime, amount } = await req.json()

    console.log("🔍 User ID:", user_id)
    console.log("🔍 Prime:", prime)
    console.log("🔍 Amount:", amount)

    if (!user_id || !prime || !amount) {
      return NextResponse.json({ success: false, message: "Missing user_id, prime or amount." }, { status: 400 })
    }

    // 2. Fetch User Profile for shipping details
    console.log("🔍 Fetching user profile for user_id:", user_id)
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("name, phone, email, address, city, postal_code, country, 711")
      .eq("id", user_id)
      .single()

    console.log("👤 Profile query result:", { profile, profileError })

    if (profileError) {
      console.error("❌ Failed to fetch user profile:", profileError)
      return NextResponse.json({ 
        success: false, 
        message: `Failed to fetch user profile: ${profileError.message}` 
      }, { status: 400 })
    }

    if (!profile) {
      console.log("❌ No profile found for user_id:", user_id)
      return NextResponse.json({ 
        success: false, 
        message: "User profile not found. Please complete your profile first." 
      }, { status: 400 })
    }

    // Check all required profile fields
    const missingFields = []
    if (!profile.name?.trim()) missingFields.push("姓名")
    if (!profile.phone?.trim()) missingFields.push("電話")
    if (!profile.email?.trim()) missingFields.push("電子郵件")
    if (!profile.city?.trim()) missingFields.push("縣市")
    if (!profile["711"]?.trim()) missingFields.push("7-11門市名稱")
    // 地址改為選填，不再檢查

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `用戶資料不完整，缺少: ${missingFields.join(", ")}` 
      }, { status: 402 })
    }

    // 3. Process Payment via TapPay
    const paymentResult = await payByPrime(prime, amount, {
      phone_number: profile.phone,
      name: profile.name,
      email: profile.email,
    })

    if (paymentResult.status !== 0) {
      console.error("❌ Payment failed:", paymentResult)
      return NextResponse.json({ success: false, message: paymentResult.msg || "Payment failed" }, { status: 400 })
    }

    console.log("🔍 Payment result:", paymentResult)

    // 4. Return the full payment result and profile data for frontend to handle subscription creation
    return NextResponse.json({
      success: true,
      paymentResult,
      profile,
      amount,
      currency: "TWD",
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    const message = error instanceof Error ? error.message : "An unexpected error occurred."
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
