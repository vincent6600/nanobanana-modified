#!/bin/bash

echo "========================================="
echo "🔧 百度翻译签名修复验证工具"
echo "========================================="

echo "1. 检查修复是否应用..."
echo "---------------------------------------"

# 检查签名函数是否包含大写转换
if grep -q ".toUpperCase()" main.ts; then
    echo "✅ 签名大写转换已应用"
    echo "   找到: .toUpperCase()"
else
    echo "❌ 签名大写转换未应用"
    echo "   需要添加: .toUpperCase()"
    exit 1
fi

echo ""
echo "2. 检查环境变量..."
echo "---------------------------------------"

if [ -z "$BAIDU_TRANSLATE_APP_ID" ]; then
    echo "❌ BAIDU_TRANSLATE_APP_ID 未设置"
    echo "   请设置: export BAIDU_TRANSLATE_APP_ID=\"您的APP_ID\""
    exit 1
else
    echo "✅ BAIDU_TRANSLATE_APP_ID 已设置"
    echo "   值: ${BAIDU_TRANSLATE_APP_ID:0:10}..."
fi

if [ -z "$BAIDU_TRANSLATE_SECRET_KEY" ]; then
    echo "❌ BAIDU_TRANSLATE_SECRET_KEY 未设置"
    echo "   请设置: export BAIDU_TRANSLATE_SECRET_KEY=\"您的密钥\""
    exit 1
else
    echo "✅ BAIDU_TRANSLATE_SECRET_KEY 已设置"
    echo "   值: ${BAIDU_TRANSLATE_SECRET_KEY:0:10}..."
fi

echo ""
echo "3. 检查文件修复..."
echo "---------------------------------------"

# 检查关键修复
if grep -q "return md5Hash(signString).toUpperCase();" main.ts; then
    echo "✅ 关键修复已应用：签名大写转换"
else
    echo "❌ 关键修复未应用"
    exit 1
fi

echo ""
echo "========================================="
echo "🎉 修复验证通过！"
echo "========================================="
echo ""
echo "🚀 下一步操作:"
echo "1. 启动服务器: deno run --allow-net --allow-env main.ts"
echo "2. 访问: http://localhost:8000"  
echo "3. 测试翻译: 输入中文文本，点击'翻译'按钮"
echo "4. 验证: 应无'Invalid Sign'错误，翻译成功"
echo ""
echo "✅ 预期结果:"
echo "   - 中文: '你好世界'"
echo "   - 英文: 'Hello World'"
echo "   - 状态: 翻译成功"
echo ""
echo "🔍 修复内容:"
echo "   位置: main.ts 第144行"
echo "   修复: return md5Hash(signString).toUpperCase();"
echo "   作用: 百度API签名需要大写格式"
echo "========================================="