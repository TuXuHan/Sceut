import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // 直接使用 anon key 創建客戶端
    const supabase = createClient(
      'https://bbrnbyzjmxgxnczzymdt.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y'
    )
    
    // 測試簡單的查詢
    const { data, error } = await supabase
      .from('orders')
      .select('count')
      .limit(1)

    if (error) {
      console.error('簡單測試錯誤:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      })
    }

    return NextResponse.json({ 
      success: true,
      message: '資料庫連線正常',
      data: data
    })
  } catch (error) {
    console.error('測試錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      error: '伺服器錯誤', 
      details: error 
    })
  }
}
