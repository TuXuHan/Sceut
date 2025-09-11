import { NextRequest, NextResponse } from 'next/server'
import { terminatePeriodicPayment } from '@/lib/newebpay/alter-status'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Terminating subscription for user:', userId)

    // Get the user's subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription_status', 'active')
      .single()

    if (fetchError) {
      console.error('Error fetching subscription:', fetchError)
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    console.log('Found subscription:', subscription)

    // Extract the required data for termination
    const merOrderNo = subscription.merchant_order_no
    const periodNo = subscription.period_no

    if (!merOrderNo || !periodNo) {
      console.error('Missing required payment data:', { merOrderNo, periodNo })
      return NextResponse.json(
        { error: 'Missing payment information' },
        { status: 400 }
      )
    }

    console.log('Terminating payment with:', { merOrderNo, periodNo })

    // Call NeWebPay to terminate the periodic payment
    const terminateResult = await terminatePeriodicPayment(merOrderNo, periodNo)

    console.log('NeWebPay termination result:', terminateResult)

    if (terminateResult.Status === 'SUCCESS') {
      // Update the subscription status in database
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          subscription_status: 'terminated',
          payment_status: 'terminated',
          updated_at: new Date().toISOString(),
          payment_data: {
            ...subscription.payment_data,
            termination_date: new Date().toISOString(),
            termination_result: terminateResult
          }
        })
        .eq('user_id', userId)
        .eq('subscription_status', 'active')

      if (updateError) {
        console.error('Error updating subscription status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription status' },
          { status: 500 }
        )
      }

      console.log('Subscription terminated successfully')

      return NextResponse.json({
        success: true,
        message: 'Subscription terminated successfully',
        result: terminateResult
      })
    } else {
      console.error('NeWebPay termination failed:', terminateResult)
      return NextResponse.json(
        { 
          error: 'Failed to terminate payment',
          details: terminateResult
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error terminating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'NeWebPay Terminate API',
    endpoints: {
      POST: 'Terminate a subscription using NeWebPay',
      GET: 'Get API information'
    },
    note: 'This endpoint terminates periodic payments through NeWebPay'
  })
}
