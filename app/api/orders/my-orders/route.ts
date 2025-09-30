import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      "https://bbrnbyzjmxgxnczzymdt.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y",
    )

    // 從請求頭獲取使用者資訊
    const userId = request.headers.get("x-user-id")
    const userEmail = request.headers.get("x-user-email")
    const userNameEncoded = request.headers.get("x-user-name")
    const userName = userNameEncoded ? decodeURIComponent(userNameEncoded) : null

    let filteredOrders = []

    // 優先使用 user_id 查詢（新的方式）
    if (userId) {
      const { data: ordersByUserId, error: userIdError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (userIdError) {
        console.error("查詢 user_id 訂單失敗:", userIdError)
        return NextResponse.json({ error: "查詢訂單失敗", details: userIdError }, { status: 500 })
      } else {
        filteredOrders = ordersByUserId || []
      }
    }

    // 如果沒有 user_id 或查詢結果為空，則使用舊的方式（姓名或email）
    if (filteredOrders.length === 0) {
      const { data: allOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (ordersError) {
        return NextResponse.json({ error: "查詢訂單失敗", details: ordersError }, { status: 500 })
      }

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
      }
    }

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      total: filteredOrders.length
    })
  } catch (error) {
    console.error("查詢我的訂單時發生錯誤:", error)
    return NextResponse.json({ 
      success: false, 
      error: "伺服器錯誤", 
      details: error instanceof Error ? error.message : "未知錯誤" 
    }, { status: 500 })
  }
}
