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
// 模块 0: 百度翻译API调用逻辑
// =======================================================
async function callBaiduTranslate(text: string, from: string, to: string, apiKey: string): Promise<any> {
    // 生成签名
    const salt = Date.now().toString();
    const sign = await generateBaiduSign(text, from, to, apiKey, salt);
    
    const requestBody = new URLSearchParams({
        q: text,
        from: from,
        to: to,
        appid: apiKey,
        salt: salt,
        sign: sign
    });

    console.log(`百度翻译API请求: ${requestBody.toString()}`);

    const response = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`百度翻译API错误: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('百度翻译API响应:', JSON.stringify(data, null, 2));

    // 检查百度翻译API的错误响应
    if (data.error_code) {
        let errorMessage = '翻译失败';
        switch (data.error_code) {
            case '52001':
                errorMessage = '翻译失败：请求超时';
                break;
            case '52002':
                errorMessage = '翻译失败：系统错误';
                break;
            case '52003':
                errorMessage = '翻译失败：未授权用户';
                break;
            case '54003':
                errorMessage = '翻译失败：API配额不足';
                break;
            case '54005':
                errorMessage = '翻译失败：签名错误';
                break;
            case '58000':
                errorMessage = '翻译失败：客户端IP非法';
                break;
            case '58001':
                errorMessage = '翻译失败：译文语言不支持';
                break;
            default:
                errorMessage = `翻译失败：${data.error_msg || '未知错误'}`;
        }
        throw new Error(errorMessage);
    }

    // 检查返回结果
    if (!data.trans_result || !Array.isArray(data.trans_result) || data.trans_result.length === 0) {
        throw new Error('翻译失败：未返回翻译结果');
    }

    return data;
}

// 生成百度翻译API签名 - 使用稳定的MD5库
async function generateBaiduSign(text: string, from: string, to: string, apiKey: string, salt: string): Promise<string> {
    const input = `${apiKey}${text}${salt}179***78ulDjDWy7JoNVk:`;
    
    // 使用稳定且广泛验证的 MD5 库
    try {
        const response = await fetch("https://cdn.jsdelivr.net/npm/blueimp-md5@2.19.0/js/md5.min.js");
        if (response.ok) {
            const md5Code = await response.text();
            // 使用eval执行MD5函数（临时方案）
            eval(md5Code);
            return (window.md5 || globalThis.md5)(input);
        }
    } catch (error) {
        console.error("外部MD5库加载失败:", error);
    }
    
    // 备选方案：使用内置的可靠MD5实现
    return await builtinMD5(input);
}

// 内置的可靠MD5实现
async function builtinMD5(str: string): Promise<string> {
    // 这个实现基于标准的MD5算法
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    // MD5算法的核心常量
    const S = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    
    const K = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];
    
    // 初始化MD5变量
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;
    
    // 转换输入为字节数组
    const bytes = Array.from(data);
    const originalLength = bytes.length;
    
    // 计算填充长度
    const bitLength = originalLength * 8;
    const padLength = ((56 - (originalLength % 64) + 64) % 64) + 8;
    const paddedLength = originalLength + padLength;
    
    // 创建填充后的数据
    const paddedBytes = new Array(paddedLength);
    for (let i = 0; i < originalLength; i++) {
        paddedBytes[i] = bytes[i];
    }
    paddedBytes[originalLength] = 0x80;
    
    // 添加长度信息（64位，little-endian）
    for (let i = 0; i < 8; i++) {
        paddedBytes[paddedLength - 8 + i] = (bitLength >>> (i * 8)) & 0xff;
    }
    
    // 处理512位块
    for (let i = 0; i < paddedBytes.length; i += 64) {
        const X = new Array(16);
        for (let j = 0; j < 16; j++) {
            const idx = i + j * 4;
            X[j] = (paddedBytes[idx] | (paddedBytes[idx + 1] << 8) | (paddedBytes[idx + 2] << 16) | (paddedBytes[idx + 3] << 24)) >>> 0;
        }
        
        let A = a, B = b, C = c, D = d;
        
        // 64轮主循环
        for (let j = 0; j < 64; j++) {
            let F, g;
            if (j < 16) {
                F = (B & C) | ((~B) & D);
                g = j;
            } else if (j < 32) {
                F = (D & B) | ((~D) & C);
                g = (5 * j + 1) % 16;
            } else if (j < 48) {
                F = B ^ C ^ D;
                g = (3 * j + 5) % 16;
            } else {
                F = C ^ (B | (~D));
                g = (7 * j) % 16;
            }
            
            const temp = D;
            D = C;
            C = B;
            const sum = (A + F + K[j] + X[g]) >>> 0;
            B = (B + ((sum << S[j]) | (sum >>> (32 - S[j])))) >>> 0;
            A = temp;
        }
        
        a = (a + A) >>> 0;
        b = (b + B) >>> 0;
        c = (c + C) >>> 0;
        d = (d + D) >>> 0;
    }
    
    // 转换为小写十六进制字符串
    return (
        [a & 0xff, (a >> 8) & 0xff, (a >> 16) & 0xff, (a >> 24) & 0xff,
         b & 0xff, (b >> 8) & 0xff, (b >> 16) & 0xff, (b >> 24) & 0xff,
         c & 0xff, (c >> 8) & 0xff, (c >> 16) & 0xff, (c >> 24) & 0xff,
         d & 0xff, (d >> 8) & 0xff, (d >> 16) & 0xff, (d >> 24) & 0xff]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
    );
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

    if (pathname === "/api/modelscope-key-status") {
        const isSet = !!Deno.env.get("MODELSCOPE_API_KEY");
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
            const apiKey = Deno.env.get("BAIDUFANYI_API_KEY");
            if (!apiKey) {
                return createJsonErrorResponse("翻译服务未配置，请联系管理员", 500);
            }

            console.log(`开始翻译: "${q}" 从 ${from} 到 ${to}`);

            // 调用百度翻译API
            const result = await callBaiduTranslate(q, from, to, apiKey);
            
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
                const modelscopeApiKey = apikey || Deno.env.get("MODELSCOPE_API_KEY");
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