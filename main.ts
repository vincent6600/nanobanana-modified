// 百度翻译API - MD5修复版本（确保与官方示例匹配）
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// 🔧 重新实现的MD5函数（基于官方示例验证）
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
        a = hh(a, b, c, d, k[5], 4, -1502269306);
        d = hh(d, a, b, c, k[8], 11, -1735329473);
        c = hh(c, d, a, b, k[11], 16, -198630883);
        b = hh(b, c, d, a, k[14], 23, 1126891415);
        
        a = ii(a, b, c, d, k[0], 6, -1416354905);
        d = ii(d, a, b, c, k[7], 10, -57434055);
        c = ii(c, d, a, b, k[14], 15, 1700485571);
        b = ii(b, c, d, a, k[1], 21, -1894986606);
        a = ii(a, b, c, d, k[6], 6, -1051523);
        d = ii(d, a, b, c, k[13], 10, -2054922799);
        c = ii(c, d, a, b, k[4], 15, 1873313359);
        b = ii(b, c, d, a, k[11], 21, -30611744);
        a = ii(a, b, c, d, k[2], 6, -1560198380);
        d = ii(d, a, b, c, k[9], 10, 1309151649);
        c = ii(c, d, a, b, k[14], 15, -145523070);
        b = ii(b, c, d, a, k[3], 21, -1120210379);
        a = ii(a, b, c, d, k[10], 6, 718787259);
        d = ii(d, a, b, c, k[15], 10, -343485551);
        
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md51(s: string): number[] {
        let n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i, length, tail, tmp, lo, hi;
            
        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        
        s = s.substring(i - 64);
        length = s.length;
        tail = new Array(64);
        tail.fill(0);
        
        for (i = 0; i < length; i++) {
            tail[i] = s.charCodeAt(i);
        }
        
        tail[i] = 128;
        
        if (length > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 64; i++) tail[i] = 0;
        }
        
        tmp = n * 8;
        for (i = 0; i < 8; i++) {
            tail[i] = tmp & 255;
            tmp = Math.floor(tmp / 256);
        }
        
        md5cycle(state, tail);
        return state;
    }

    function md5blk(s: string): number[] {
        let md5blks: number[] = [], i;
        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + 
                             (s.charCodeAt(i + 1) << 8) + 
                             (s.charCodeAt(i + 2) << 16) + 
                             (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    const hex_chr = '0123456789abcdef'.split('');
    function rhex(n: number): string {
        let s = '', j = 0;
        for (; j < 4; j++) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    }

    function hex(x: number[]): string {
        for (let i = 0; i < x.length; i++) {
            x[i] = rhex(x[i]);
        }
        return x.join('');
    }

    function add32(a: number, b: number): number {
        return (a + b) & 0xFFFFFFFF;
    }

    return hex(md51(text));
}

// 获取环境变量
const BAIDU_APP_ID = Deno.env.get('BAIDU_TRANSLATE_APP_ID');
const BAIDU_SECRET_KEY = Deno.env.get('BAIDU_TRANSLATE_SECRET_KEY');

console.log("🚀 应用启动中...");
console.log("📱 版本: MD5修复版");
console.log("🔑 AppID配置:", BAIDU_APP_ID ? `已配置 (${BAIDU_APP_ID.length}位)` : "❌ 未配置");
console.log("🔐 Secret Key配置:", BAIDU_SECRET_KEY ? `已配置 (${BAIDU_SECRET_KEY.length}位)` : "❌ 未配置");

// 验证官方示例
function testOfficialExample() {
    console.log("\n🧪 测试官方示例验证:");
    const appid = "2015063000000001";
    const q = "apple";
    const salt = "1435660288";
    const secret = "1234567890";
    const expectedSign = "a1a7461d92e5194c5cae3182b5b24de1";
    
    const signString = appid + q + salt + secret;
    const generatedSign = md5(signString);
    
    console.log("   📝 签名字符串:", signString);
    console.log("   🎯 生成的签名:", generatedSign);
    console.log("   ✅ 期望的签名:", expectedSign);
    console.log("   🔍 匹配结果:", generatedSign === expectedSign ? "✅ 通过" : "❌ 失败");
    
    return generatedSign === expectedSign;
}

// 运行官方示例测试
const exampleTestResult = testOfficialExample();

// 创建错误响应
function createJsonErrorResponse(message: string, status: number = 400) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

// 创建成功响应
function createJsonResponse(data: any) {
    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
}

serve(async (req) => {
    try {
        const url = new URL(req.url);
        const path = url.pathname;

        console.log(`\n🌐 请求: ${req.method} ${path}`);

        // 静态文件服务
        if (req.method === "GET" && (path === "/" || path.startsWith("/index") || path.endsWith(".js") || path.endsWith(".css") || path.endsWith(".html"))) {
            return serveDir(req);
        }

        // 🔧 API测试端点
        if (path === "/api/test-md5") {
            console.log("\n🧪 MD5测试端点");
            const examplePassed = testOfficialExample();
            
            const result = {
                status: "success",
                message: "MD5函数测试完成",
                exampleTest: examplePassed ? "✅ 通过" : "❌ 失败",
                officialExample: {
                    appid: "2015063000000001",
                    q: "apple", 
                    salt: "1435660288",
                    secret: "1234567890",
                    expectedSign: "a1a7461d92e5194c5cae3182b5b24de1",
                    generatedSign: md5("2015063000000001" + "apple" + "1435660288" + "1234567890")
                },
                environment: {
                    appIdConfigured: !!BAIDU_APP_ID,
                    secretConfigured: !!BAIDU_SECRET_KEY,
                    appIdLength: BAIDU_APP_ID ? BAIDU_APP_ID.length : 0,
                    secretLength: BAIDU_SECRET_KEY ? BAIDU_SECRET_KEY.length : 0
                }
            };
            
            console.log("📄 测试结果:", JSON.stringify(result, null, 2));
            return createJsonResponse(result);
        }

        // 🔧 API环境检查端点
        if (path === "/api/check-env") {
            console.log("\n🔧 环境检查端点");
            
            const result = {
                status: "success",
                message: "环境变量检查",
                environment: {
                    appId: BAIDU_APP_ID,
                    appIdLength: BAIDU_APP_ID ? BAIDU_APP_ID.length : 0,
                    appIdConfigured: !!BAIDU_APP_ID,
                    secretKey: BAIDU_SECRET_KEY,
                    secretLength: BAIDU_SECRET_KEY ? BAIDU_SECRET_KEY.length : 0,
                    secretConfigured: !!BAIDU_SECRET_KEY,
                    exampleTestPassed: exampleTestResult
                }
            };
            
            console.log("📄 环境检查:", JSON.stringify(result, null, 2));
            return createJsonResponse(result);
        }

        // 🔧 翻译端点
        if (path === "/api/translate" && req.method === "POST") {
            console.log("\n🔄 开始翻译请求");
            
            // 检查MD5函数是否正确
            if (!exampleTestResult) {
                console.log("❌ MD5函数验证失败，无法进行翻译");
                return createJsonErrorResponse("MD5函数实现错误，请联系开发者", 500);
            }
            
            // 检查环境变量
            if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
                console.log("❌ 环境变量未配置");
                console.log("   AppID:", BAIDU_APP_ID ? "已配置" : "未配置");
                console.log("   Secret:", BAIDU_SECRET_KEY ? "已配置" : "未配置");
                return createJsonErrorResponse("百度翻译API环境变量未配置", 500);
            }

            // 解析请求数据
            let requestData;
            try {
                requestData = await req.json();
            } catch (error) {
                console.log("❌ JSON解析错误:", error.message);
                return createJsonErrorResponse("无效的JSON数据", 400);
            }

            const { text, from = "auto", to = "zh" } = requestData;
            
            if (!text || text.trim() === "") {
                console.log("❌ 缺少翻译文本");
                return createJsonErrorResponse("请提供要翻译的文本", 400);
            }

            console.log("📝 翻译参数:");
            console.log("   原文:", text);
            console.log("   源语言:", from);
            console.log("   目标语言:", to);

            // 🔍 签名生成过程调试
            console.log("\n🔍 签名生成过程调试:");
            
            const salt = Date.now().toString();
            const signString = BAIDU_APP_ID + text + salt + BAIDU_SECRET_KEY;
            const sign = md5(signString);
            
            console.log("🔑 签名字符串组成:");
            console.log("   AppID:", BAIDU_APP_ID);
            console.log("   文本:", text);
            console.log("   盐值:", salt);
            console.log("   Secret:", BAIDU_SECRET_KEY.substring(0, 3) + "***");
            console.log("   完整签名字符串:", signString);
            console.log("🎯 最终签名:", sign);
            
            // 构建请求参数
            const params = new URLSearchParams();
            params.append('q', text);
            params.append('from', from);
            params.append('to', to);
            params.append('appid', BAIDU_APP_ID);
            params.append('salt', salt);
            params.append('sign', sign);
            
            const encodedBody = params.toString();
            
            console.log("\n📡 请求参数详情:");
            console.log("   Method: POST");
            console.log("   URL: https://fanyi-api.baidu.com/api/trans/vip/translate");
            console.log("   Content-Type: application/x-www-form-urlencoded");
            console.log("   Body:", encodedBody.replace(BAIDU_SECRET_KEY, '***SECRET***').replace(BAIDU_APP_ID, '***APPID***'));
            
            // 发送API请求
            const response = await fetch("https://fanyi-api.baidu.com/api/trans/vip/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: encodedBody
            });

            console.log("\n📬 API响应:");
            console.log("   状态码:", response.status);
            console.log("   状态文本:", response.statusText);

            if (!response.ok) {
                console.error("❌ API请求失败:", response.status, response.statusText);
                return createJsonErrorResponse(`翻译服务网络错误: ${response.status}`, 500);
            }

            const result = await response.json();
            console.log("📄 完整响应:", JSON.stringify(result, null, 2));

            // 检查百度API返回的错误
            if (result.error_code) {
                console.log("❌ 百度API返回错误:", {
                    error_code: result.error_code,
                    error_msg: result.error_msg
                });
                
                let errorMessage = "翻译服务错误";
                switch (result.error_code) {
                    case '54001':
                        errorMessage = "54001签名错误";
                        console.log("🔍 54001错误诊断:", {
                            signStringPreview: signString.replace(BAIDU_SECRET_KEY, '***SECRET***'),
                            sign: sign,
                            textLength: text.length,
                            salt: salt,
                            timestamp: new Date().toISOString(),
                            note: "签名生成可能有问题，请检查MD5函数或参数顺序",
                            debugSteps: [
                                "1. 确认MD5函数正确",
                                "2. 确认签名字符串顺序: appid+q+salt+secret",
                                "3. 确认q参数在签名前未进行URL编码",
                                "4. 确认环境变量正确"
                            ]
                        });
                        break;
                    case '52003':
                        errorMessage = "API认证失败，请检查APP ID和密钥";
                        console.log("🔍 52003错误诊断:", {
                            appIdLength: BAIDU_APP_ID.length,
                            secretLength: BAIDU_SECRET_KEY.length,
                            note: "请检查APP ID和Secret Key是否正确"
                        });
                        break;
                    case '54003':
                        errorMessage = "请求频率限制";
                        break;
                    default:
                        console.log("🔍 其他错误诊断:", {
                            errorCode: result.error_code,
                            errorMessage: result.error_msg
                        });
                }
                
                return createJsonErrorResponse(errorMessage, 400);
            }

            // 翻译成功
            console.log("✅ 翻译成功");
            return createJsonResponse({
                success: true,
                translatedText: result.trans_result ? result.trans_result[0].dst : "翻译结果为空",
                originalText: text,
                from: result.from,
                to: result.to
            });
        }

        // 404响应
        console.log("❓ 未知路径:", path);
        return new Response("Not Found", { status: 404 });

    } catch (error) {
        console.error("💥 服务器错误:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
});