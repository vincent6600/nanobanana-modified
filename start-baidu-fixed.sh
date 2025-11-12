#!/bin/bash

echo "=== 百度翻译API修复 - 启动脚本 ==="
echo "已应用官方文档标准修复:"
echo "✅ 签名字符串: appid + q + salt + 密钥"
echo "✅ MD5签名格式: 32位小写（移除.toUpperCase()）"
echo "✅ 请求方式: POST + application/x-www-form-urlencoded"
echo "✅ URL编码: 发送请求前对q做URL encode"
echo ""

# 检查Deno环境变量
if [ -z "$BAIDU_TRANSLATE_APP_ID" ] || [ -z "$BAIDU_TRANSLATE_SECRET_KEY" ]; then
    echo "⚠️  警告：请确保设置了以下环境变量："
    echo "export BAIDU_TRANSLATE_APP_ID=您的appid"
    echo "export BAIDU_TRANSLATE_SECRET_KEY=您的密钥"
    echo ""
    echo "请先在Deno中设置这些变量，然后再运行。"
    exit 1
fi

echo "✅ 环境变量检查通过"
echo "当前APP ID: ${BAIDU_TRANSLATE_APP_ID:0:10}..."
echo ""

echo "正在启动翻译服务..."
echo "访问地址: http://localhost:8000"
echo ""
echo "修复说明:"
echo "- 修复了54001签名错误（基于官方文档）"
echo "- 使用正确的签名字符串格式"
echo "- POST请求替代GET请求"
echo "- 正确的URL编码处理"
echo ""
echo "按 Ctrl+C 停止服务"
echo "===================================="

# 启动Deno服务
cd /workspace/nanobanana-modified
deno run --allow-net --allow-env main.ts