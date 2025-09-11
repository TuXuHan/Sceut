import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // 使用 anon key（需要暫時禁用 RLS）
    const supabase = createClient(
      'https://bbrnbyzjmxgxnczzymdt.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y'
    )
    
    // 暫時使用固定的用戶 ID（測試用）
    const testUserId = '15016f67-e8e4-42a4-b163-8d0c98c9ce4f'

    const { orderId, rating, comment } = await request.json()

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '無效的評分資料' }, { status: 400 })
    }

    // 檢查訂單是否存在
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, subscriber_name, ratings')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
    }

    // 更新 orders 表中的 ratings 欄位
    const ratingData = {
      rating: rating,
      comment: comment || null,
      rated_at: new Date().toISOString(),
      rated_by: testUserId
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        ratings: ratingData,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()

    if (updateError) {
      console.error('更新訂單評分錯誤:', updateError)
      return NextResponse.json({ error: '評分提交失敗' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      order: updatedOrder[0],
      rating: ratingData,
      message: '評分提交成功'
    })
  } catch (error) {
    console.error('評分 API 錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 使用 anon key（需要暫時禁用 RLS）
    const supabase = createClient(
      'https://bbrnbyzjmxgxnczzymdt.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y'
    )

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (orderId) {
      // 獲取特定訂單的評分
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, ratings')
        .eq('id', orderId)
        .single()

      if (orderError) {
        console.error('獲取訂單評分錯誤:', orderError)
        return NextResponse.json({ error: '獲取評分失敗' }, { status: 500 })
      }

      return NextResponse.json({ rating: order?.ratings || null })
    } else {
      // 獲取用戶的所有訂單評分
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, ratings')
        .not('ratings', 'is', null)
        .order('updated_at', { ascending: false })

      if (ordersError) {
        console.error('獲取訂單評分列表錯誤:', ordersError)
        return NextResponse.json({ error: '獲取評分列表失敗' }, { status: 500 })
      }

      return NextResponse.json({ ratings: orders || [] })
    }
  } catch (error) {
    console.error('獲取評分 API 錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
