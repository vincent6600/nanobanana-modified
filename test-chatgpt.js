#!/usr/bin/env node

/**
 * ChatGPT (GPT-5 Image) API 测试脚本
 * 用于验证修改后的代码是否正常工作
 * 
 * 使用方法:
 * 1. 设置环境变量 OPENAI_API_KEY (你的OpenRouter API Key)
 * 2. 运行: node test-chatgpt.js
 * 
 * 或者直接替换下面的 apiKey 变量
 */

const apiKey = process.env.OPENAI_API_KEY || 'YOUR_OPENROUTER_API_KEY_HERE';
const prompt = "生成一只可爱的小猫咪，坐在彩虹上";

async function testChatGPTAPI() {
    if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
        console.error("❌ 错误：请设置环境变量 OPENAI_API_KEY 或修改脚本中的 apiKey 变量");
        console.log("设置方法：");
        console.log("export OPENAI_API_KEY=你的OpenRouter_API_Key");
        return;
    }

    console.log("🧪 开始测试 ChatGPT (GPT-5 Image Mini) API...");
    console.log(`📝 测试提示词: "${prompt}"`);
    console.log(`🔑 使用API Key: ${apiKey.substring(0, 8)}...`);
    console.log("");

    try {
        // 构建请求
        const requestBody = {
            model: "openai/gpt-5-image-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        }
                    ]
                }
            ]
        };

        console.log("📤 发送请求到 OpenRouter...");
        console.log(`请求模型: ${requestBody.model}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`❌ API错误: ${response.status} ${response.statusText}`);
            console.error(`错误详情: ${errorBody}`);
            return;
        }

        const data = await response.json();
        console.log("✅ API调用成功!");
        console.log("📊 响应结构:", JSON.stringify(data, null, 2));

        const message = data.choices?.[0]?.message;
        if (message?.images?.[0]?.image_url?.url) {
            console.log("🎨 生成的图片URL:", message.images[0].image_url.url);
            console.log("✅ 测试成功！ChatGPT (GPT-5 Image Mini) API 工作正常！");
        } else if (typeof message?.content === 'string' && message.content.startsWith('data:image/')) {
            console.log("🎨 生成的图片 (base64格式)");
            console.log("✅ 测试成功！ChatGPT (GPT-5 Image Mini) API 工作正常！");
        } else {
            console.log("⚠️ 响应格式可能有所不同:", message);
        }

    } catch (error) {
        console.error("❌ 请求失败:", error.message);
    }
}

// 运行测试
testChatGPTAPI();