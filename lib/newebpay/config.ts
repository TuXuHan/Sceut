import crypto from 'crypto';

// NeWebPay configuration
export const newebpayConfig = {
  merchantId: process.env.NEWEBPAY_MERCHANT_ID || 'MS123456789',
  hashKey: process.env.NEWEBPAY_HASH_KEY || 'IaWudQJsuOT994cpHRWzv7Ge67yC1cE3', // 32 characters
  hashIV: process.env.NEWEBPAY_HASH_IV || 'C1dLm3nxZRVlmBSP', // 16 characters
  env: (process.env.NEWEBPAY_ENV === 'production' ? 'production' : 'sandbox') as 'production' | 'sandbox',
};

// API endpoints
export const API_ENDPOINTS = {
  sandbox: {
    createPeriodic: 'https://ccore.newebpay.com/MPG/period',
    alterStatus: 'https://ccore.newebpay.com/MPG/period/AlterStatus',
    alterAmount: 'https://ccore.newebpay.com/MPG/period/AlterAmt',
  },
  production: {
    createPeriodic: 'https://core.newebpay.com/MPG/period',
    alterStatus: 'https://core.newebpay.com/MPG/period/AlterStatus',
    alterAmount: 'https://core.newebpay.com/MPG/period/AlterAmt',
  }
};

/**
 * AES-256-CBC encryption with PKCS7 padding
 * Based on NeWebPay documentation 4.1 AES256加密
 */
export function encryptAES(data: string): string {
  try {
    // Use createCipheriv instead of deprecated createCipher
    const cipher = crypto.createCipheriv('aes-256-cbc', newebpayConfig.hashKey, newebpayConfig.hashIV);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('AES encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * AES-256-CBC decryption with custom padding removal
 * Based on NeWebPay documentation 4.2 AES256解密
 */
export function decryptAES(encryptedData: string): string {
  try {
    console.log('Decrypting data length:', encryptedData.length);
    console.log('HashKey length:', newebpayConfig.hashKey.length);
    console.log('HashIV length:', newebpayConfig.hashIV.length);
    
    // Convert hex string to buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'hex');
    console.log('Encrypted buffer length:', encryptedBuffer.length);
    
    // Use createDecipheriv with OPENSSL_RAW_DATA equivalent
    const decipher = crypto.createDecipheriv('aes-256-cbc', newebpayConfig.hashKey, newebpayConfig.hashIV);
    decipher.setAutoPadding(false); // Disable auto padding to handle it manually
    
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    console.log('Decrypted buffer length:', decrypted.length);
    
    // Remove PKCS7 padding manually (like the strippadding function in the docs)
    const lastByte = decrypted[decrypted.length - 1];
    console.log('Last byte (padding indicator):', lastByte);
    
    if (lastByte > 0 && lastByte <= 16) {
      // Check if the padding is valid
      const padding = decrypted.subarray(decrypted.length - lastByte);
      const expectedPadding = Buffer.alloc(lastByte, lastByte);
      if (padding.equals(expectedPadding)) {
        decrypted = decrypted.subarray(0, decrypted.length - lastByte);
        console.log('Padding removed, final length:', decrypted.length);
      } else {
        console.log('Invalid padding detected');
      }
    } else {
      // If lastByte is not a valid padding indicator, try to find the end of valid JSON
      console.log('No valid padding found, trying to find JSON end');
      const decryptedString = decrypted.toString('utf8');
      const jsonEndIndex = decryptedString.lastIndexOf('}');
      if (jsonEndIndex > 0) {
        decrypted = Buffer.from(decryptedString.substring(0, jsonEndIndex + 1), 'utf8');
        console.log('Truncated to JSON end, new length:', decrypted.length);
      }
    }
    
    const result = decrypted.toString('utf8');
    console.log('Final decrypted result:', result);
    return result;
  } catch (error) {
    console.error('AES decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate CheckMacValue using SHA256
 * Based on NeWebPay documentation
 */
export function generateCheckMacValue(data: Record<string, any>): string {
  try {
    // Sort parameters alphabetically
    const sortedKeys = Object.keys(data).sort();
    
    // Build query string
    const queryString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    // Add HashKey and HashIV
    const checkString = `HashKey=${newebpayConfig.hashKey}&${queryString}&HashIV=${newebpayConfig.hashIV}`;
    
    // Convert to uppercase and encode
    const encodedString = encodeURIComponent(checkString).toLowerCase();
    
    // Generate SHA256 hash
    const hash = crypto.createHash('sha256').update(encodedString).digest('hex');
    
    return hash.toUpperCase();
  } catch (error) {
    console.error('CheckMacValue generation error:', error);
    throw new Error('Failed to generate CheckMacValue');
  }
}

/**
 * Generate a unique merchant trade number
 */
export function generateMerchantTradeNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PERIODIC_${timestamp}_${random}`;
}

/**
 * Format current date for NeWebPay
 */
export function formatMerchantTradeDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Build trade info with encryption
 * This is the core function that encrypts the data according to NeWebPay specs
 */
export function buildTradeInfo(data: Record<string, any>): string {
  try {
    console.log('Building trade info with data:', data);
    
    // Add CheckMacValue
    const dataWithCheckMac: Record<string, any> = {
      ...data,
      // CheckMacValue: generateCheckMacValue(data)
    };
    
    console.log('Data with CheckMacValue:', dataWithCheckMac);
    
    // Build query string
    const queryString = Object.keys(dataWithCheckMac)
      .sort()
      .map(key => `${key}=${dataWithCheckMac[key]}`)
      .join('&');
    
    console.log('Query string before encryption:', queryString);
    
    // Encrypt the query string
    const encrypted = encryptAES(queryString);
    console.log('Encrypted result:', encrypted);
    
    return encrypted;
  } catch (error) {
    console.error('Build trade info error:', error);
    throw new Error('Failed to build trade info');
  }
}

/**
 * Send API request to NeWebPay
 */
export async function sendApiRequest(endpoint: string, formData: URLSearchParams): Promise<any> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return { data };
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}
