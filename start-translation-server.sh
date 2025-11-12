#!/bin/bash

echo "====================================="
echo "百度翻译功能修复启动脚本"
echo "====================================="

# 检查必要的环境变量
echo "检查环境变量..."

# 检查Deno是否安装
if ! command -v deno &> /dev/null; then
    echo "❌ Deno未安装。正在安装..."
    
    # 尝试安装Deno
    curl -fsSL https://deno.land/install.sh | sh
    
    # 添加Deno到PATH
    export PATH="$HOME/.deno/bin:$PATH"
fi

# 检查环境变量
APP_ID=$(echo $BAIDU_TRANSLATE_APP_ID)
SECRET_KEY=$(echo $BAIDU_TRANSLATE_SECRET_KEY)

if [ -z "$APP_ID" ] || [ -z "$SECRET_KEY" ]; then
    echo "❌ 请确保已设置以下环境变量："
    echo "   export BAIDU_TRANSLATE_APP_ID=你的应用ID"
    echo "   export BAIDU_TRANSLATE_SECRET_KEY=你的密钥"
    echo ""
    echo "例如："
    echo "   export BAIDU_TRANSLATE_APP_ID=20241112001234"
    echo "   export BAIDU_TRANSLATE_SECRET_KEY=abcd1234efgh5678"
    exit 1
fi

echo "✅ 环境变量已设置"
echo "✅ 启动服务器..."

# 设置端口并启动服务器
PORT=${PORT:-8000}
echo "服务器将在 http://localhost:$PORT 启动"

# 启动Deno服务器
deno run --allow-net --allow-env --port=$PORT main.ts

echo "服务器已启动！"
echo "请访问 http://localhost:$PORT 进行测试"