// 独立测试订阅成功邮件发送功能
const { sendSubscriptionConfirmationEmail } = require('./lib/email.ts');

// 从环境变量文件读取配置
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');

let resendApiKey = '';
let emailFrom = '';

lines.forEach(line => {
  if (line.startsWith('RESEND_API_KEY=')) {
    resendApiKey = line.split('=')[1];
  }
  if (line.startsWith('EMAIL_FROM=')) {
    emailFrom = line.split('=')[1];
  }
});

console.log('🔍 配置信息:');
console.log('API Key:', resendApiKey ? '已设置' : '未设置');
console.log('发件人:', emailFrom);

if (!resendApiKey || resendApiKey.includes('your_resend_api_key_here')) {
  console.log('❌ 请先设置 RESEND_API_KEY');
  process.exit(1);
}

async function testSubscriptionEmail() {
  try {
    console.log('\n🧪 测试订阅成功邮件发送...');
    
    // 测试数据
    const testData = {
      to: 'sceut.tw@gmail.com',
      userName: '王小明',
      subscriptionId: 'SUB-' + Date.now().toString().slice(-6),
      periodNo: 'PER' + Date.now().toString().slice(-9),
      monthlyFee: 599,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      perfumeName: 'Chanel No.5',
      perfumeBrand: 'Chanel'
    };

    console.log('📧 邮件数据:', testData);
    
    const result = await sendSubscriptionConfirmationEmail(testData);

    if (result.success) {
      console.log('✅ 订阅确认邮件发送成功!');
      console.log('邮件 ID:', result.result?.data?.id);
      console.log('发送到:', testData.to);
      console.log('发件人:', emailFrom);
      console.log('\n📧 邮件内容预览:');
      console.log('主题: Sceut 訂閱成功通知');
      console.log('收件人: Dear', testData.userName + ',');
      console.log('内容: 您已成功訂閱Sceut的服務，誠摯感謝您成為我們香氣旅程中的同行者...');
      console.log('香水:', testData.perfumeName, '(' + testData.perfumeBrand + ')');
      console.log('月费: NT$', testData.monthlyFee);
      console.log('\n🎉 请检查你的邮箱:', testData.to);
    } else {
      console.error('❌ 邮件发送失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testSubscriptionEmail();
