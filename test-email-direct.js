// 直接测试邮件发送功能
const { sendSubscriptionConfirmationEmail } = require('./lib/email.ts');

async function testEmail() {
  try {
    console.log('🧪 开始测试邮件发送...');
    
    const result = await sendSubscriptionConfirmationEmail({
      to: 'sceut.tw@gmail.com',
      userName: '测试用户',
      subscriptionId: 'test-123',
      periodNo: 'TEST' + Date.now().toString().slice(-9),
      monthlyFee: 599,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      perfumeName: 'Chanel No.5',
      perfumeBrand: 'Chanel',
    });

    console.log('✅ 邮件发送结果:', result);
  } catch (error) {
    console.error('❌ 邮件发送失败:', error);
  }
}

testEmail();
