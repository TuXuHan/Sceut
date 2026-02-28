import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface CustomConfig {
  merchantId: string;
  hashKey: string;
  hashIV: string;
}

// Helper function to encrypt with custom config
function encryptAESWithConfig(data: string, hashKey: string, hashIV: string): string {
  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', hashKey, hashIV);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('AES encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Helper function to generate CheckMacValue with custom config
function generateCheckMacValueWithConfig(
  data: Record<string, any>, 
  hashKey: string, 
  hashIV: string
): string {
  try {
    const sortedKeys = Object.keys(data).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    const checkString = `HashKey=${hashKey}&${queryString}&HashIV=${hashIV}`;
    const encodedString = encodeURIComponent(checkString).toLowerCase();
    const hash = crypto.createHash('sha256').update(encodedString).digest('hex');
    
    return hash.toUpperCase();
  } catch (error) {
    console.error('CheckMacValue generation error:', error);
    throw new Error('Failed to generate CheckMacValue');
  }
}

// Helper function to build trade info with custom config
function buildTradeInfoWithConfig(
  data: Record<string, any>,
  hashKey: string,
  hashIV: string
): string {
  try {
    const queryString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    const encrypted = encryptAESWithConfig(queryString, hashKey, hashIV);
    return encrypted;
  } catch (error) {
    console.error('Build trade info error:', error);
    throw new Error('Failed to build trade info');
  }
}

// Helper function to generate merchant trade number
function generateMerchantTradeNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TEST_${timestamp}_${random}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 NeWebPay test payment API called');
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    // Validate config
    const config: CustomConfig = {
      merchantId: body.merchantId || '',
      hashKey: body.hashKey || '',
      hashIV: body.hashIV || '',
    };

    if (!config.merchantId || !config.hashKey || !config.hashIV) {
      return NextResponse.json(
        { error: 'Missing required config: merchantId, hashKey, or hashIV' },
        { status: 400 }
      );
    }

    // Validate hash key length (should be 32 characters)
    if (config.hashKey.length !== 32) {
      return NextResponse.json(
        { error: 'HashKey must be exactly 32 characters' },
        { status: 400 }
      );
    }

    // Validate hash IV length (should be 16 characters)
    if (config.hashIV.length !== 16) {
      return NextResponse.json(
        { error: 'HashIV must be exactly 16 characters' },
        { status: 400 }
      );
    }

    // Get base URL
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    console.log('🌐 Base URL:', baseUrl);

    // Prepare payment data for 1元1期
    const merOrderNo = generateMerchantTradeNo();
    const requestData = {
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000).toString(),
      Version: "1.5",
      LangType: "zh-Tw",
      MerOrderNo: merOrderNo,
      ProdDesc: "測試付款 - 1元1期",
      PeriodAmt: "1", // 1元
      PeriodType: "M", // 月
      PeriodPoint: "05", // 每月5號
      PeriodStartType: "2", // 立即首期
      PeriodTimes: "1", // 1期
      PeriodFirstdate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      PeriodMemo: "測試付款",
      PayerEmail: body.email || "test@example.com",
      EmailModify: 1,
      PaymentInfo: "N",
      OrderInfo: "N",
      ReturnURL: `${baseUrl}/api/newebpay/result`,
      NotifyURL: `${baseUrl}/api/newebpay/callback`,
      BackURL: `${baseUrl}`,
      UNIONPAY: 0,
    };

    console.log('📋 Payment data:', requestData);

    // Build encrypted PostData
    const postData = buildTradeInfoWithConfig(requestData, config.hashKey, config.hashIV);
    console.log('✅ Encrypted PostData created');

    // Determine environment (sandbox or production)
    const env = body.env === 'production' ? 'production' : 'sandbox';
    const createPeriodicUrl = env === 'production' 
      ? 'https://core.newebpay.com/MPG/period'
      : 'https://ccore.newebpay.com/MPG/period';

    // Generate form HTML
    const formHtml = `
      <form method="post" action="${createPeriodicUrl}" id="newebpay-form">
        <input type="hidden" name="MerchantID_" value="${config.merchantId}" />
        <input type="hidden" name="PostData_" value="${postData}" />
        <input type="submit" value="Submit to NeWebPay" style="display: none;" />
      </form>
      <script>
        document.getElementById('newebpay-form').submit();
      </script>
    `;

    return NextResponse.json({
      success: true,
      merchantTradeNo: merOrderNo,
      formHtml: formHtml,
      config: {
        merchantId: config.merchantId,
        hashKeyLength: config.hashKey.length,
        hashIVLength: config.hashIV.length,
        env: env,
      },
      paymentData: {
        amount: 1,
        periods: 1,
        description: "測試付款 - 1元1期",
      }
    });

  } catch (error) {
    console.error('❌ Error creating test payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create test payment' },
      { status: 500 }
    );
  }
}
