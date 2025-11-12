// 百度翻译API - 基于官方文档的修复版本
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function md5(text: string): string {
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
        let i, length, tail, tmp;
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

function createJsonErrorResponse(message: string, statusCode = 500) {
    return new Response(JSON.stringify({ error: message }), {
        status: statusCode,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
}

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

    if (pathname === "/api/baidu-translate-key-status") {
        const appid = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
        const secret = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
        
        return new Response(JSON.stringify({
            appidSet: !!appid,
            secretSet: !!secret,
            appidLength: appid ? appid.length : 0,
            secretLength: secret ? secret.length : 0,
            appidPreview: appid ? `${appid.substring(0, 4)}...${appid.substring(appid.length - 2)}` : '未设置',
            secretPreview: secret ? `${secret.substring(0, 2)}...${secret.substring(secret.length - 2)}` : '未设置'
        }), {
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
            
            console.log("=== 官方规范验证 ===");
            console.log("1. AppID:", appid ? `${appid.substring(0, 4)}...${appid.substring(appid.length - 2)}` : 'null');
            console.log("2. Secret:", secret ? `${secret.substring(0, 2)}...${secret.substring(secret.length - 2)}` : 'null');
            
            if (!appid || !secret) {
                console.error("❌ 百度翻译API环境变量未正确设置");
                return createJsonErrorResponse("翻译服务配置错误", 500);
            }

            // 语言检测和翻译方向判断
            const hasChinese = /[\u4e00-\u9fa5]/.test(text);
            const hasEnglish = /[a-zA-Z]/.test(text);
            let to_lang = 'en';
            
            if (hasChinese && !hasEnglish) {
                to_lang = 'en'; // 纯中文翻译成英文
            } else if (!hasChinese && hasEnglish) {
                to_lang = 'zh'; // 纯英文翻译成中文
            } else {
                to_lang = 'en'; // 混合文本翻译成英文
            }

            // 🔧 官方建议：使用更简单的盐值格式（避免复杂随机数）
            const salt = Math.floor(Math.random() * 100000).toString(); // 6位随机数
            
            // ✅ 官方规范：签名生成（q参数不进行URL encode）
            const signString = appid + text + salt + secret;
            const sign = md5(signString);
            
            console.log("=== 签名生成（官方规范） ===");
            console.log("1. 签名字符串:", signString.replace(secret, '***SECRET***'));
            console.log("2. 生成签名:", sign);
            console.log("3. 盐值长度:", salt.length);

            // ✅ 官方规范：构建请求参数
            // 注意：这里会使用URLSearchParams自动进行URL encode
            const params = new URLSearchParams();
            params.append('q', text);           // URLSearchParams会自动对q进行URL encode
            params.append('from', 'auto');
            params.append('to', to_lang);
            params.append('appid', appid);
            params.append('salt', salt);
            params.append('sign', sign);

            console.log("=== 请求参数（URL encode后） ===");
            console.log("1. 请求体:", params.toString().replace(secret, '***SECRET***').replace(appid, '***APPID***'));

            // ✅ 官方规范：POST请求
            const response = await fetch("https://fanyi-api.baidu.com/api/trans/vip/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "BaiduTranslate/1.0"
                },
                body: params.toString()
            });

            console.log("=== API响应 ===");
            console.log("状态码:", response.status);

            if (!response.ok) {
                console.error("❌ API响应错误:", response.status, response.statusText);
                return createJsonErrorResponse(`翻译服务错误: ${response.status}`, 500);
            }

            const result = await response.json();
            console.log("响应内容:", JSON.stringify(result, null, 2));

            // 检查百度API返回的错误
            if (result.error_code) {
                console.log("❌ 检测到百度API错误:", result.error_code, result.error_msg);
                let errorMessage = "翻译服务错误";
                switch (result.error_code) {
                    case '54001':
                        errorMessage = "翻译服务签名错误";
                        console.log("❌ 54001错误详情:", {
                            signStringPreview: signString.replace(secret, '***SECRET***'),
                            sign: sign,
                            appid: appid,
                            salt: salt,
                            textLength: text.length,
                            timestamp: new Date().toISOString()
                        });
                        break;
                    case '52003':
                        errorMessage = "翻译服务认证失败，请检查API配置";
                        break;
                    case '54003':
                        errorMessage = "翻译服务请求频率限制";
                        break;
                    case '54004':
                        errorMessage = "翻译服务账户余额不足";
                        break;
                    default:
                        errorMessage = `翻译服务错误 (错误代码: ${result.error_code}, 错误信息: ${result.error_msg || '未知错误'})`;
                }
                return createJsonErrorResponse(errorMessage, 500);
            }

            // 提取翻译结果
            if (result.trans_result && result.trans_result.length > 0) {
                const translatedText = result.trans_result[0].dst;
                console.log("✅ 翻译成功:", {
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
                console.error("❌ 翻译服务返回无效响应:", result);
                return createJsonErrorResponse("翻译服务返回无效响应", 500);
            }

        } catch (error) {
            console.error("❌ 翻译服务处理错误:", error);
            return createJsonErrorResponse("翻译服务网络错误，请检查网络连接", 500);
        }
    }

    if (pathname === "/generate") {
        // 这里保持原有的generate功能
        return createJsonErrorResponse("Generate endpoint temporarily disabled", 501);
    }

    return serveDir(req, { fsRoot: "static", urlRoot: "", showDirListing: true, enableCors: true });
});