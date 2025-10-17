// 测试发送给任意邮箱
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

const resend = new Resend(resendApiKey);

async function testAnyEmail() {
  try {
    console.log('🧪 测试发送给任意邮箱...');
    console.log('发件人:', emailFrom);
    
    // 测试发送给一个示例邮箱（你可以替换为任何邮箱）
    const testEmail = 'test@example.com'; // 这里可以替换为任何邮箱地址
    
    const result = await resend.emails.send({
      from: emailFrom,
      to: testEmail,
      subject: 'Sceut 訂閱成功通知 - 域名测试',
      html: `
        <h1>🎉 域名验证成功！</h1>
        <p>恭喜！你的 sceut.com 域名已经成功验证，现在可以发送邮件给任何邮箱地址了。</p>
        
        <h2>邮件信息</h2>
        <ul>
          <li><strong>发件人:</strong> ${emailFrom}</li>
          <li><strong>收件人:</strong> ${testEmail}</li>
          <li><strong>发送时间:</strong> ${new Date().toLocaleString()}</li>
          <li><strong>域名状态:</strong> ✅ 已验证</li>
        </ul>
        
        <h2>订阅确认邮件内容</h2>
        <p>Dear 测试用户,</p>
        <p>您已成功訂閱Sceut的服務，誠摯感謝您成為我們香氣旅程中的同行者。商品出貨後，我們將以電子郵件通知您貨號，您也可隨時登入 Sceut 官網查詢物流狀態，掌握物流狀況。</p>
        <p>感謝您選擇了 Sceut，對我們而言，每一次相遇都值得被記住。我們真誠期待您的回饋，希望我們能共同譜寫動人的香氛篇章。</p>
        <p>歡迎追蹤我們的 Instagram (@Sceut_tw)，獲得第一手品牌消息與香水知識。</p>
        <p>屬於您的香氣之旅，正式啟程。</p>
        <p>祝您一切安好，<br>Sceut 香氣團隊 敬上</p>
        
        <hr>
        <p><small>sceut.tw@gmail.com</small></p>
      `,
    });

    console.log('✅ 邮件发送成功!');
    console.log('邮件 ID:', result.data?.id);
    console.log('发送到:', testEmail);
    console.log('🎉 现在你可以发送邮件给任何邮箱地址了！');
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);
  }
}

testAnyEmail();
