'use client';

import { useState } from 'react';

interface PeriodicPaymentFormData {
  ProdDesc: string;
  PeriodAmt: number;
  PeriodType: 'D' | 'M' | 'Y';
  PeriodPoint: string;
  PeriodStartType: '1' | '2';
  PeriodTimes: number;
  Language?: 'ZH-TW' | 'EN-US' | 'JP';
  PeriodMemo?: string;
}

const SUBSCRIPTION_PRICE = parseInt(process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE || '0');

export default function PeriodicPaymentForm() {

  const [formData, setFormData] = useState<PeriodicPaymentFormData>({
    ProdDesc: 'Sceut 香水訂閱',
    PeriodAmt: SUBSCRIPTION_PRICE || 0,
    PeriodType: 'M',
    PeriodPoint: (new Date().getDate()).toString().padStart(2, '0'),
    PeriodStartType: '2',
    PeriodTimes: 99,
    Language: 'ZH-TW',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: PeriodicPaymentFormData) => ({
      ...prev,
      [name]: name === 'PeriodAmt' || name === 'PeriodTimes' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    console.log('🚀 Starting payment process...');
    console.log('📋 Form data:', formData);

    try {
      console.log('📡 Sending request to /api/newebpay/request...');
      const response = await fetch('/api/newebpay/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create periodic payment');
      }

      setResult(data);
      
      // Auto-submit the form to NeWebPay
      if (data.formHtml) {
        console.log('🔄 Auto-submitting form to NeWebPay...');
        const div = document.createElement('div');
        div.innerHTML = data.formHtml;
        document.body.appendChild(div);
        const form = div.querySelector('form');
        if (form) {
          console.log('✅ Form found, submitting...');
          form.submit();
        } else {
          console.error('❌ Form not found in HTML');
          setError('Form submission failed - form not found');
        }
      } else {
        console.error('❌ No form HTML received');
        setError('Form submission failed - no form HTML received');
      }

    } catch (err) {
      console.error('❌ Payment process error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryPayment = async () => {
    if (!result?.merchantTradeNo) {
      setError('No merchant trade number available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/periodic-payment/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          MerchantTradeNo: result.merchantTradeNo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to query payment');
      }

      setResult((prev: any) => ({ ...prev, queryResult: data.data }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">信用卡定期定額付款</h2>
      
      {/* 重要說明 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 重要說明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>每月僅收取 NT$ {SUBSCRIPTION_PRICE}</strong>，不會一次性收取全部金額</li>
          <li>• 您可以隨時在會員中心取消訂閱，取消後不會再收取費用</li>
          <li>• 總授權金額僅為系統設定，實際扣款為每月 NT$ {SUBSCRIPTION_PRICE}</li>
          <li>• 首次付款將於提交後立即開始，之後每月自動扣款</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品描述
            </label>
            <p className='text-gray-700'>{formData.ProdDesc}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              每月金額
            </label>
            <p className='text-gray-700'>NT$ {formData.PeriodAmt}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              訂閱長度 (月)
            </label>
            <div className="space-y-2">
              <input
                type="number"
                name="PeriodTimes"
                value={formData.PeriodTimes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              />
              <p className="text-xs text-gray-500">
                設定為 99 個月，但您可以隨時取消。實際扣款仍為每月 NT$ {SUBSCRIPTION_PRICE}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              付款週期
            </label>
            <p className='text-gray-700'>每月付款</p>
          </div>
        </div>

        {/* 費用說明 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">費用說明</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 每月費用：NT$ {SUBSCRIPTION_PRICE}</p>
            <p>• 首次付款：提交後立即開始</p>
            <p>• 取消政策：隨時可取消，取消後不再收費</p>
            <p>• 配送費用：免費</p>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '處理中...' : '建立定期定額付款'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">結果</h3>
          <div className="space-y-2 text-sm">
            <p><strong>商店訂單編號:</strong> {result.merchantTradeNo}</p>
            {result.queryResult && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">查詢結果:</h4>
                <pre className="bg-white p-2 rounded border text-xs overflow-auto">
                  {JSON.stringify(result.queryResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <button
            onClick={handleQueryPayment}
            disabled={loading || !result.merchantTradeNo}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '查詢中...' : '查詢付款狀態'}
          </button>
        </div>
      )}
    </div>
  );
}
