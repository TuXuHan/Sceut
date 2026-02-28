import { NextRequest, NextResponse } from 'next/server';
import { parsePeriodicPaymentResponse } from '@/lib/newebpay';

export async function POST(request: NextRequest) {
  try {
    console.log('Payment result POST received');
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Try to parse as form data first, fallback to text if needed
    let responseData: any = {};
    try {
      const formData = await request.formData();
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        responseData[key] = value;
      }
    } catch (e) {
      // If formData parsing fails, try to parse as text
      console.log('FormData parsing failed, trying text parsing...');
      const text = await request.text();
      const params = new URLSearchParams(text);
      responseData = Object.fromEntries(params.entries());
    }
    
    console.log('Received form data from NeWebPay:', responseData);
    console.log('All keys in responseData:', Object.keys(responseData));

    // Check if this is an error response (Status field present but not SUCCESS)
    const status = responseData.Status || responseData.status;
    const message = responseData.Message || responseData.message;
    
    if (status && status !== 'SUCCESS' && status !== 'success') {
      console.log('⚠️ NeWebPay returned an error response');
      console.log('Status:', status);
      console.log('Message:', message);
      
      // For error responses, Status and Message already contain the error information
      // We don't need to decrypt the Result field for error responses
      // The Result field might be encrypted with different config or might not be needed
      
      // Return error response with user-friendly message
      const protocol = request.headers?.get('x-forwarded-proto') || 'http';
      const host = request.headers?.get('x-forwarded-host') || request.headers?.get('host') || 'localhost:3000';
      const errorMessage = message || status || '付款失敗';
      const errorUrl = `${protocol}://${host}/test-newebpay-config?error=${encodeURIComponent(errorMessage)}&status=${encodeURIComponent(status)}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>付款失敗</title>
        </head>
        <body>
          <script>
            alert("付款失敗：${errorMessage}");
            window.location.href = "${errorUrl}";
          </script>
          <p>付款失敗：${errorMessage}</p>
          <p>正在返回...</p>
        </body>
        </html>
      `;
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Check if Period field exists (for success responses)
    const toParse = responseData.Period || responseData.period;
    if (!toParse) {
      console.error('❌ Period field not found in response');
      console.error('Available fields:', Object.keys(responseData));
      console.error('Full response data:', JSON.stringify(responseData, null, 2));
      
      return NextResponse.json({
        error: 'Period field not found in NeWebPay response',
        receivedData: responseData,
        message: 'The payment response from NeWebPay is missing the Period field. This might indicate a configuration mismatch or an error from NeWebPay.'
      }, { status: 400 });
    }
    
    console.log('Period data to parse:', toParse);
    console.log('Period data length:', toParse.length);
    
    // Parse the payment response
    let parsedResponse;
    try {
      parsedResponse = parsePeriodicPaymentResponse(toParse);
      console.log('Parsed payment response:', parsedResponse);
    } catch (parseError) {
      console.error('❌ Failed to parse payment response:', parseError);
      console.error('Parse error details:', {
        message: parseError instanceof Error ? parseError.message : 'Unknown error',
        stack: parseError instanceof Error ? parseError.stack : undefined,
        periodData: toParse.substring(0, 100) + '...'
      });
      
      return NextResponse.json({
        error: 'Failed to decrypt payment response',
        message: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        hint: 'This might be due to a configuration mismatch. Make sure the Hash Key and Hash IV used for encryption match the ones used for decryption.',
        details: {
          periodDataLength: toParse.length,
          periodDataPreview: toParse.substring(0, 50) + '...'
        }
      }, { status: 500 });
    }

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
    console.error('❌ Error processing payment result POST:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    // Return JSON error instead of redirect for better debugging
    return NextResponse.json({
      error: 'Failed to process payment result',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    }, { status: 500 });
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
