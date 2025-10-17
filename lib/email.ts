import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SubscriptionConfirmationEmailData {
  to: string;
  userName: string;
  subscriptionId: string;
  periodNo: string;
  monthlyFee: number;
  nextPaymentDate: string;
  perfumeName?: string;
  perfumeBrand?: string;
}

/**
 * 發送訂閱確認郵件
 */
export async function sendSubscriptionConfirmationEmail(data: SubscriptionConfirmationEmailData) {
  try {
    console.log('📧 準備發送訂閱確認郵件到:', data.to);

    const { to, userName, periodNo, monthlyFee, nextPaymentDate, perfumeName, perfumeBrand } = data;

    // 格式化日期
    const formattedNextPaymentDate = new Date(nextPaymentDate).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sceut 訂閱成功通知</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', 'Microsoft JhengHei', sans-serif; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                
                <!-- Subject Line -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                  </td>
                </tr>

                <!-- Salutation -->
                <tr>
                  <td style="padding: 0 0 30px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      Dear <strong>${userName}</strong>,
                    </p>
                  </td>
                </tr>

                <!-- Subscription Success Message -->
                <tr>
                  <td style="padding: 0 0 30px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      您已成功訂閱Sceut的服務，誠摯感謝您成為我們香氣旅程中的同行者。商品出貨後，我們將以電子郵件通知您貨號，您也可隨時登入 Sceut 官網查詢物流狀態，掌握物流狀況。
                    </p>
                  </td>
                </tr>

                <!-- Thank You Message -->
                <tr>
                  <td style="padding: 0 0 30px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      感謝您選擇了 Sceut，對我們而言，每一次相遇都值得被記住。我們真誠期待您的回饋，希望我們能共同譜寫動人的香氛篇章。
                    </p>
                  </td>
                </tr>

                <!-- Social Media Link -->
                <tr>
                  <td style="padding: 0 0 30px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      歡迎追蹤我們的 Instagram (<a href="https://instagram.com/Sceut_tw" style="color: #0066cc; text-decoration: underline;">@Sceut_tw</a>)，獲得第一手品牌消息與香水知識。
                    </p>
                  </td>
                </tr>

                <!-- Journey Commencement -->
                <tr>
                  <td style="padding: 0 0 30px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      屬於您的香氣之旅，正式啟程。
                    </p>
                  </td>
                </tr>

                <!-- Closing and Sender -->
                <tr>
                  <td style="padding: 0 0 30px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      祝您一切安好，<br>
                      Sceut 香氣團隊 敬上
                    </p>
                  </td>
                </tr>

                <!-- Footer Email Address -->
                <tr>
                  <td style="padding: 20px 0 0 0;">
                    <p style="color: #000000; font-size: 14px; margin: 0; text-align: left;">
                      sceut.tw@gmail.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Sceut <onboarding@resend.dev>',
      to,
      subject: 'Sceut 訂閱成功通知',
      html: emailHtml,
    });

    console.log('✅ 訂閱確認郵件發送成功:', result);
    return { success: true, result };
  } catch (error) {
    console.error('❌ 發送訂閱確認郵件失敗:', error);
    // 不要因為郵件發送失敗而中斷整個流程
    return { success: false, error };
  }
}

/**
 * 發送訂閱取消確認郵件
 */
export async function sendSubscriptionCancellationEmail(data: {
  to: string;
  userName: string;
  subscriptionId: string;
  monthlyFee: number;
}) {
  try {
    console.log('📧 準備發送訂閱取消確認郵件到:', data.to);

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>訂閱取消確認</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', 'Microsoft JhengHei', sans-serif; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                
                <!-- Subject Line -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <h1 style="color: #000000; margin: 0; font-size: 18px; font-weight: bold; text-align: left;">
                      主旨: Sceut 訂閱取消確認
                    </h1>
                  </td>
                </tr>

                <!-- Salutation -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      Dear <strong>${data.userName}</strong>,
                    </p>
                  </td>
                </tr>

                <!-- Cancellation Message -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      我們已收到您的訂閱取消請求。很遺憾看到您離開，希望未來有機會再次為您服務。
                    </p>
                  </td>
                </tr>

                <!-- Thank You Message -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      感謝您曾經選擇 Sceut，對我們而言，每一次相遇都值得被記住。如果您改變主意，隨時歡迎回來重新訂閱。
                    </p>
                  </td>
                </tr>

                <!-- Social Media Link -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      歡迎繼續追蹤我們的 Instagram (<a href="https://instagram.com/Sceut_tw" style="color: #0066cc; text-decoration: underline;">@Sceut_tw</a>)，獲得第一手品牌消息與香水知識。
                    </p>
                  </td>
                </tr>

                <!-- Closing and Sender -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0; text-align: left;">
                      祝您一切安好，<br>
                      Sceut 香氣團隊 敬上
                    </p>
                  </td>
                </tr>

                <!-- Footer Email Address -->
                <tr>
                  <td style="padding: 20px 0 0 0;">
                    <p style="color: #000000; font-size: 14px; margin: 0; text-align: left;">
                      sceut.tw@gmail.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Sceut <onboarding@resend.dev>',
      to: data.to,
      subject: 'Sceut 訂閱取消確認',
      html: emailHtml,
    });

    console.log('✅ 訂閱取消確認郵件發送成功:', result);
    return { success: true, result };
  } catch (error) {
    console.error('❌ 發送訂閱取消確認郵件失敗:', error);
    return { success: false, error };
  }
}