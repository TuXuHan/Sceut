// 测试域名设置
require('dotenv').config({ path: '.env.local' });

console.log('🔍 检查环境变量设置:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '已设置' : '未设置');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

// 测试 Resend 连接
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  try {
    console.log('\n🧪 测试 Resend 连接...');
    
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Sceut <onboarding@resend.dev>',
      to: 'sceut.tw@gmail.com',
      subject: '测试邮件 - sceut.com 域名',
      html: `
        <h1>测试邮件</h1>
        <p>这是一封测试邮件，验证 sceut.com 域名设置。</p>
        <p>发件人: ${process.env.EMAIL_FROM}</p>
        <p>时间: ${new Date().toLocaleString()}</p>
      `,
    });

    console.log('✅ 邮件发送成功:', result);
  } catch (error) {
    console.error('❌ 邮件发送失败:', error);
  }
}

testResend();
