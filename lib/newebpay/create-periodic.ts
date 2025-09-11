import { 
  newebpayConfig, 
  API_ENDPOINTS, 
  buildTradeInfo, 
  sendApiRequest,
  generateMerchantTradeNo 
} from './config';
import { 
  PeriodicPaymentRequest, 
  PeriodicPaymentResponse, 
  PeriodicPaymentFormData 
} from './types';

/**
 * Create a periodic payment form
 * 建立信用卡定期定額付款表單
 * Based on NeWebPay documentation 4.3 建立委託[NPA-B05]
 */
export function createPeriodicPaymentForm(data: PeriodicPaymentRequest): string {
  try {
    // Prepare form data according to NeWebPay documentation 4.3.1 請求參數
    // Include all required parameters that the SDK was using
    const formData: PeriodicPaymentFormData = {
      LangType: "zh-Tw",
      MerOrderNo: data.MerOrderNo,
      ProdDesc: data.ProdDesc,
      Version: "1.5",
      PeriodAmt: data.PeriodAmt,
      PeriodType: data.PeriodType,
      PeriodPoint: data.PeriodPoint,
      PeriodStartType: parseInt(data.PeriodStartType) as 1 | 2 | 3,
      PeriodTimes: data.PeriodTimes,
      PeriodFirstdate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      PeriodMemo: data.PeriodMemo || "",
      PayerEmail: "test@example.com", // Default email, can be made configurable
      EmailModify: 1, // Don't allow email modification (same as SDK)
      PaymentInfo: "N", // Don't show payment info fields (same as SDK)
      OrderInfo: "N", // Don't show order info fields (same as SDK)
      ReturnURL: data.ReturnURL,
      NotifyURL: data.NotifyURL,
      BackURL: data.BackURL,
      UNIONPAY: 0, // Disable UnionPay (same as SDK)
    };

    console.log('Creating periodic payment form with data:', formData);

    // Build the encrypted PostData_ using the manual implementation
    // Include all required parameters according to NeWebPay documentation
    const requestData = {
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000).toString(),
      Version: "1.5",
      LangType: formData.LangType,
      MerOrderNo: formData.MerOrderNo,
      ProdDesc: formData.ProdDesc,
      PeriodAmt: formData.PeriodAmt,
      PeriodType: formData.PeriodType,
      PeriodPoint: formData.PeriodPoint,
      PeriodStartType: formData.PeriodStartType,
      PeriodTimes: formData.PeriodTimes,
      PeriodFirstdate: formData.PeriodFirstdate,
      PeriodMemo: formData.PeriodMemo,
      PayerEmail: formData.PayerEmail,
      EmailModify: formData.EmailModify,
      PaymentInfo: formData.PaymentInfo,
      OrderInfo: formData.OrderInfo,
      ReturnURL: formData.ReturnURL,
      NotifyURL: formData.NotifyURL,
      BackURL: formData.BackURL,
      UNIONPAY: formData.UNIONPAY,
    };

    console.log('Request data before encryption:', requestData);
    const postData = buildTradeInfo(requestData);

    console.log('Encrypted PostData:', postData);

    // Generate the HTML form
    const formHtml = `
      <form method="post" action="${API_ENDPOINTS[newebpayConfig.env].createPeriodic}" id="newebpay-form">
        <input type="hidden" name="MerchantID_" value="${newebpayConfig.merchantId}" />
        <input type="hidden" name="PostData_" value="${postData}" />
        <input type="submit" value="Submit to NeWebPay" style="display: none;" />
      </form>
      <script>
        // Auto-submit the form
        document.getElementById('newebpay-form').submit();
      </script>
    `;

    console.log('Generated form HTML (first 500 chars):', formHtml.substring(0, 500));
    
    return formHtml;
  } catch (error) {
    console.error('Error creating periodic payment form:', error);
    throw new Error('Failed to create periodic payment form');
  }
}

/**
 * Create periodic payment programmatically (without form)
 * This is useful for server-to-server communication
 */
