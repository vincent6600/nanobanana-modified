// --- START OF FILE main.ts ---

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

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
// 模块 0: ModelScope翻译API调用逻辑 (中文→英文)
// =======================================================
async function callModelScopeTranslate(text: string, apiKey: string): Promise<any> {
    console.log(`ModelScope翻译请求: "${text}"`);
    
    // 使用ModelScope的标准推理API端点
    const response = await fetch('https://api-inference.modelscope.cn/api-inference/v1/models/iic/nlp_imt_translation_zh2en', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: text // 中文文本直接输入到模型
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('ModelScope API错误详情:', errorText);
        throw new Error(`ModelScope翻译API错误: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('ModelScope翻译API响应:', JSON.stringify(data, null, 2));

    // 检查返回结果格式
    if (!data || !data.outputs) {
        throw new Error('翻译失败：未返回翻译结果');
    }

    // 返回格式化的结果，兼容原有百度翻译API响应格式
    return {
        trans_result: [
            {
                src: text,
                dst: data.outputs
            }
        ]
    };
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
    if (responseData.choices && responseData.choices.length > 0) {
        const content = responseData.choices[0].message.content;
        if (content.includes("![")) {
            return { type: 'image', content };
        } else {
            return { type: 'text', content };
        }
    } else {
        throw new Error("OpenRouter API unexpected response format");
    }
}

// =======================================================
// 模块 2: ModelScope API 调用逻辑 (用于 Qwen-Image 等)
// =======================================================
// [修改] 函数接收一个 timeoutSeconds 参数
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
    const generationData = await generationResponse.json();
    const task_id = generationData.id;
    if (!task_id) { throw new Error("ModelScope API did not return a task_id."); }
    console.log(`[ModelScope] Task submitted. Task ID: ${task_id}`);

    // [修改] 轮询超时时间设置为传入参数（秒）
    const maxRetries = 60; // 60秒轮询，每次1秒
    const pollIntervalMs = 1000;
    for (let i = 0; i < maxRetries; i++) {
        await sleep(pollIntervalMs);
        console.log(`[ModelScope] Polling task status... Attempt ${i + 1}/${maxRetries}`);
        const statusResponse = await fetch(`${base_url}v1/tasks/${task_id}`, { headers: { ...common_headers, "X-ModelScope-Task-Type": "image_generation" } });
        if (!statusResponse.ok) {
            console.error(`[ModelScope] Failed to get task status. Status: ${statusResponse.status}`);
            continue;
        }
        const statusData = await statusResponse.json();
        console.log(`[ModelScope] Task status: ${statusData.status}`);
        if (statusData.status === 'SUCCEEDED') {
            console.log("[ModelScope] Task Succeeded.");
            const images = statusData.output?.images;
            if (!images || images.length === 0) {
                throw new Error("ModelScope task succeeded but returned no images.");
            }
            const imageUrl = images[0].url;
            console.log(`[ModelScope] Generated image URL: ${imageUrl}`);
            return { imageUrl };
        } else if (statusData.status === 'FAILED') {
            console.error("[ModelScope] Task Failed.", statusData);
            throw new Error(`ModelScope task failed: ${statusData.message || 'Unknown error'}`);
        }
    }
    throw new Error(`ModelScope task timed out after ${timeoutSeconds} seconds.`);
}

// =======================================================
// 主服务函数
// =======================================================
const server = serve(async (req: Request) => {
    const { url } = req;
    console.log(`${req.method} ${url}`);
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // =======================================================
    // 健康检查和状态API
    // =======================================================
    if (pathname === "/health") {
        return new Response("OK", {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });
    }

    // ModelScope翻译API状态检查
    if (pathname === "/api/modelscope-translate-status") {
        const sdkToken = Deno.env.get("MODELSCOPE_SDK_TOKEN");
        const isSet = !!sdkToken;
        return new Response(JSON.stringify({ 
            isSet,
            message: isSet ? "ModelScope翻译服务已配置" : "ModelScope翻译服务未配置，请设置MODELSCOPE_SDK_TOKEN环境变量"
        }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }

    // ModelScope图像生成API状态检查
    if (pathname === "/api/modelscope-image-status") {
        const sdkToken = Deno.env.get("MODELSCOPE_SDK_TOKEN");
        const isSet = !!sdkToken;
        return new Response(JSON.stringify({ 
            isSet,
            message: isSet ? "ModelScope图像生成服务已配置" : "ModelScope图像生成服务未配置，请设置MODELSCOPE_SDK_TOKEN环境变量"
        }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }

    // OpenRouter API状态检查
    if (pathname === "/api/openrouter-status") {
        const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
        const isSet = !!openrouterKey;
        return new Response(JSON.stringify({ 
            isSet,
            message: isSet ? "OpenRouter服务已配置" : "OpenRouter服务未配置，请设置OPENROUTER_API_KEY环境变量"
        }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }

    // =======================================================
    // 翻译功能 API 路由
    // =======================================================
    if (pathname === "/api/translate") {
        if (req.method !== 'POST') {
            return createJsonErrorResponse("Only POST method is allowed", 405);
        }

        try {
            const requestData = await req.json();
            const { q, from = 'zh', to = 'en' } = requestData;

            if (!q || q.trim() === '') {
                return createJsonErrorResponse("Text to translate is required", 400);
            }

            // 获取ModelScope SDK Token
            const apiKey = Deno.env.get("MODELSCOPE_SDK_TOKEN");
            if (!apiKey) {
                return createJsonErrorResponse("ModelScope翻译服务未配置，请设置MODELSCOPE_SDK_TOKEN环境变量", 500);
            }

            console.log(`开始ModelScope翻译: "${q}" 从 ${from} 到 ${to}`);

            // 调用ModelScope翻译API
            const result = await callModelScopeTranslate(q, apiKey);
            
            return new Response(JSON.stringify(result), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });

        } catch (error) {
            console.error("翻译请求失败:", error);
            return createJsonErrorResponse(error.message || "翻译服务暂时不可用", 500);
        }
    }

    // =======================================================
    // 图像生成 API 路由
    // =======================================================
    if (pathname === "/generate") {
        try {
            const requestData = await req.json();
            const { model, apikey, prompt, images, parameters, timeout } = requestData;

            if (model === 'nanobanana') {
                const openrouterApiKey = apikey || Deno.env.get("OPENROUTER_API_KEY");
                if (!openrouterApiKey) { return createJsonErrorResponse("OpenRouter API key is not set.", 500); }
                if (!prompt && !images) { return createJsonErrorResponse("Prompt or images are required for nanobanana model.", 400); }
                
                // 构建消息格式
                const messages = [];
                if (prompt) {
                    messages.push({ role: "user", content: [{ type: "text", text: prompt }] });
                }
                if (images && images.length > 0) {
                    for (const imageData of images) {
                        messages.push({ role: "user", content: [{ type: "image_url", image_url: { url: imageData.url } }] });
                        if (imageData.prompt) {
                            messages.push({ role: "user", content: [{ type: "text", text: imageData.prompt }] });
                        }
                    }
                }
                
                const result = await callOpenRouter(messages, openrouterApiKey);
                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            }

            if (model === 'qwen-image') {
                const modelscopeApiKey = apikey || Deno.env.get("MODELSCOPE_SDK_TOKEN");
                if (!modelscopeApiKey) { return createJsonErrorResponse("ModelScope API key is not set.", 500); }
                if (!parameters?.prompt) { return createJsonErrorResponse("Positive prompt is required for ModelScope models.", 400); }
                
                // [修改] 将 timeout (或默认值) 传递给 callModelScope
                const timeoutSeconds = timeout || 60; // 默认60秒
                const result = await callModelScope(model, modelscopeApiKey, parameters, timeoutSeconds);
                
                return new Response(JSON.stringify({
                    type: 'image',
                    content: result.imageUrl
                }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            }

            if (model === 'qwen3-image') {
                const modelscopeApiKey = apikey || Deno.env.get("MODELSCOPE_SDK_TOKEN");
                if (!modelscopeApiKey) { return createJsonErrorResponse("ModelScope API key is not set.", 500); }
                if (!parameters?.prompt) { return createJsonErrorResponse("Positive prompt is required for ModelScope models.", 400); }
                
                // [修改] 将 timeout (或默认值) 传递给 callModelScope
                const timeoutSeconds = timeout || 60; // 默认60秒
                const result = await callModelScope(model, modelscopeApiKey, parameters, timeoutSeconds);
                
                return new Response(JSON.stringify({
                    type: 'image',
                    content: result.imageUrl
                }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            }

            // 未知的模型
            return createJsonErrorResponse(`Unknown model: ${model}`, 400);

        } catch (error) {
            console.error("Generation request failed:", error);
            return createJsonErrorResponse(error.message || "Generation service temporarily unavailable", 500);
        }
    }

    // =======================================================
    // 静态文件服务 (SPA路由)
    // =======================================================
    if (req.method === 'GET') {
        const { response } = await serveDir(req);
        return response;
    }

    // 其他请求方法不支持
    return createJsonErrorResponse("Method not allowed", 405);
});

// --- 启动服务器 ---
console.log("服务器启动在 http://localhost:8000");
console.log("需要配置以下环境变量:");
console.log("- MODELSCOPE_SDK_TOKEN: ModelScope API密钥 (用于翻译和图像生成)");
console.log("- OPENROUTER_API_KEY: OpenRouter API密钥 (用于nano banana模型)");
console.log("");

await server;