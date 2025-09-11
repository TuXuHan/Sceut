import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 獲取當前用戶
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    // 獲取用戶資料
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: '無法取得使用者資料' }, { status: 404 })
    }

    // 查詢訂單 - 使用 service role 繞過 RLS
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('subscriber_name', profile.name)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('訂單查詢錯誤:', ordersError)
      return NextResponse.json({ error: '查詢訂單失敗' }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('API 錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
