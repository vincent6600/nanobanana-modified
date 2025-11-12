#!/bin/bash

# 修复后的百度翻译功能启动脚本
echo "🚀 启动修复后的翻译功能..."
echo "========================================"

# 检查环境变量
echo "📋 检查环境变量..."
if [ -z "$BAIDU_TRANSLATE_APP_ID" ]; then
    echo "❌ BAIDU_TRANSLATE_APP_ID 未设置"
    echo "请设置: export BAIDU_TRANSLATE_APP_ID=\"您的APP_ID\""
    exit 1
fi

if [ -z "$BAIDU_TRANSLATE_SECRET_KEY" ]; then
    echo "❌ BAIDU_TRANSLATE_SECRET_KEY 未设置"
    echo "请设置: export BAIDU_TRANSLATE_SECRET_KEY=\"您的Secret_Key\""
    exit 1
fi

echo "✅ 环境变量检查通过"
echo "APP ID: ${BAIDU_TRANSLATE_APP_ID:0:10}..."
echo "Secret Key: ${BAIDU_TRANSLATE_SECRET_KEY:0:10}..."

echo ""
echo "🔍 可选测试（选择一项）:"
echo "1. 运行MD5修复测试"
echo "2. 启动服务器并测试"
echo "3. 仅启动服务器"
echo ""

read -p "请选择操作 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔧 运行MD5修复测试..."
        deno run --allow-env test-md5-fixed.js
        ;;
    2)
        echo ""
        echo "🌐 启动服务器并测试..."
        echo "服务器将在 http://localhost:8000 启动"
        echo "访问后可以在浏览器中测试翻译功能"
        echo ""
        echo "按 Ctrl+C 停止服务器"
        echo ""
        
        # 启动服务器
        deno run --allow-net --allow-env main.ts &
        server_pid=$!
        
        # 等待服务器启动
        sleep 3
        
        # 测试翻译功能
        echo "测试翻译功能..."
        deno run --allow-net --allow-env test-server-translation.js
        
        # 等待用户中断
        echo ""
        echo "服务器正在运行中..."
        echo "在浏览器中访问 http://localhost:8000 测试翻译功能"
        echo "按 Ctrl+C 停止服务器"
        wait $server_pid
        ;;
    3)
        echo ""
        echo "🌐 启动服务器..."
        echo "服务器将在 http://localhost:8000 启动"
        echo "在浏览器中访问 http://localhost:8000 测试翻译功能"
        echo "按 Ctrl+C 停止服务器"
        echo ""
        
        deno run --allow-net --allow-env main.ts
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac