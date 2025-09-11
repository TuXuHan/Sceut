// 調試腳本：測試 Supabase 連線和查詢
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bbrnbyzjmxgxnczzymdt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ3ODcsImV4cCI6MjA2MDYyMDc4N30.S5BFoAq6idmTKLwGYa0bhxFVEoEmQ3voshyX03FVe0Y'
// 使用 service role key 來繞過 RLS
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicm5ieXpqbXhneG5jenp5bWR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA2MDYyMDc4N30.YourServiceRoleKeyHere'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function debugQuery() {
  console.log('=== 開始調試查詢 ===')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Anon Key 前綴:', supabaseAnonKey.substring(0, 20) + '...')
  
  try {
    // 0. 測試連線
    console.log('\n0. 測試 Supabase 連線...')
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('連線測試失敗:', testError)
      return
    }
    console.log('✅ Supabase 連線正常')
    // 1. 查詢所有訂單
    console.log('\n1. 查詢所有訂單...')
    const { data: allOrders, error: allError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('查詢所有訂單錯誤:', allError)
      return
    }
    
    console.log(`找到 ${allOrders.length} 筆訂單`)
    if (allOrders.length > 0) {
      console.log('所有訂單的 subscriber_name:')
      allOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. "${order.subscriber_name}" (長度: ${order.subscriber_name?.length})`)
      })
    }
    
    // 2. 查詢特定用戶的訂單
    console.log('\n2. 查詢 subscriber_name = "涂旭含" 的訂單...')
    const { data: specificOrders, error: specificError } = await supabase
      .from('orders')
      .select('*')
      .eq('subscriber_name', '涂旭含')
    
    if (specificError) {
      console.error('查詢特定訂單錯誤:', specificError)
      return
    }
    
    console.log(`找到 ${specificOrders.length} 筆匹配的訂單`)
    if (specificOrders.length > 0) {
      specificOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. 訂單 ID: ${order.id}, 狀態: ${order.order_status}`)
      })
    }
    
    // 3. 嘗試不同的查詢方式
    console.log('\n3. 嘗試 ilike 查詢...')
    const { data: ilikeOrders, error: ilikeError } = await supabase
      .from('orders')
      .select('*')
      .ilike('subscriber_name', '%涂旭含%')
    
    if (ilikeError) {
      console.error('ilike 查詢錯誤:', ilikeError)
    } else {
      console.log(`ilike 查詢找到 ${ilikeOrders.length} 筆訂單`)
    }
    
    // 4. 檢查 user_profiles 表
    console.log('\n4. 查詢 user_profiles 表...')
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, name')
      .limit(10)
    
    if (profilesError) {
      console.error('查詢 user_profiles 錯誤:', profilesError)
    } else {
      console.log(`找到 ${profiles.length} 筆用戶資料`)
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile.id}, Name: "${profile.name}"`)
      })
    }
    
    // 5. 使用 Service Role 繞過 RLS 檢查
    console.log('\n5. 使用 Service Role 繞過 RLS 檢查...')
    try {
      const { data: adminOrders, error: adminError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (adminError) {
        console.error('Service Role 查詢錯誤:', adminError)
      } else {
        console.log(`Service Role 找到 ${adminOrders.length} 筆訂單`)
        if (adminOrders.length > 0) {
          console.log('Service Role 查詢到的訂單:')
          adminOrders.forEach((order, index) => {
            console.log(`  ${index + 1}. ID: ${order.id}, subscriber_name: "${order.subscriber_name}"`)
          })
        }
      }
    } catch (serviceError) {
      console.error('Service Role 連線錯誤:', serviceError.message)
    }
    
  } catch (error) {
    console.error('未預期的錯誤:', error)
  }
  
  console.log('\n=== 調試完成 ===')
}

debugQuery()
