import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Fixie configuration
export interface FixieConfig {
  fixieUrl?: string;
  fixieSocksHost?: string;
  enabled: boolean;
}

// Get Fixie configuration from environment variables
export function getFixieConfig(): FixieConfig {
  return {
    fixieUrl: process.env.FIXIE_URL,
    fixieSocksHost: process.env.FIXIE_SOCKS_HOST,
    enabled: !!(process.env.FIXIE_URL || process.env.FIXIE_SOCKS_HOST)
  };
}

// Create axios instance with Fixie proxy
export function createAxiosWithFixie() {
  const config = getFixieConfig();
  
  if (!config.enabled || !config.fixieUrl) {
    console.log('Fixie not configured, using direct connection');
    return axios;
  }

  console.log('Using Fixie proxy for outbound requests');
  
  const agent = new HttpsProxyAgent(config.fixieUrl);
  
  return axios.create({
    httpsAgent: agent,
    proxy: false
  });
}

// Enhanced fetch function that uses Fixie proxy
export async function fetchWithFixie(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const axiosInstance = createAxiosWithFixie();
  console.log('Axios instance created with Fixie', url, options);
  
  try {
    const method = options.method || 'GET';
    const axiosConfig: any = {
      method: method.toLowerCase(),
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers,
      },
    };

    // Add body for POST/PUT/PATCH requests
    if (options.body && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      axiosConfig.data = options.body;
    }
    
    const response = await axiosInstance.request(axiosConfig);

    console.log('Response:', response.data);
    
    // Convert axios response to fetch-like Response
    return response.data.period;
  } catch (error: any) {
    console.log("Axios error:", error.message);
    
    // If proxy fails with access denied, try direct connection
    if (error.response?.status === 403 || error.response?.data?.includes('Access Denied')) {
      console.log('Proxy blocked, trying direct connection...');
      try {
        const directResponse = await fetch(url, options);
        return directResponse;
      } catch (directError) {
        console.log('Direct connection also failed:', directError);
      }
    }
    
    if (error.response) {
      return new Response(error.response.data, {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers as any
      });
    }
    throw error;
  }
}

// Test function to verify Fixie is working
export async function testFixieConnection(): Promise<{ success: boolean; ip?: string; error?: string }> {
  try {
    console.log('Testing Fixie connection...');
    
    const config = getFixieConfig();
    console.log('Fixie config:', {
      enabled: config.enabled,
      hasFixieUrl: !!config.fixieUrl,
      fixieUrl: config.fixieUrl ? config.fixieUrl.replace(/\/\/fixie:[^@]+@/, '//fixie:***@') : undefined
    });
    
    const response = await fetchWithFixie('http://checkip.amazonaws.com/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const ip = await response.text();
    console.log('Current IP address:', ip.trim());
    
    return {
      success: true,
      ip: ip.trim()
    };
  } catch (error) {
    console.error('Fixie test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
