import { NextRequest, NextResponse } from 'next/server';
import { parsePeriodicPaymentResponse } from '@/lib/newebpay';

export async function POST(request: NextRequest) {
  try {
    console.log('Payment result POST received');
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const formData = await request.formData();
    const responseData: any = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      responseData[key] = value;
    }
    
    console.log('Received form data from NeWebPay:', responseData);

    const toParse = responseData.Period;
    console.log('toParse:', toParse);
    // Parse the payment response
    const parsedResponse = parsePeriodicPaymentResponse(toParse);
    console.log('Parsed payment response:', parsedResponse);

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
      
      console.log('Redirecting to success page:', redirectUrl);
      
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

export async function GET() {
  return NextResponse.json({
    message: 'NeWebPay Payment Result API',
    endpoints: {
      POST: 'Handle payment result from NeWebPay',
      GET: 'Get API information'
    },
    note: 'This endpoint receives form data from NeWebPay after payment processing'
  });
}
