import { NextRequest, NextResponse } from 'next/server';
import { parsePeriodicPaymentResponse } from '@/lib/newebpay';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const responseData: any = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      responseData[key] = value;
    }

    const toParse = responseData.Period;
    const parsedResponse = parsePeriodicPaymentResponse(toParse);

    // Only redirect to result page if status is SUCCESS
    if (parsedResponse.Status === 'SUCCESS') {
      // For success, return HTML that redirects to the success page with payment data
      const protocol = request.headers?.get('x-forwarded-proto') || 'http';
      const host = request.headers?.get('x-forwarded-host') || 'localhost:3000';
      
      // Extract the required parameters from the parsed response
      const periodNo = parsedResponse.Result?.PeriodNo || '';
      const authTime = parsedResponse.Result?.AuthTime || '';
      const periodAmt = parsedResponse.Result?.PeriodAmt || '';
      const merchantOrderNo = parsedResponse.Result?.MerchantOrderNo || '';
      
      const redirectUrl = `${protocol}://${host}/subscribe/success?PeriodNo=${periodNo}&AuthTime=${authTime}&PeriodAmt=${periodAmt}&MerchantOrderNo=${merchantOrderNo}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Redirecting...</title>
        </head>
        <body>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
          <p>Redirecting to payment result...</p>
        </body>
        </html>
      `;
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } else {
      // For non-success status, return error response
      console.log('Payment failed with status:', parsedResponse.Status);
      console.log('Payment failed with message:', parsedResponse.Message);
      
      return NextResponse.json({
        status: 'error',
        message: parsedResponse.Message || 'Payment failed',
        details: parsedResponse
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing payment result POST:', error);
    
    // Redirect to error page
    return NextResponse.redirect(new URL('/payment/result?error=Failed to process payment result', request.url));
  }
}

export async function GET(request: NextRequest) {
  try {
    // 處理 GET 請求（可能是用戶直接訪問或 NewebPay 重定向）
    const searchParams = request.nextUrl.searchParams
    const periodNo = searchParams.get('PeriodNo')
    const authTime = searchParams.get('AuthTime')
    const periodAmt = searchParams.get('PeriodAmt')
    const merchantOrderNo = searchParams.get('MerchantOrderNo')
    
    // 如果有參數，重定向到成功頁面
    if (periodNo && authTime && periodAmt) {
      const protocol = request.headers?.get('x-forwarded-proto') || 'https'
      const host = request.headers?.get('x-forwarded-host') || request.headers?.get('host') || 'localhost:3000'
      const redirectUrl = `${protocol}://${host}/subscribe/success?PeriodNo=${periodNo}&AuthTime=${authTime}&PeriodAmt=${periodAmt}&MerchantOrderNo=${merchantOrderNo || ''}`
      
      return NextResponse.redirect(redirectUrl)
    }
    
    // 如果沒有參數，返回 API 信息
    return NextResponse.json({
      message: 'NeWebPay Payment Result API',
      endpoints: {
        POST: 'Handle payment result from NeWebPay',
        GET: 'Redirect to success page if payment data is provided'
      },
      note: 'This endpoint receives form data from NeWebPay after payment processing'
    })
  } catch (error) {
    console.error('GET 請求處理失敗:', error)
    return NextResponse.json({
      error: 'Failed to process request'
    }, { status: 500 })
  }
}