export async function createPeriodicPayment(data: PeriodicPaymentRequest): Promise<PeriodicPaymentResponse> {
  try {
    console.log('Creating periodic payment with data:', data);

    // Prepare form data
    const formData: PeriodicPaymentFormData = {
      LangType: data.Language || "zh-Tw",
      MerOrderNo: data.MerOrderNo,
      ProdDesc: data.ProdDesc,
      Version: "1.5",
      PeriodAmt: data.PeriodAmt,
      PeriodType: data.PeriodType,
      PeriodPoint: data.PeriodPoint,
      PeriodStartType: parseInt(data.PeriodStartType) as 1 | 2 | 3,
      PeriodTimes: data.PeriodTimes,
      PeriodFirstdate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      PeriodMemo: data.PeriodMemo || "",
      PayerEmail: "test@example.com",
      EmailModify: 1, // Don't allow email modification (same as SDK)
      PaymentInfo: "N",
      OrderInfo: "N",
      ReturnURL: data.ReturnURL,
      NotifyURL: data.NotifyURL,
      BackURL: data.BackURL,
      UNIONPAY: 0,
    };

    // Build the encrypted PostData_
    // Include all required parameters according to NeWebPay documentation
    const requestData = {
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000).toString(),
      Version: "1.5",
      LangType: formData.LangType,
      MerOrderNo: formData.MerOrderNo,
      ProdDesc: formData.ProdDesc,
      PeriodAmt: formData.PeriodAmt,
      PeriodType: formData.PeriodType,
      PeriodPoint: formData.PeriodPoint,
      PeriodStartType: formData.PeriodStartType,
      PeriodTimes: formData.PeriodTimes,
      PeriodFirstdate: formData.PeriodFirstdate,
      PeriodMemo: formData.PeriodMemo,
      PayerEmail: formData.PayerEmail,
      EmailModify: formData.EmailModify,
      PaymentInfo: formData.PaymentInfo,
      OrderInfo: formData.OrderInfo,
      ReturnURL: formData.ReturnURL,
      NotifyURL: formData.NotifyURL,
      BackURL: formData.BackURL,
      UNIONPAY: formData.UNIONPAY,
    };

    console.log('Request data before encryption:', requestData);
    const postData = buildTradeInfo(requestData);

    // Create form data for the request
    const requestFormData = new URLSearchParams();
    requestFormData.append("MerchantID_", newebpayConfig.merchantId);
    requestFormData.append("PostData_", postData);

    console.log('Sending API request to create periodic payment');

    // Send the request
    const result = await sendApiRequest(
      API_ENDPOINTS[newebpayConfig.env].createPeriodic,
      requestFormData
    );

    console.log('API response:', result);

    // Parse the response
    if (typeof result.data === "string") {
      // Handle string response (usually error)
      const response = new URLSearchParams(result.data);
      return {
        Status: response.get("Status") || "ERROR",
        Message: response.get("Message") || "Unknown error",
      };
    } else {
      // Handle JSON response
      return result.data;
    }
  } catch (error: any) {
    console.error('Error creating periodic payment:', error);
    return {
      Status: "ERROR",
      Message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse periodic payment response from NeWebPay
 * Based on NeWebPay documentation 4.3.2 回應參數-建立完成
 */
export function parsePeriodicPaymentResponse(toParse: string): PeriodicPaymentResponse {
  try {
    console.log('Encrypted period data:', toParse);

    // Decrypt the response
    const decryptedData = require('./config').decryptAES(toParse);
    console.log('Decrypted data:', decryptedData);

    // Clean the decrypted data - remove any trailing null bytes or invalid characters
    const cleanedData = decryptedData.replace(/\0+$/, '').trim();
    console.log('Cleaned data length:', cleanedData.length);
    console.log('Cleaned data:', cleanedData);

    // Parse the JSON response
    const parsedResponse = JSON.parse(cleanedData);
    console.log('Parsed response:', parsedResponse);

    return parsedResponse;
  } catch (error) {
    console.error('Error parsing periodic payment response:', error);
    throw new Error('Failed to parse periodic payment response');
  }
}

/**
 * Generate a sample periodic payment request for testing
 */
export function generateSamplePeriodicPaymentRequest(): PeriodicPaymentRequest {
  return {
    MerOrderNo: generateMerchantTradeNo(),
    ProdDesc: "Test Periodic Payment",
    PeriodAmt: 100,
    PeriodType: "M", // Monthly
    PeriodPoint: "05", // 5th of each month
    PeriodStartType: "2", // Immediate payment
    PeriodTimes: 12, // 12 months
    ReturnURL: "https://your-domain.com/payment/result",
    NotifyURL: "https://your-domain.com/api/payment/notify",
    BackURL: "https://your-domain.com/payment/cancel",
    Language: "zh-Tw",
  };
}
