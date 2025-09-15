#!/bin/bash

echo "🚀 設置本地端測試環境"
echo "================================"

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未運行，請先啟動 Docker Desktop"
    echo "   下載地址: https://docs.docker.com/desktop"
    exit 1
fi

echo "✅ Docker 已運行"

# 檢查 Supabase CLI 是否安裝
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI 未安裝"
    echo "   請運行: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI 已安裝"

# 啟動 Supabase
echo "🔄 啟動本地 Supabase..."
supabase start

# 檢查啟動是否成功
if [ $? -eq 0 ]; then
    echo "✅ Supabase 啟動成功"
    echo ""
    echo "📋 下一步操作："
    echo "1. 複製上面顯示的 API URL 和 anon key"
    echo "2. 創建 .env.local 文件並填入這些值"
    echo "3. 運行: npm run dev"
    echo "4. 訪問: http://localhost:3000/register"
    echo "5. 查看郵件: http://127.0.0.1:54324"
    echo ""
    echo "📖 詳細指南請查看: LOCAL_TESTING_GUIDE.md"
else
    echo "❌ Supabase 啟動失敗"
    echo "   請檢查 Docker 是否正常運行"
fi
