#!/bin/bash

# 简单的API配置检查脚本

echo "🔍 检查API配置状态..."
echo ""

# 检查环境变量
echo "📋 环境变量检查:"

if [ -n "$MODELSCOPE_SDK_TOKEN" ]; then
    echo "✅ MODELSCOPE_SDK_TOKEN: 已配置 (${MODELSCOPE_SDK_TOKEN:0:10}...)"
else
    echo "❌ MODELSCOPE_SDK_TOKEN: 未配置"
fi

if [ -n "$OPENROUTER_API_KEY" ]; then
    echo "✅ OPENROUTER_API_KEY: 已配置 (${OPENROUTER_API_KEY:0:10}...)"
else
    echo "⚠️  OPENROUTER_API_KEY: 未配置 (仅nano banana模型需要)"
fi

if [ -n "$PORT" ]; then
    echo "📡 PORT: $PORT"
else
    echo "📡 PORT: 8000 (默认)"
fi

echo ""
echo "🔧 获取API密钥的步骤:"
echo "1. 访问 https://www.modelscope.cn/ 获取 MODELSCOPE_SDK_TOKEN"
echo "2. 访问 https://openrouter.ai/ 获取 OPENROUTER_API_KEY (可选)"
echo "3. 将密钥保存到 .env 文件或导出为环境变量"
echo ""

# 检查文件是否存在
echo "📁 文件检查:"

if [ -f ".env" ]; then
    echo "✅ .env 文件存在"
else
    echo "⚠️  .env 文件不存在，请复制 .env.example 并配置"
fi

if [ -f "main.ts" ]; then
    echo "✅ main.ts 文件存在"
else
    echo "❌ main.ts 文件不存在"
fi

if [ -f "index.html" ]; then
    echo "✅ index.html 文件存在"
else
    echo "⚠️  index.html 文件不存在"
fi

echo ""
echo "🚀 启动命令示例:"
echo "export MODELSCOPE_SDK_TOKEN='your-token-here'"
echo "deno run --allow-net --allow-read --allow-env main.ts"