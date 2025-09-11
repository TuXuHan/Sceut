"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestInsertPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInsertTestData = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/orders/insert-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '插入失敗')
      }

      setResult(data)
      console.log('插入結果:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
      console.error('插入錯誤:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>測試資料插入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleInsertTestData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? '插入中...' : '插入測試資料'}
          </Button>

          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-md">
              <h3 className="font-semibold text-red-800">錯誤：</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-100 border border-green-300 rounded-md">
              <h3 className="font-semibold text-green-800">成功：</h3>
              <p className="text-green-700">{result.message}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-green-600">查看詳細結果</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p>這個頁面會插入測試訂單資料到資料庫中。</p>
            <p>插入完成後，請前往配送追蹤頁面查看結果。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
