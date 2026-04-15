import { 
  newebpayConfig, 
  API_ENDPOINTS, 
  buildTradeInfo,
  decryptAES,
} from './config';
import { 
  AlterStatusRequest, 
  AlterStatusResponse 
} from './types';
import { fetchWithFixie } from './fixie';

async function extractEncryptedPeriodPayload(rawResponse: unknown): Promise<string> {
  if (typeof rawResponse === 'string') {
    return rawResponse.trim();
  }

  if (
    rawResponse &&
    typeof rawResponse === 'object' &&
    'text' in rawResponse &&
    typeof (rawResponse as Response).text === 'function'
  ) {
    const responseText = (await (rawResponse as Response).text()).trim();

    if (!responseText) {
      throw new Error('Empty response from NeWebPay alter status API');
    }

    try {
      const parsedJson = JSON.parse(responseText);
      if (typeof parsedJson?.Period === 'string') return parsedJson.Period.trim();
      if (typeof parsedJson?.period === 'string') return parsedJson.period.trim();
    } catch {
      // Ignore JSON parse errors and continue to form-urlencoded parsing.
    }

    const params = new URLSearchParams(responseText);
    const periodFromParams = params.get('Period') || params.get('period');
    if (periodFromParams) {
      return periodFromParams.trim();
    }

    const statusFromParams = params.get('Status') || params.get('status');
    const messageFromParams = params.get('Message') || params.get('message');
    if (statusFromParams || messageFromParams) {
      throw new Error(
        `NewebPay alter-status failed: ${statusFromParams || 'ERROR'}${messageFromParams ? ` - ${messageFromParams}` : ''}`
      );
    }

    return responseText;
  }

  if (rawResponse && typeof rawResponse === 'object') {
    const maybePeriod =
      (rawResponse as { Period?: unknown }).Period ??
      (rawResponse as { period?: unknown }).period;
    if (typeof maybePeriod === 'string') {
      return maybePeriod.trim();
    }
  }

  throw new Error('Unexpected response shape from NeWebPay alter status API');
}

/**
 * Alter periodic payment status
 * 修改委託狀態
 * Based on NeWebPay documentation 4.4 修改委託狀態[NPA-B051]
 */
export async function alterPeriodicPaymentStatus(requestData: AlterStatusRequest): Promise<AlterStatusResponse> {
  try {
    console.log('=== MANUAL ALTER STATUS IMPLEMENTATION ===');
    console.log('Altering periodic payment status with data:', requestData);

    // Prepare the request data according to NeWebPay documentation 4.4.1 請求參數
    const apiRequestData = {
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000).toString(),
      Version: "1.0",
      MerOrderNo: requestData.MerOrderNo,
      PeriodNo: requestData.PeriodNo,
      AlterType: requestData.AlterType, // suspend, terminate, restart
    };

    console.log('Request data:', apiRequestData);

    // Build the encrypted PostData_ using the manual implementation
    const postData = buildTradeInfo(apiRequestData);

    console.log('Encrypted PostData:', postData);

    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append("MerchantID_", newebpayConfig.merchantId);
    formData.append("PostData_", postData);

    console.log('Form data to send:', formData.toString());
    console.log('Sending API request to /MPG/period/AlterStatus using Fixie proxy');

    // Send the request using Fixie proxy
    const response = await fetchWithFixie(API_ENDPOINTS[newebpayConfig.env].alterStatus, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    console.log('Encrypted period data:', response);

    const encryptedPeriod = await extractEncryptedPeriodPayload(response);
    console.log('Encrypted period payload:', encryptedPeriod);

    const decryptedData = decryptAES(encryptedPeriod);
    const cleanedData = decryptedData.replace(/\0+$/, '').trim();
    const responseJson = JSON.parse(cleanedData);
    console.log('Decrypted data:', responseJson);

    return responseJson;
  } catch (error: any) {
    console.error('=== MANUAL ALTER STATUS ERROR ===');
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
        MerOrderNo: requestData.MerOrderNo,
        PeriodNo: requestData.PeriodNo,
        AlterType: requestData.AlterType,
      }
    };
  }
}

/**
 * Suspend a periodic payment
 * 暫停定期定額委託
 */
export async function suspendPeriodicPayment(merOrderNo: string, periodNo: string): Promise<AlterStatusResponse> {
  return alterPeriodicPaymentStatus({
    MerOrderNo: merOrderNo,
    PeriodNo: periodNo,
    AlterType: 'suspend'
  });
}

/**
 * Terminate a periodic payment
 * 終止定期定額委託
 */
export async function terminatePeriodicPayment(merOrderNo: string, periodNo: string): Promise<AlterStatusResponse> {
  return alterPeriodicPaymentStatus({
    MerOrderNo: merOrderNo,
    PeriodNo: periodNo,
    AlterType: 'terminate'
  });
}

/**
 * Restart a suspended periodic payment
 * 重啟暫停的定期定額委託
 */
export async function restartPeriodicPayment(merOrderNo: string, periodNo: string): Promise<AlterStatusResponse> {
  return alterPeriodicPaymentStatus({
    MerOrderNo: merOrderNo,
    PeriodNo: periodNo,
    AlterType: 'restart'
  });
}

/**
 * Generate a sample alter status request for testing
 */
export function generateSampleAlterStatusRequest(): AlterStatusRequest {
  return {
    MerOrderNo: "PERIODIC_1234567890_001",
    PeriodNo: "P250826164206eF4fuH", // Hardcoded for testing
    AlterType: "terminate"
  };
}
