#!/bin/bash

# Nano Banana Modified - 启动脚本
# 用于启动Deno服务器

set -e

echo "🚀 启动 Nano Banana Modified 服务器..."

# 加载环境变量 (如果.env文件存在)
if [ -f .env ]; then
    echo "📄 加载环境变量配置..."
    source .env
else
    echo "⚠️  未找到.env文件，请参考.env.example创建配置文件"
fi

# 检查必需的API密钥
echo ""
echo "🔍 检查API配置状态..."

# 检查ModelScope SDK Token
if [ -n "$MODELSCOPE_SDK_TOKEN" ]; then
    echo "✅ ModelScope SDK Token: 已配置"
else
    echo "❌ ModelScope SDK Token: 未配置"
    echo "   请设置 MODELSCOPE_SDK_TOKEN 环境变量或创建.env文件"
fi

# 检查OpenRouter API Key
if [ -n "$OPENROUTER_API_KEY" ]; then
    echo "✅ OpenRouter API Key: 已配置"
else
    echo "⚠️  OpenRouter API Key: 未配置 (仅nano banana模型需要)"
fi

echo ""
echo "🌐 启动服务器在端口 ${PORT:-8000}..."
echo "📡 服务地址: http://localhost:${PORT:-8000}"
echo ""
echo "🔄 启动中，请稍等..."

# 设置服务器端口
export PORT=${PORT:-8000}

# 启动Deno服务器
deno run --allow-net --allow-read --allow-env --allow-run main.ts