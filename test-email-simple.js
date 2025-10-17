// 简单测试邮件发送
const { Resend } = require('resend');

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

const resend = new Resend(resendApiKey);

async function testEmail() {
  try {
    console.log('\n🧪 测试邮件发送...');
    
    const result = await resend.emails.send({
      from: emailFrom,
      to: 'sceut.tw@gmail.com',
      subject: '测试邮件 - sceut.com 域名验证',
      html: `
        <h1>🎉 域名测试成功！</h1>
        <p>恭喜！你的 sceut.com 域名已经成功设置。</p>
        <p><strong>发件人:</strong> ${emailFrom}</p>
        <p><strong>收件人:</strong> sceut.tw@gmail.com</p>
        <p><strong>发送时间:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>现在你可以发送邮件给任何邮箱地址了！</p>
      `,
    });

    console.log('✅ 邮件发送成功!');
    console.log('邮件 ID:', result.data?.id);
    console.log('请检查你的邮箱: sceut.tw@gmail.com');
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);
    if (error.message.includes('domain is not verified')) {
      console.log('💡 提示: 域名可能还没有完全验证，请检查 Resend 控制台');
    }
  }
}

testEmail();
