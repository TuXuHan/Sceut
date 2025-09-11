import { NextRequest, NextResponse } from 'next/server';
import { 
  createPeriodicPaymentForm, 
  generateMerchantTradeNo, 
  formatMerchantTradeDate,
  PeriodicPaymentRequest 
} from '@/lib/newebpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['ProdDesc', 'PeriodAmt', 'PeriodType', 'PeriodPoint', 'PeriodStartType', 'PeriodTimes'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get base URL safely from headers
    const host = request.headers.get('host');
    const protocol = process.env.env === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    // Prepare periodic payment data
    const periodicPaymentData: PeriodicPaymentRequest = {
      MerOrderNo: body.MerOrderNo || generateMerchantTradeNo(),
      ProdDesc: body.ProdDesc,
      PeriodAmt: body.PeriodAmt,
      PeriodType: body.PeriodType,
      PeriodPoint: body.PeriodPoint,
      PeriodStartType: body.PeriodStartType,
      PeriodTimes: body.PeriodTimes,
      ReturnURL: `${baseUrl}/api/newebpay/result`,
      NotifyURL: `${baseUrl}/api/newebpay/callback`,
      BackURL: `${baseUrl}`,
      Language: body.Language || 'ZH-TW',
      PeriodMemo: body.PeriodMemo || '定期定額付款測試',
    };

    // Use manual implementation for better reliability
    const formHtml = createPeriodicPaymentForm(periodicPaymentData);

    return NextResponse.json({
      success: true,
      merchantTradeNo: periodicPaymentData.MerOrderNo,
      formHtml: formHtml,
      data: periodicPaymentData
    });

  } catch (error) {
    console.error('Error creating periodic payment:', error);
    return NextResponse.json(
      { error: 'Failed to create periodic payment' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'NeWebPay Payment Request API',
    endpoints: {
      POST: 'Create a new periodic payment request',
      GET: 'Get API information'
    },
    requiredFields: ['ProdDesc', 'PeriodAmt', 'PeriodType', 'PeriodPoint', 'PeriodStartType', 'PeriodTimes']
  });
}
