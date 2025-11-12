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
// 模块 0: 百度翻译API调用逻辑 (中文→英文)
// =======================================================

// MD5加密函数 (Deno兼容版本)
function md5Hash(text: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // 使用32位整数运算实现MD5
    const m = 0x100000000; // 2^32
    const o = 0x800000;    // 2^23
    const h = 0x8f000000;  // 2^31
    
    const s = [
        [7, 12, 17, 22],
        [7, 12, 17, 22],
        [7, 12, 17, 22],
        [7, 12, 17, 22],
        [5, 9, 14, 20],
        [5, 9, 14, 20],
        [5, 9, 14, 20],
        [5, 9, 14, 20],
        [4, 11, 16, 23],
        [4, 11, 16, 23],
        [4, 11, 16, 23],
        [4, 11, 16, 23],
        [6, 10, 15, 21],
        [6, 10, 15, 21],
        [6, 10, 15, 21],
        [6, 10, 15, 21],
    ];
    
    const K = [];
    for (let i = 0; i < 64; i++) {
        K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * m) >>> 0;
    }
    
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;
    
    let words = [];
    for (let i = 0; i < data.length; i += 4) {
        words.push(
            ((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | (data[i + 3])) >>> 0
        );
    }
    
    const originalBitLength = data.length * 8;
    words[Math.floor(data.length / 4)] |= 0x80 << (24 - (data.length % 4) * 8);
    
    if (data.length % 4 === 0) {
        words[14] = 0;
    }
    
    while (words.length <= 14) {
        words.push(0);
    }
    
    words[14] = originalBitLength >>> 0;
    words[15] = Math.floor(originalBitLength / m) >>> 0;
    
    for (let j = 0; j < 16; j++) {
        words.push(0);
    }
    
    for (let j = 0; j < 64; j++) {
        const f = (b & c) | ((~b) & d);
        const g = (d & b) | ((~d) & c);
        const h = (c & b) | ((~c) & d);
        const i = (d & c) | ((~d) & b);
        
        let temp;
        let fValue;
        let gValue;
        
        if (j < 16) {
            fValue = f;
            gValue = j;
        } else if (j < 32) {
            fValue = f;
            gValue = (5 * j + 1) % 16;
        } else if (j < 48) {
            fValue = f;
            gValue = (3 * j + 5) % 16;
        } else {
            fValue = f;
            gValue = (7 * j) % 16;
        }
        
        temp = d;
        d = c;
        c = b;
        b = (b + ((a + fValue + K[j] + words[gValue]) << s[Math.floor(j / 16)][j % 4] | (a + fValue + K[j] + words[gValue]) >>> (32 - s[Math.floor(j / 16)][j % 4]))) >>> 0;
        a = temp >>> 0;
    }
    
    a = (a + 0x67452301) >>> 0;
    b = (b + 0xefcdab89) >>> 0;
    c = (c + 0x98badcfe) >>> 0;
    d = (d + 0x10325476) >>> 0;
    
    return [
        (a >>> 24) & 0xff,
        (a >>> 16) & 0xff,
        (a >>> 8) & 0xff,
        a & 0xff,
        (b >>> 24) & 0xff,
        (b >>> 16) & 0xff,
        (b >>> 8) & 0xff,
        b & 0xff,
        (c >>> 24) & 0xff,
        (c >>> 16) & 0xff,
        (c >>> 8) & 0xff,
        c & 0xff,
        (d >>> 24) & 0xff,
        (d >>> 16) & 0xff,
        (d >>> 8) & 0xff,
        d & 0xff
    ].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// 生成百度翻译API签名（按官方文档：appid+q+salt+密钥）
function generateBaiduSignature(appId: string, text: string, salt: string, secretKey: string): string {
    // 官方要求顺序：appid + q + salt + 密钥
    const signString = `${appId}${text}${salt}${secretKey}`;
    // 官方要求：32位小写MD5签名
    return md5Hash(signString);
}

// 调用百度翻译API（按官方文档标准）
async function callBaiduTranslate(text: string, appId: string, secretKey: string): Promise<any> {
    console.log(`百度翻译请求: "${text}"`);
    
    // 准备请求参数
    const salt = Math.random().toString(36).substring(2, 15);
    
    // 生成签名（官方要求：签名前q不需要URL编码）
    const sign = generateBaiduSignature(appId, text, salt, secretKey);
    
    // 构建请求参数（官方要求参数）
    const params = new URLSearchParams({
        q: text,  // 待翻译文本
        from: 'zh',
        to: 'en',
        appid: appId,
        salt: salt,  // 随机数
        sign: sign   // 签名
    });
    
    console.log('百度翻译签名字符串:', `${appId}${text}${salt}${secretKey}`);
    console.log('百度翻译MD5签名:', sign);
    
    // URL编码处理（官方要求：发送请求前需要对q做URL encode）
    const encodedParams = new URLSearchParams();
    encodedParams.set('q', encodeURIComponent(text));
    encodedParams.set('from', 'zh');
    encodedParams.set('to', 'en');
    encodedParams.set('appid', appId);
    encodedParams.set('salt', salt);
    encodedParams.set('sign', sign);
    
    // 发送POST请求到百度翻译API（官方推荐POST方式）
    const response = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)'
        },
        body: encodedParams.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('百度翻译API错误详情:', errorText);
        throw new Error(`百度翻译API错误: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('百度翻译API响应:', JSON.stringify(data, null, 2));

    // 检查返回结果格式
    if (data.error_code) {
        throw new Error(`百度翻译API错误: ${data.error_code} - ${data.error_msg}`);
    }
    
    if (!data.trans_result || !data.trans_result.length) {
        throw new Error('翻译失败：未返回翻译结果');
    }

    // 返回格式化的结果，保持兼容原有API响应格式
    return {
        trans_result: [
            {
                src: data.trans_result[0].src,
                dst: data.trans_result[0].dst
            }
        ]
    };
}

// 注意: 使用百度翻译API替代ModelScope，稳定性更好



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
    const { task_id } = await generationResponse.json();
    if (!task_id) { throw new Error("ModelScope API did not return a task_id."); }
    console.log(`[ModelScope] Task submitted. Task ID: ${task_id}`);
    
    // [修改] 动态计算最大轮询次数
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

    if (pathname === "/api/baidu-translate-status") {
        const appId = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
        const secretKey = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
        const isSet = !!(appId && secretKey);
        return new Response(JSON.stringify({ isSet }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }

    if (pathname === "/api/modelscope-key-status") {
        // 兼容多种环境变量名
        const sdkToken = Deno.env.get("MODELSCOPE_SDK_TOKEN");
        const apiKey = Deno.env.get("MODELSCOPE_API_KEY");
        const isSet = !!(sdkToken || apiKey);
        return new Response(JSON.stringify({ isSet }), {
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

            // 获取百度翻译API密钥
            const appId = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
            const secretKey = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
            if (!appId || !secretKey) {
                return createJsonErrorResponse("百度翻译服务未配置，请设置BAIDU_TRANSLATE_APP_ID和BAIDU_TRANSLATE_SECRET_KEY环境变量", 500);
            }

            console.log(`开始百度翻译: "${q}" 从 ${from} 到 ${to}`);

            // 调用百度翻译API
            const result = await callBaiduTranslate(q, appId, secretKey);
            
            return new Response(JSON.stringify(result), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });

        } catch (error) {
            console.error("翻译请求失败:", error);
            return createJsonErrorResponse(error.message || "翻译服务暂时不可用", 500);
        }
    }

    if (pathname === "/generate") {
        try {
            // [修改] 从请求体中解构出 timeout
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
                if (result.type === 'image') {
                    return new Response(JSON.stringify({ imageUrl: result.content }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
                } else {
                    return createJsonErrorResponse(`Model returned text instead of an image: "${result.content}"`, 400);
                }
            } else if (model === 'chatgpt') {
                const openaiApiKey = apikey || Deno.env.get("OPENAI_API_KEY");
                if (!openaiApiKey) { return createJsonErrorResponse("OpenAI API key is not set.", 500); }
                if (!prompt) { return createJsonErrorResponse("Prompt is required.", 400); }
                
                // 直接传递prompt和images到GPT-5 Image函数
                const result = await callDALLE3(prompt, openaiApiKey, images || []);
                if (result.type === 'image') {
                    return new Response(JSON.stringify({ imageUrl: result.content }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
                } else {
                    return createJsonErrorResponse(`Model returned text instead of an image: "${result.content}"`, 400);
                }
            } else {
                // 兼容多种环境变量名
                const modelscopeApiKey = apikey || 
                    Deno.env.get("MODELSCOPE_SDK_TOKEN") || 
                    Deno.env.get("MODELSCOPE_API_KEY");
                if (!modelscopeApiKey) { return createJsonErrorResponse("ModelScope API key is not set.", 401); }
                if (!parameters?.prompt) { return createJsonErrorResponse("Positive prompt is required for ModelScope models.", 400); }
                
                // [修改] 将 timeout (或默认值) 传递给 callModelScope
                // Qwen 默认2分钟，其他默认3分钟
                const timeoutSeconds = timeout || (model.includes('Qwen') ? 120 : 180); 
                const result = await callModelScope(model, modelscopeApiKey, parameters, timeoutSeconds);

                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }
        } catch (error) {
            console.error("Error handling /generate request:", error);
            return createJsonErrorResponse(error.message, 500);
        }
    }

    return serveDir(req, { fsRoot: "static", urlRoot: "", showDirListing: true, enableCors: true });
});