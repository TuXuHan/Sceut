// 简单测试域名设置
const fs = require('fs');

// 读取环境变量文件
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');

console.log('🔍 检查环境变量设置:');

lines.forEach(line => {
  if (line.includes('RESEND_API_KEY')) {
    console.log('RESEND_API_KEY:', line.includes('your_resend_api_key_here') ? '需要设置' : '已设置');
  }
  if (line.includes('EMAIL_FROM')) {
    console.log('EMAIL_FROM:', line.split('=')[1]);
  }
});

console.log('\n📧 当前发件人设置:');
const emailFromLine = lines.find(line => line.startsWith('EMAIL_FROM='));
if (emailFromLine) {
  const emailFrom = emailFromLine.split('=')[1];
  console.log(emailFrom);
  
  if (emailFrom.includes('sceut.com')) {
    console.log('✅ 已设置为 sceut.com 域名');
  } else {
    console.log('⚠️ 仍在使用测试域名');
  }
} else {
  console.log('❌ 未找到 EMAIL_FROM 设置');
}
