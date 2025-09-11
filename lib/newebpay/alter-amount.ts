import { 
  newebpayConfig, 
  API_ENDPOINTS, 
  buildTradeInfo, 
  sendApiRequest 
} from './config';
import { 
  AlterAmountRequest, 
  AlterAmountResponse 
} from './types';

/**
 * Alter periodic payment amount and content
 * 修改委託內容
 * Based on NeWebPay documentation 4.5 修改委託內容[NPA-B052]
 */
export async function alterPeriodicPaymentAmount(data: AlterAmountRequest): Promise<AlterAmountResponse> {
  try {
    console.log('=== MANUAL ALTER AMOUNT IMPLEMENTATION ===');
    console.log('Altering periodic payment amount with data:', data);

    // Prepare the request data according to NeWebPay documentation 4.5.1 請求參數
    const requestData: any = {
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000).toString(),
      Version: "1.2",
      MerOrderNo: data.MerOrderNo,
      PeriodNo: data.PeriodNo,
    };

    // Add optional parameters if provided
    if (data.AlterAmt !== undefined) {
      requestData.AlterAmt = data.AlterAmt;
    }
    if (data.PeriodType !== undefined) {
      requestData.PeriodType = data.PeriodType;
    }
    if (data.PeriodPoint !== undefined) {
      requestData.PeriodPoint = data.PeriodPoint;
    }
    if (data.PeriodTimes !== undefined) {
      requestData.PeriodTimes = data.PeriodTimes;
    }
    if (data.Extday !== undefined) {
      requestData.Extday = data.Extday;
    }
    if (data.NotifyURL !== undefined) {
      requestData.NotifyURL = data.NotifyURL;
    }

    console.log('Request data:', requestData);

    // Build the encrypted PostData_ using the manual implementation
    const postData = buildTradeInfo(requestData);

    console.log('Encrypted PostData:', postData);

    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append("MerchantID_", newebpayConfig.merchantId);
    formData.append("PostData_", postData);

    console.log('Form data to send:', formData.toString());
    console.log('Sending API request to /MPG/period/AlterAmt');

    // Send the request
    const result = await sendApiRequest(
      API_ENDPOINTS[newebpayConfig.env].alterAmount,
      formData
    );

    console.log('API response:', result);

    // Parse the response according to NeWebPay documentation 4.5.2 回應參數
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
    console.error('=== MANUAL ALTER AMOUNT ERROR ===');
    console.error('Error type:', error?.constructor?.name || 'Unknown');
    console.error('Error message:', error?.message || 'No message');
    console.error('Error code:', error?.code || 'No code');
    console.error('Error response:', error?.response?.data || 'No response data');
    console.error('Error status:', error?.response?.status || 'No status');
    console.error('Error headers:', error?.response?.headers || 'No headers');
    console.error('=== END ERROR ===');

    return {
      Status: "ERROR",
      Message: error instanceof Error ? error.message : 'Unknown error',
      Result: {
        MerOrderNo: data.MerOrderNo,
        PeriodNo: data.PeriodNo,
      }
    };
  }
}

/**
 * Change the amount of a periodic payment
 * 修改定期定額委託金額
 */
export async function changePeriodicPaymentAmount(
  merOrderNo: string, 
  periodNo: string, 
  newAmount: number
): Promise<AlterAmountResponse> {
  return alterPeriodicPaymentAmount({
    MerOrderNo: merOrderNo,
    PeriodNo: periodNo,
    AlterAmt: newAmount
  });
}

/**
 * Change the period type and point of a periodic payment
 * 修改定期定額委託週期
 */
export async function changePeriodicPaymentPeriod(
  merOrderNo: string, 
  periodNo: string, 
  periodType: 'D' | 'W' | 'M' | 'Y',
  periodPoint: string
): Promise<AlterAmountResponse> {
  return alterPeriodicPaymentAmount({
    MerOrderNo: merOrderNo,
    PeriodNo: periodNo,
    PeriodType: periodType,
    PeriodPoint: periodPoint
  });
}

/**
 * Change the total number of periods
 * 修改定期定額委託總期數
 */
export async function changePeriodicPaymentTimes(
  merOrderNo: string, 
  periodNo: string, 
  periodTimes: number
): Promise<AlterAmountResponse> {
  return alterPeriodicPaymentAmount({
    MerOrderNo: merOrderNo,
    PeriodNo: periodNo,
    PeriodTimes: periodTimes
  });
}

/**
 * Change the credit card expiry date
 * 修改信用卡到期日
 */
export async function changeCreditCardExpiry(
  merOrderNo: string, 
  periodNo: string, 
  expiryDate: string // Format: YYMM (e.g., "2512" for December 2025)
): Promise<AlterAmountResponse> {
  return alterPeriodicPaymentAmount({
    MerOrderNo: merOrderNo,
    PeriodNo: periodNo,
    Extday: expiryDate
  });
}

/**
 * Change the notification URL
 * 修改通知網址
 */
export async function changeNotificationURL(
  merOrderNo: string, 
  periodNo: string, 
  notifyURL: string
): Promise<AlterAmountResponse> {
  return alterPeriodicPaymentAmount({
    MerOrderNo: merOrderNo,
    PeriodNo: periodNo,
    NotifyURL: notifyURL
  });
}

/**
 * Generate a sample alter amount request for testing
 */
export function generateSampleAlterAmountRequest(): AlterAmountRequest {
  return {
    MerOrderNo: "PERIODIC_1234567890_001",
    PeriodNo: "P250826164206eF4fuH", // Hardcoded for testing
    AlterAmt: 150, // Change amount to 150
    PeriodType: "M", // Monthly
    PeriodPoint: "10", // 10th of each month
    PeriodTimes: 6, // 6 months
    Extday: "2512", // December 2025
    NotifyURL: "https://your-domain.com/api/payment/notify"
  };
}
