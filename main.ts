// --- START OF FILE main.ts ---

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { createHash } from "https://deno.land/std@0.224.0/crypto/mod.ts";

// --- 辅助函数：创建 JSON 错误响应 ---
function createJsonErrorResponse(message: string, statusCode = 500) {
    return new Response(JSON.stringify({ error: message }), {
        status: statusCode,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
}

// --- 辅助函数：休眠/等待 ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =======================================================
// 新增：百度翻译API调用函数
// =======================================================
async function translateText(text: string, from: string, to: string) {
    const appId = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
    const secretKey = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
    
    if (!appId || !secretKey) {
        throw new Error("百度翻译API的App ID或密钥未配置");
    }
    
    const salt = Math.random().toString(36).substring(2, 10);
    const sign = createHash("md5")
        .update(appId + text + salt + secretKey)
        .digest("hex");
    
    const url = new URL("https://fanyi-api.baidu.com/api/trans/vip/translate");
    url.searchParams.set("q", text);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("appid", appId);
    url.searchParams.set("salt", salt);
    url.searchParams.set("sign", sign);
    
    const response = await fetch(url.toString());
    const result = await response.json();
    
    if (result.error_code) {
        throw new Error(`翻译失败：${result.error_msg || "未知错误"}`);
    }
    
    return result.trans_result?.[0]?.dst || text;
}

// =======================================================
// 模块 1: OpenRouter API 调用逻辑 (用于 nano banana)
// =======================================================
async function callOpenRouter(messages: any[], apiKey: string): Promise<{ type: 'image' | 'text'; content: string }> {
    if (!apiKey) { throw new Error("callOpenRouter received an empty apiKey."); }
    const openrouterPayload = { model: "google/gemini-2.5-flash-image-preview", messages };
    console.log("Sending payload to OpenRouter:", JSON.stringify(openrouterPayload, null, 2));
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(openrouterPayload)
    });
    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        throw new Error(`OpenRouter API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`);
    }
    const responseData = await apiResponse.json();
    console.log("OpenRouter Response:", JSON.stringify(responseData, null, 2));
    const message = responseData.choices?.[0]?.message;
    if (message?.images?.[0]?.image_url?.url) { return { type: 'image', content: message.images[0].image_url.url }; }
    if (typeof message?.content === 'string' && message.content.startsWith('data:image/')) { return { type: 'image', content: message.content }; }
    if (typeof message?.content === 'string' && message.content.trim() !== '') { return { type: 'text', content: message.content }; }
    return { type: 'text', content: "[模型没有返回有效内容]" };
}

// =======================================================
// 模块 1.5: OpenRouter GPT-5 Image API 调用逻辑 (用于 ChatGPT)
// =======================================================
async function callDALLE3(prompt: string, apiKey: string, images: string[] = []): Promise<{ type: 'image' | 'text'; content: string }> {
    if (!apiKey) { throw new Error("callDALLE3 received an empty apiKey."); }
    
    // 构建请求体 - 使用OpenRouter上实际可用的GPT-5 Image模型
    const requestBody: any = {
        model: "openai/gpt-5-image-mini",  // 使用Mini版本，成本较低
        prompt: prompt,
        n: 1
    };

    // 处理图片上传
    const contentPayload: any[] = [{ type: "text", text: prompt }];
    if (images && images.length > 0) {
        const imageParts = images.map(img => ({ type: "image_url", image_url: { url: img } }));
        contentPayload.push(...imageParts);
    }

    // 构建OpenRouter API格式的消息
    const webUiMessages = [{ role: "user", content: contentPayload }];
    
    console.log("Sending GPT-5 Image request to OpenRouter:", JSON.stringify({ model: requestBody.model, messages: webUiMessages }, null, 2));
    
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST", 
        headers: { 
            "Authorization": `Bearer ${apiKey}`, 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ model: requestBody.model, messages: webUiMessages })
    });
    
    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        throw new Error(`OpenRouter GPT-5 Image API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`);
    }
    
    const responseData = await apiResponse.json();
    console.log("OpenRouter GPT-5 Image Response:", JSON.stringify(responseData, null, 2));
    
    const message = responseData.choices?.[0]?.message;
    if (message?.images?.[0]?.image_url?.url) { 
        return { type: 'image', content: message.images[0].image_url.url }; 
    }
    if (typeof message?.content === 'string' && message.content.startsWith('data:image/')) { 
        return { type: 'image', content: message.content }; 
    }
    if (typeof message?.content === 'string' && message.content.trim() !== '') { 
        return { type: 'text', content: message.content }; 
    }
    
    return { type: 'text', content: "[模型没有返回有效内容]" };
}

