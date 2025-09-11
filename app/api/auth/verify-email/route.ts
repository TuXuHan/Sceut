import { type NextRequest, NextResponse } from "next/server"
import { checkEmailVerificationStatus, resendVerificationEmail } from "@/lib/email-verification"

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    if (action === "check") {
      const status = await checkEmailVerificationStatus(email)
      return NextResponse.json({ success: true, data: status })
    }

    if (action === "resend") {
      const result = await resendVerificationEmail(email)
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Email verification API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, error: "Email parameter is required" }, { status: 400 })
    }

    const status = await checkEmailVerificationStatus(email)
    return NextResponse.json({ success: true, data: status })
  } catch (error) {
    console.error("Email verification status check error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
