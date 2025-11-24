import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("取得登入資訊失敗:", authError)
      return NextResponse.json({ success: false, error: "取得用戶資料失敗" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "尚未登入" }, { status: 401 })
    }

    const body = await request.json()
    const orderId = body?.orderId as string | undefined
    const rating = Number(body?.rating)
    const comment = typeof body?.comment === "string" ? body.comment.trim() : ""

    if (!orderId || Number.isNaN(rating)) {
      return NextResponse.json({ success: false, error: "缺少必要欄位" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "評分必須介於 1 到 5 之間" }, { status: 400 })
    }

    const serviceClient = await createServiceClient()
    const { data: order, error: fetchError } = await serviceClient
      .from("orders")
      .select("id, user_id, customer_email, ratings")
      .eq("id", orderId)
      .single()

    if (fetchError || !order) {
      console.error("查詢訂單失敗:", fetchError)
      return NextResponse.json({ success: false, error: "找不到訂單" }, { status: 404 })
    }

    const isOwner =
      (order.user_id && order.user_id === user.id) ||
      (!order.user_id && order.customer_email && order.customer_email === user.email)

    if (!isOwner) {
      return NextResponse.json({ success: false, error: "沒有權限更新此訂單" }, { status: 403 })
    }

    const currentRatings = (order.ratings as Record<string, any>) || {}
    const updatedRatings = {
      ...currentRatings,
      subscription_feedback: {
        rating,
        comment,
        submittedAt: new Date().toISOString(),
      },
    }

    const { error: updateError } = await serviceClient
      .from("orders")
      .update({ ratings: updatedRatings })
      .eq("id", orderId)

    if (updateError) {
      console.error("更新評價失敗:", updateError)
      return NextResponse.json({ success: false, error: "儲存評價失敗" }, { status: 500 })
    }

    return NextResponse.json({ success: true, ratings: updatedRatings })
  } catch (error) {
    console.error("提交訂單評價時發生錯誤:", error)
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 })
  }
}

