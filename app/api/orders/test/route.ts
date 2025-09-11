import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // 直接使用 anon key 創建客戶端（繞過 RLS 限制）
    const supabase = createClient(
      'https://bbrnbyzjmxgxnczzymdt.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y'
    )
    
    // 直接查詢所有訂單（用於測試）
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('測試 API 訂單查詢錯誤:', ordersError)
      return NextResponse.json({ error: '查詢訂單失敗', details: ordersError }, { status: 500 })
    }

    console.log('測試 API 找到訂單數量:', orders?.length || 0)
    if (orders && orders.length > 0) {
      console.log('測試 API 找到的訂單:', orders.map(o => ({ id: o.id, subscriber_name: o.subscriber_name })))
    } else {
      console.log('測試 API: 沒有找到任何訂單')
    }
    
    // 同時查詢 user_profiles 表來檢查用戶資料
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, name, email')
      .limit(10)
    
    console.log('測試 API 找到用戶資料數量:', profiles?.length || 0)
    if (profiles && profiles.length > 0) {
      console.log('測試 API 找到的用戶資料:', profiles.map(p => ({ id: p.id, name: p.name, email: p.email })))
    }
    
    return NextResponse.json({ 
      orders: orders || [], 
      profiles: profiles || [],
      message: `找到 ${orders?.length || 0} 筆訂單，${profiles?.length || 0} 筆用戶資料`
    })
  } catch (error) {
    console.error('測試 API 錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤', details: error }, { status: 500 })
  }
}
