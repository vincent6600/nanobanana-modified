#!/bin/bash

# =======================================================
# 百度翻译版本启动脚本
# =======================================================

echo "🚀 启动Nano Banana AI图像生成平台 (百度翻译版)"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Python环境
echo -e "${BLUE}📋 检查环境...${NC}"
if ! command -v deno &> /dev/null; then
    echo -e "${RED}❌ Deno未安装，请先安装Deno${NC}"
    echo "💡 安装命令: curl -fsSL https://deno.land/x/install/install.sh | sh"
    exit 1
fi

echo -e "${GREEN}✅ Deno版本: $(deno --version)${NC}"

# 检查当前目录
if [ ! -f "main.ts" ]; then
    echo -e "${RED}❌ 未找到main.ts文件，请确保在正确的项目目录中${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 项目目录检查通过${NC}"

# 检查百度翻译API配置
echo -e "${BLUE}🔑 检查百度翻译API配置...${NC}"
if [ -z "$BAIDU_TRANSLATE_APP_ID" ]; then
    echo -e "${RED}❌ BAIDU_TRANSLATE_APP_ID 环境变量未设置${NC}"
    echo -e "${YELLOW}💡 您可以:${NC}"
    echo "   1. 设置环境变量: export BAIDU_TRANSLATE_APP_ID=\"your_app_id\""
    echo "   2. 编辑此脚本，设置变量并保存"
    echo "   3. 在启动时设置: BAIDU_TRANSLATE_APP_ID=\"your_app_id\" ./start-with-baidu-translate.sh"
    echo ""
    echo "🔗 获取API密钥: https://fanyi-api.baidu.com/"
    read -p "请输入您的百度翻译APP ID: " app_id
    export BAIDU_TRANSLATE_APP_ID="$app_id"
fi

if [ -z "$BAIDU_TRANSLATE_SECRET_KEY" ]; then
    echo -e "${RED}❌ BAIDU_TRANSLATE_SECRET_KEY 环境变量未设置${NC}"
    read -p "请输入您的百度翻译Secret Key: " secret_key
    export BAIDU_TRANSLATE_SECRET_KEY="$secret_key"
fi

echo -e "${GREEN}✅ 百度翻译API配置检查通过${NC}"
echo "   APP ID: ${BAIDU_TRANSLATE_APP_ID:0:10}..."
echo "   Secret Key: ${BAIDU_TRANSLATE_SECRET_KEY:0:10}..."

# 运行翻译测试
echo -e "${BLUE}🧪 运行百度翻译API测试...${NC}"
deno run --allow-net test-baidu-translate.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 翻译API测试失败，请检查配置${NC}"
    echo "💡 可能的问题:"
    echo "   - APP ID或Secret Key错误"
    echo "   - 网络连接问题"
    echo "   - API配额不足"
    exit 1
fi

echo -e "${GREEN}✅ 翻译API测试通过${NC}"

# 显示启动信息
echo ""
echo -e "${BLUE}🌟 启动信息:${NC}"
echo "   • 服务器地址: http://localhost:8000"
echo "   • 翻译服务: 百度翻译API"
echo "   • 支持模型: ChatGPT, Nano Banana, ModelScope"
echo "   • 翻译功能: 中文→英文"
echo ""
echo -e "${YELLOW}🎯 使用建议:${NC}"
echo "   • 在提示词输入框中使用翻译按钮"
echo "   • 或输入三个空格自动触发翻译"
echo "   • 翻译结果会自动替换原文本"
echo ""

# 启动服务器
echo -e "${BLUE}🚀 启动服务器...${NC}"
deno run --allow-net --allow-env main.ts