import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      "https://bbrnbyzjmxgxnczzymdt.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y",
    )

    const authHeader = request.headers.get("authorization")
    const userEmail = request.headers.get("x-user-email")
    const userNameEncoded = request.headers.get("x-user-name")
    const userName = userNameEncoded ? decodeURIComponent(userNameEncoded) : null

    const { data: allOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (ordersError) {
      return NextResponse.json({ error: "查詢訂單失敗", details: ordersError }, { status: 500 })
    }

    let filteredOrders = []

    if (userName) {
      // 完全匹配
      filteredOrders = allOrders?.filter((order) => order.subscriber_name === userName) || []

      // 如果沒有完全匹配，嘗試去除空格匹配
      if (filteredOrders.length === 0) {
        const normalizedUserName = userName.replace(/\s+/g, "")
        filteredOrders =
          allOrders?.filter((order) => order.subscriber_name?.replace(/\s+/g, "") === normalizedUserName) || []
      }
    } else if (userEmail) {
      filteredOrders = allOrders?.filter((order) => order.customer_email === userEmail) || []
    } else {
      filteredOrders = []
    }

    return NextResponse.json({
      orders: filteredOrders,
    })
  } catch (error) {
    return NextResponse.json({ error: "伺服器錯誤", details: error }, { status: 500 })
  }
}
