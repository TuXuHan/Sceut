import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Failed to fetch auth user:", authError)
      return NextResponse.json({ error: "Auth error" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ hasActiveSubscription: false }, { status: 401 })
    }

    const serviceClient = await createServiceClient()
    const { data, error } = await serviceClient
      .from("subscribers")
      .select("id")
      .eq("user_id", user.id)
      .eq("subscription_status", "active")
      .limit(1)

    if (error) {
      console.error("Failed to check subscription status:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const hasActiveSubscription = Array.isArray(data) && data.length > 0
    return NextResponse.json({ hasActiveSubscription })
  } catch (error) {
    console.error("Unexpected error checking subscription status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

