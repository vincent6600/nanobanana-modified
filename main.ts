// --- START OF FILE main.ts ---

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// --- MD5 哈希算法实现 (用于百度翻译API签名) ---
function md5(text: string): string {
    // 使用标准的MD5算法实现
    function md5cycle(x: number[], k: number[]) {
        let a = x[0], b = x[1], c = x[2], d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md51(s: string) {
        const n = s.length;
        const state = [1732584193, -271733879, -1732584194, 271733878];
        let i, length, tail, tmp, lo, hi;

        for (i = 64; i <= s.length; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }

        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (i = 0; i < length; i++) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i++) tail[i] = 0;
        }

        // Append length in bits
        tmp = n * 8;
        tail[14] = tmp & 0xFFFFFFFF;
        tail[15] = Math.floor(tmp / 0x100000000);
        md5cycle(state, tail);

        return state;
    }

    function md5blk(s: string) {
        const md5blks = [];
        for (let i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    function rhex(n: number) {
        const s = '0123456789abcdef';
        let j: number, tmp = '';
        for (let i = 0; i < 4; i++) {
            j = (n >> (i * 8)) & 255;
            tmp += s.charAt((j >> 4) & 15) + s.charAt(j & 15);
        }
        return tmp;
    }

    function hex(x: number[]) {
        for (let i = 0; i < x.length; i++) {
            x[i] = rhex(x[i]);
        }
        return x.join('');
    }

    function add32(a: number, b: number) {
        return (a + b) & 0xFFFFFFFF;
    }

    return hex(md51(text));
}

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

    if (pathname === "/api/translate") {
        try {
            if (req.method !== "POST") {
                return createJsonErrorResponse("仅支持POST请求", 405);
            }

            const { text } = await req.json();
            if (!text || text.trim() === "") {
                return createJsonErrorResponse("翻译文本不能为空", 400);
            }

            const appid = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
            const secret = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
            
            if (!appid || !secret) {
                console.error("百度翻译API环境变量未设置");
                return createJsonErrorResponse("翻译服务配置错误", 500);
            }

            // 语言检测和翻译方向判断
            const hasChinese = /[\u4e00-\u9fa5]/.test(text);
            const hasEnglish = /[a-zA-Z]/.test(text);
            let to_lang = 'en'; // 默认中英文都翻译成英文
            
            if (hasChinese && !hasEnglish) {
                to_lang = 'en'; // 纯中文翻译成英文
            } else if (!hasChinese && hasEnglish) {
                to_lang = 'zh'; // 纯英文翻译成中文
            } else {
                to_lang = 'en'; // 混合文本翻译成英文
            }

            // 生成随机盐值 (10位随机数字)
            const salt = Math.floor(Math.random() * 10000000000).toString();
            
            // 关键修复：按照百度API规范生成签名
            // 签名格式: MD5(appid + q + salt + key)
            // 注意：q参数在拼接前不能进行URL编码，必须是原始UTF-8字符串
            const signString = appid + text + salt + secret;
            const sign = md5(signString);
            
            console.log("签名生成信息:", {
                appid,
                q: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                salt,
                signString: signString.replace(secret, '***SECRET***'),
                sign
            });

            // 构建POST请求参数（使用application/x-www-form-urlencoded格式）
            const params = new URLSearchParams();
            params.append('q', text);  // 原始文本，不进行URL编码
            params.append('from', 'auto');
            params.append('to', to_lang);
            params.append('appid', appid);
            params.append('salt', salt);
            params.append('sign', sign);

            console.log("发送翻译请求到百度API:", {
                endpoint: "https://fanyi-api.baidu.com/api/trans/vip/translate",
                method: "POST",
                contentType: "application/x-www-form-urlencoded",
                from: "auto",
                to: to_lang,
                text_length: text.length,
                params_length: params.toString().length
            });

            const response = await fetch("https://fanyi-api.baidu.com/api/trans/vip/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (compatible; Deno-Translation/1.0)"
                },
                body: params.toString()
            });

            if (!response.ok) {
                console.error("百度翻译API响应错误:", response.status, response.statusText);
                return createJsonErrorResponse(`翻译服务错误: ${response.status}`, 500);
            }

            const result = await response.json();
            console.log("百度翻译API响应:", result);

            // 检查百度API返回的错误
            if (result.error_code) {
                let errorMessage = "翻译服务错误";
                switch (result.error_code) {
                    case '52000':
                        errorMessage = "翻译成功（不应该出现此错误）";
                        break;
                    case '52001':
                        errorMessage = "翻译服务请求超时，请稍后重试";
                        break;
                    case '52002':
                        errorMessage = "翻译服务系统错误，请稍后重试";
                        break;
                    case '52003':
                        errorMessage = "翻译服务认证失败，请检查API配置";
                        break;
                    case '54000':
                        errorMessage = "翻译服务参数缺失";
                        break;
                    case '54001':
                        errorMessage = "翻译服务签名错误，请检查API配置";
                        break;
                    case '54003':
                        errorMessage = "翻译服务请求频率限制，请稍后重试";
                        break;
                    case '54004':
                        errorMessage = "翻译服务账户余额不足";
                        break;
                    case '54005':
                        errorMessage = "翻译服务请求过于频繁，请等待3秒";
                        break;
                    case '58000':
                        errorMessage = "翻译服务客户端IP非法";
                        break;
                    case '58001':
                        errorMessage = "翻译服务服务不支持该语言";
                        break;
                    case '90107':
                        errorMessage = "翻译服务认证失败或未生效";
                        break;
                    default:
                        errorMessage = `翻译服务错误 (错误代码: ${result.error_code}, 错误信息: ${result.error_msg || '未知错误'})`;
                }
                console.error("百度翻译API错误:", result);
                return createJsonErrorResponse(errorMessage, 500);
            }

            // 提取翻译结果
            if (result.trans_result && result.trans_result.length > 0) {
                const translatedText = result.trans_result[0].dst;
                console.log("翻译成功:", {
                    original: text,
                    translated: translatedText,
                    from: result.from,
                    to: result.to
                });
                
                return new Response(JSON.stringify({ 
                    translated: translatedText,
                    original: text,
                    from: result.from,
                    to: result.to
                }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            } else {
                console.error("百度翻译API返回无效响应:", result);
                return createJsonErrorResponse("翻译服务返回无效响应", 500);
            }

        } catch (error) {
            console.error("翻译服务处理错误:", error);
            return createJsonErrorResponse("翻译服务网络错误，请检查网络连接", 500);
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