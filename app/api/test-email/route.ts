import { NextResponse } from 'next/server';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';

/**
 * 測試郵件發送功能
 * 使用方法：訪問 http://localhost:3000/api/test-email?email=your-email@example.com
 */
export async function GET(request: Request) {
  try {
    // 從 URL 參數獲取測試郵箱地址
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email');

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: '請提供測試郵箱地址',
        usage: 'http://localhost:3000/api/test-email?email=your-email@example.com'
      }, { status: 400 });
    }

    // 驗證是否設定了 RESEND_API_KEY
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: '未設定 RESEND_API_KEY 環境變數',
        help: '請參考 EMAIL_SETUP_GUIDE.md 設定 Resend API 金鑰'
      }, { status: 500 });
    }

    console.log('🧪 開始發送測試郵件到:', testEmail);

    // 發送測試郵件
    const result = await sendSubscriptionConfirmationEmail({
      to: testEmail,
      userName: '測試用戶',
      subscriptionId: 'test-sub-' + Date.now(),
      periodNo: 'TEST' + Date.now().toString().slice(-9),
      monthlyFee: 599,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      perfumeName: 'Chanel No.5',
      perfumeBrand: 'Chanel',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '測試郵件發送成功！',
        sentTo: testEmail,
        result: result.result,
        note: '請檢查您的郵箱（包括垃圾郵件資料夾）'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '郵件發送失敗',
        details: result.error,
        help: '請檢查 RESEND_API_KEY 是否正確，以及是否已驗證域名（如果使用自定義域名）'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ 測試郵件發送失敗:', error);
    return NextResponse.json({
      success: false,
      error: '測試郵件發送失敗',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * 取得測試郵件 API 資訊
 */
export async function POST() {
  return NextResponse.json({
    message: '測試郵件 API',
    description: '用於測試訂閱確認郵件發送功能',
    usage: {
      method: 'GET',
      url: 'http://localhost:3000/api/test-email?email=your-email@example.com',
      parameters: {
        email: '必填 - 接收測試郵件的郵箱地址'
      }
    },
    requirements: [
      '已設定 RESEND_API_KEY 環境變數',
      '使用 Resend 測試郵箱時，接收郵箱必須是註冊 Resend 的郵箱',
      '若要發送給任意郵箱，需要完成自定義域名驗證'
    ],
    documentation: '請參考 EMAIL_SETUP_GUIDE.md 了解詳細設定步驟'
  });
}