// =======================================================
// 模块 2: ModelScope API 调用逻辑 (用于 Qwen-Image 等)
// =======================================================
async function callModelScope(model: string, apikey: string, parameters: any, timeoutSeconds: number): Promise<{ imageUrl: string }> {
    const base_url = 'https://api-inference.modelscope.cn/';
    const common_headers = {
        "Authorization": `Bearer ${apikey}`,
        "Content-Type": "application/json",
    };
    console.log(`[ModelScope] Submitting task for model: ${model}`);
    const generationResponse = await fetch(`${base_url}v1/images/generations`, {
        method: "POST",
        headers: { ...common_headers, "X-ModelScope-Async-Mode": "true" },
        body: JSON.stringify({ model, ...parameters }),
    });
    if (!generationResponse.ok) {
        const errorBody = await generationResponse.text();
        throw new Error(`ModelScope API Error (Generation): ${generationResponse.status} - ${errorBody}`);
    }
    const { task_id } = await generationResponse.json();
    if (!task_id) { throw new Error("ModelScope API did not return a task_id."); }
    console.log(`[ModelScope] Task submitted. Task ID: ${task_id}`);
    
    // 动态计算最大轮询次数
    const pollingIntervalSeconds = 5;
    const maxRetries = Math.ceil(timeoutSeconds / pollingIntervalSeconds);
    console.log(`[ModelScope] Task timeout set to ${timeoutSeconds}s, polling a max of ${maxRetries} times.`);

    for (let i = 0; i < maxRetries; i++) {
        await sleep(pollingIntervalSeconds * 1000); // 使用变量
        console.log(`[ModelScope] Polling task status... Attempt ${i + 1}/${maxRetries}`);
        const statusResponse = await fetch(`${base_url}v1/tasks/${task_id}`, { headers: { ...common_headers, "X-ModelScope-Task-Type": "image_generation" } });
        if (!statusResponse.ok) {
            console.error(`[ModelScope] Failed to get task status. Status: ${statusResponse.status}`);
            continue;
        }
        const data = await statusResponse.json();
        if (data.task_status === "SUCCEED") {
            console.log("[ModelScope] Task Succeeded.");
            if (data.output?.images?.[0]?.url) {
                return { imageUrl: data.output.images[0].url };
            } else if (data.output_images?.[0]) {
                return { imageUrl: data.output_images[0] };
            } else {
                throw new Error("ModelScope task succeeded but returned no images.");
            }
        } else if (data.task_status === "FAILED") {
            console.error("[ModelScope] Task Failed.", data);
            throw new Error(`ModelScope task failed: ${data.message || 'Unknown error'}`);
        }
    }
    throw new Error(`ModelScope task timed out after ${timeoutSeconds} seconds.`);
}

// =======================================================
// 主服务逻辑
// =======================================================
serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    
    if (req.method === 'OPTIONS') { 
        return new Response(null, { 
            status: 204, 
            headers: { 
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS", 
                "Access-Control-Allow-Headers": "Content-Type, Authorization" 
            } 
        }); 
    }

    // 新增：翻译API接口
    if (pathname === "/api/translate") {
        try {
            const { text } = await req.json();
            if (!text) {
                return createJsonErrorResponse("请输入需要翻译的文本", 400);
            }
            
            // 判断文本类型：中文/英文/混合
            const hasChinese = /[\u4e00-\u9fa5]/.test(text);
            const hasEnglish = /[a-zA-Z]/.test(text);
            let from, to;
            
            if (hasChinese && hasEnglish) {
                // 中英混合 → 翻译为英文
                from = "auto";
                to = "en";
            } else if (hasChinese) {
                // 纯中文 → 翻译为英文
                from = "zh";
                to = "en";
            } else if (hasEnglish) {
                // 纯英文 → 翻译为中文
                from = "en";
                to = "zh";
            } else {
                // 无中英文 → 不翻译
                return new Response(JSON.stringify({ translated: text }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            }
            
            const translated = await translateText(text, from, to);
            return new Response(JSON.stringify({ translated }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        } catch (error) {
            console.error("翻译错误:", error);
            return createJsonErrorResponse(error.message || "翻译失败，请稍后重试");
        }
    }

    if (pathname === "/api/key-status") {
        const isSet = !!Deno.env.get("OPENROUTER_API_KEY");
        return new Response(JSON.stringify({ isSet }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }

    if (pathname === "/api/openai-key-status") {
        const isSet = !!Deno.env.get("OPENAI_API_KEY");
        return new Response(JSON.stringify({ isSet }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }

    if (pathname === "/api/modelscope-key-status") {
        const isSet = !!Deno.env.get("MODELSCOPE_API_KEY");
        return new Response(JSON.stringify({ isSet }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }

    if (pathname === "/generate") {
        try {
            const requestData = await req.json();
            const { model, apikey, prompt, images, parameters, timeout } = requestData;

            if (model === 'nanobanana') {
                const openrouterApiKey = apikey || Deno.env.get("OPENROUTER_API_KEY");
                if (!openrouterApiKey) { return createJsonErrorResponse("OpenRouter API key is not set.", 500); }
                if (!prompt) { return createJsonErrorResponse("Prompt is required.", 400); }
                const contentPayload: any[] = [{ type: "text", text: prompt }];
                if (images && Array.isArray(images) && images.length > 0) {
                    const imageParts = images.map(img => ({ type: "image_url", image_url: { url: img } }));
                    contentPayload.push(...imageParts);
                }
                const webUiMessages = [{ role: "user", content: contentPayload }];
                const result = await callOpenRouter(webUiMessages, openrouterApiKey);
                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            } else if (model === 'chatgpt') {
                const openaiApiKey = apikey || Deno.env.get("OPENAI_API_KEY");
                if (!openaiApiKey) { return createJsonErrorResponse("OpenAI API key is not set.", 500); }
                if (!prompt) { return createJsonErrorResponse("Prompt is required.", 400); }
                
                // 调用DALL-E 3 API
                const result = await callDALLE3(prompt, openaiApiKey, images || []);
                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            } else {
                // ModelScope 模型处理
                const modelscopeApiKey = apikey || Deno.env.get("MODELSCOPE_API_KEY");
                if (!modelscopeApiKey) { return createJsonErrorResponse("ModelScope API key is not set.", 500); }
                if (!parameters?.prompt) { return createJsonErrorResponse("Prompt is required.", 400); }
                
                // 设置超时时间，默认60秒
                const timeoutSeconds = timeout || 60;
                const result = await callModelScope(model, modelscopeApiKey, parameters, timeoutSeconds);
                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            }
        } catch (error) {
            console.error("生成错误:", error);
            return createJsonErrorResponse(error.message || "生成失败，请稍后重试");
        }
    }

    // 静态文件服务
    return serveDir(req, {
        fsRoot: "static",
        urlRoot: "",
        showDirListing: false,
        enableCors: true,
    });
});
