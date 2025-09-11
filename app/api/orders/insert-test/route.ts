import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // 直接使用 anon key 創建客戶端
    const supabase = createClient(
      'https://bbrnbyzjmxgxnczzymdt.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y'
    )
    
    // 插入測試訂單資料
    const testOrders = [
      {
        id: '15016f67-e8e4-42a4-b163-8d0c98c9ce4f',
        shopify_order_id: '1234567890',
        customer_email: 'tusummer1214@gmail.com',
        total_price: '599.00',
        currency: 'TWD',
        order_status: 'created',
        paid_at: '2025-09-05T11:22:28.000Z',
        cancelled_at: null,
        created_at: '2025-09-10T11:22:38.245438Z',
        updated_at: '2025-09-10T11:22:38.245438Z',
        subscriber_name: '涂旭含'
      },
      {
        id: '15347b0c-6890-4eee-9e17-529509d1a312',
        shopify_order_id: '2234567890',
        customer_email: null,
        total_price: null,
        currency: 'TWD',
        order_status: 'created',
        paid_at: null,
        cancelled_at: null,
        created_at: '2025-08-10T12:35:27.754645Z',
        updated_at: '2025-09-10T12:35:27.754645Z',
        subscriber_name: '涂旭含'
      },
      {
        id: '55fd0e1f-adb4-4ebc-ad19-6859afb9bd0a',
        shopify_order_id: '3334567890',
        customer_email: null,
        total_price: null,
        currency: 'TWD',
        order_status: 'created',
        paid_at: null,
        cancelled_at: null,
        created_at: '2025-07-10T12:35:47.940921Z',
        updated_at: '2025-09-10T12:35:47.940921Z',
        subscriber_name: '涂旭含'
      }
    ]

    // 先檢查是否已存在，如果存在就跳過
    const { data: existingOrders, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .in('id', testOrders.map(o => o.id))

    if (checkError) {
      console.error('檢查現有訂單錯誤:', checkError)
      return NextResponse.json({ error: '檢查訂單失敗', details: checkError }, { status: 500 })
    }

    const existingIds = existingOrders?.map(o => o.id) || []
    const newOrders = testOrders.filter(o => !existingIds.includes(o.id))

    let insertedOrders = []
    if (newOrders.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('orders')
        .insert(newOrders)
        .select()

      if (insertError) {
        console.error('插入測試訂單錯誤:', insertError)
        return NextResponse.json({ error: '插入訂單失敗', details: insertError }, { status: 500 })
      }
      insertedOrders = inserted || []
    }

    console.log(`跳過 ${existingIds.length} 筆已存在的訂單，插入 ${insertedOrders.length} 筆新訂單`)

    console.log('成功插入測試訂單:', insertedOrders?.length || 0)
    
    // 同時插入用戶資料
    const testProfile = {
      id: '15016f67-e8e4-42a4-b163-8d0c98c9ce4f', // 使用相同的 ID
      name: '涂旭含',
      email: 'tusummer1214@gmail.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: insertedProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert(testProfile)
      .select()

    if (profileError) {
      console.error('插入用戶資料錯誤:', profileError)
      // 不返回錯誤，因為訂單已經插入成功
    } else {
      console.log('成功插入用戶資料:', insertedProfile)
    }
    
    return NextResponse.json({ 
      success: true,
      orders: insertedOrders || [],
      profile: insertedProfile || null,
      message: `跳過 ${existingIds.length} 筆已存在的訂單，插入 ${insertedOrders.length} 筆新訂單`,
      existingCount: existingIds.length,
      insertedCount: insertedOrders.length
    })
  } catch (error) {
    console.error('插入測試資料錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤', details: error }, { status: 500 })
  }
}
