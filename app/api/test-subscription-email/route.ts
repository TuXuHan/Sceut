import { NextResponse } from 'next/server';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';

/**
 * 测试订阅成功邮件发送功能
 * 使用方法：POST /api/test-subscription-email
 */
export async function POST(request: Request) {
  try {
    console.log('🧪 开始测试订阅成功邮件发送...');
    
    const body = await request.json();
    console.log('📥 收到的测试数据:', JSON.stringify(body, null, 2));
    
    const { 
      email, 
      userName, 
      subscriptionId, 
      periodNo, 
      monthlyFee, 
      perfumeName, 
      perfumeBrand 
    } = body;

    // 验证必要字段
    if (!email || !userName) {
      return NextResponse.json({
        success: false,
        error: '缺少必要字段：email 和 userName'
      }, { status: 400 });
    }

    // 验证是否设定了 RESEND_API_KEY
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: '未设定 RESEND_API_KEY 环境变量',
        help: '请参考 EMAIL_SETUP_GUIDE.md 设定 Resend API 金钥'
      }, { status: 500 });
    }

    console.log('📧 准备发送订阅确认邮件到:', email);

    // 计算下次付款日期（30天后）
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

    // 发送订阅确认邮件
    const result = await sendSubscriptionConfirmationEmail({
      to: email,
      userName: userName,
      subscriptionId: subscriptionId || 'test-sub-' + Date.now(),
      periodNo: periodNo || 'TEST' + Date.now().toString().slice(-9),
      monthlyFee: monthlyFee || 599,
      nextPaymentDate: nextPaymentDate.toISOString(),
      perfumeName: perfumeName,
      perfumeBrand: perfumeBrand,
    });

    if (result.success) {
      console.log('✅ 订阅确认邮件发送成功:', result.result);
      
      return NextResponse.json({
        success: true,
        message: '订阅确认邮件发送成功！',
        sentTo: email,
        result: result.result,
        emailData: {
          subject: 'Sceut 訂閱成功通知',
          from: process.env.EMAIL_FROM || 'Sceut <onboarding@resend.dev>',
          to: email,
          userName: userName,
          subscriptionId: subscriptionId,
          periodNo: periodNo,
          monthlyFee: monthlyFee,
          perfumeName: perfumeName,
          perfumeBrand: perfumeBrand
        },
        note: '请检查您的邮箱（包括垃圾邮件文件夹）'
      });
    } else {
      console.log('❌ 订阅确认邮件发送失败:', result.error);
      
      return NextResponse.json({
        success: false,
        error: '邮件发送失败',
        details: result.error,
        help: '请检查 RESEND_API_KEY 是否正确，以及是否已验证域名'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ 测试邮件发送失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '测试邮件发送失败',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * 获取测试 API 信息
 */
export async function GET() {
  return NextResponse.json({
    message: '订阅成功邮件测试 API',
    description: '用于测试订阅确认邮件发送功能',
    usage: {
      method: 'POST',
      url: '/api/test-subscription-email',
      body: {
        email: '必填 - 接收测试邮件的邮箱地址',
        userName: '必填 - 用户姓名',
        subscriptionId: '选填 - 订阅编号',
        periodNo: '选填 - 定期定额编号',
        monthlyFee: '选填 - 月费金额',
        perfumeName: '选填 - 香水名称',
        perfumeBrand: '选填 - 香水品牌'
      }
    },
    requirements: [
      '已设定 RESEND_API_KEY 环境变量',
      '已验证 sceut.com 域名',
      '已设定 EMAIL_FROM 环境变量'
    ],
    testPage: '/test-subscription-email',
    documentation: '请参考 EMAIL_SETUP_GUIDE.md 了解详细设定步骤'
  });
}
