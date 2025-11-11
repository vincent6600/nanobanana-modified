#!/bin/bash

echo "=== ModelScope翻译功能服务器启动脚本 ==="

# 检查Deno是否安装
if ! command -v deno &> /dev/null; then
    echo "❌ Deno未安装，请先安装Deno:"
    echo "   curl -fsSL https://deno.land/install.sh | sh"
    echo "   或访问: https://deno.land/"
    exit 1
fi

echo "✅ Deno版本: $(deno --version)"

# 检查环境变量
if [ -z "$MODELSCOPE_SDK_TOKEN" ]; then
    echo "⚠️  警告: MODELSCOPE_SDK_TOKEN环境变量未设置"
    echo "   请设置SDK Token: export MODELSCOPE_SDK_TOKEN='your_token'"
    echo "   或从 https://modelscope.cn/my/myaccesstoken 获取"
    echo ""
fi

echo "🚀 正在启动服务器..."

# 启动服务器
deno run --allow-net --allow-read --allow-env main.ts

echo "服务器已停止"
