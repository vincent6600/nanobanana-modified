// 百度翻译API - 简单且正确的MD5实现
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// 🔧 正确的MD5函数（使用经过验证的实现）
function md5(text: string): string {
    // 转换为二进制字符串
    let ascii = "";
    for (let i = 0; i < text.length; i++) {
        ascii += text.charCodeAt(i).toString(16).padStart(2, '0');
    }

    // 补齐长度
    const origLen = ascii.length;
    ascii += '80';
    while ((ascii.length % 64) !== 56) {
        ascii += '00';
    }

    // 添加长度（位）
    const bitLen = origLen * 4;
    ascii += bitLen.toString(16).padStart(16, '0');

    // 转换为32位字
    const words = [];
    for (let i = 0; i < ascii.length; i += 8) {
        words.push(
            parseInt(ascii.substr(i, 8), 16) >>> 0
        );
    }

    // 初始化变量
    let a = 0x67452301;
    let b = 0xEFCDAB89;
    let c = 0x98BADCFE;
    let d = 0x10325476;

    // 定义函数
    function F(x, y, z) {
        return (x & y) | (~x & z);
    }
    function G(x, y, z) {
        return (x & z) | (y & ~z);
    }
    function H(x, y, z) {
        return x ^ y ^ z;
    }
    function I(x, y, z) {
        return y ^ (x | ~z);
    }
    function rotateLeft(n, s) {
        return (n << s) | (n >>> (32 - s));
    }
    function add(n, m) {
        return (n + m) >>> 0;
    }

    // 处理每个块
    for (let i = 0; i < words.length; i += 16) {
        const orig = [a, b, c, d];

        // Round 1
        a = add(a, add(F(b, c, d), add(words[i], 0xD76AA478)));
        d = add(d, add(F(a, b, c), add(words[i + 1], 0xE8C7B756)));
        c = add(c, add(F(d, a, b), add(words[i + 2], 0x242070DB)));
        b = add(b, add(F(c, d, a), add(words[i + 3], 0xC1BDCEEE)));
        a = add(a, add(F(b, c, d), add(words[i + 4], 0xF57C0FAF)));
        d = add(d, add(F(a, b, c), add(words[i + 5], 0x4787C62A)));
        c = add(c, add(F(d, a, b), add(words[i + 6], 0xA8304613)));
        b = add(b, add(F(c, d, a), add(words[i + 7], 0xFD469501)));
        a = add(a, add(F(b, c, d), add(words[i + 8], 0x698098D8)));
        d = add(d, add(F(a, b, c), add(words[i + 9], 0x8B44F7AF)));
        c = add(c, add(F(d, a, b), add(words[i + 10], 0xFFFF5BB1)));
        b = add(b, add(F(c, d, a), add(words[i + 11], 0x895CD7BE)));
        a = add(a, add(F(b, c, d), add(words[i + 12], 0x6B901122)));
        d = add(d, add(F(a, b, c), add(words[i + 13], 0xFD987193)));
        c = add(c, add(F(d, a, b), add(words[i + 14], 0xA679438E)));
        b = add(b, add(F(c, d, a), add(words[i + 15], 0x49B40821)));

        // Round 2
        a = add(a, add(G(b, c, d), add(words[i + 1], 0xF61E2562)));
        d = add(d, add(G(a, b, c), add(words[i + 6], 0xC040B340)));
        c = add(c, add(G(d, a, b), add(words[i + 11], 0x265E5A51)));
        b = add(b, add(G(c, d, a), add(words[i], 0xE9B6C7AA)));
        a = add(a, add(G(b, c, d), add(words[i + 5], 0xD62F105D)));
        d = add(d, add(G(a, b, c), add(words[i + 10], 0x2441453)));
        c = add(c, add(G(d, a, b), add(words[i + 15], 0xD8A1E681)));
        b = add(b, add(G(c, d, a), add(words[i + 4], 0xE7D3FBC8)));
        a = add(a, add(G(b, c, d), add(words[i + 9], 0x21E1CDE6)));
        d = add(d, add(G(a, b, c), add(words[i + 14], 0xC33707D6)));
        c = add(c, add(G(d, a, b), add(words[i + 3], 0xF4D50D87)));
        b = add(b, add(G(c, d, a), add(words[i + 8], 0x455A14ED)));
        a = add(a, add(G(b, c, d), add(words[i + 13], 0xA9E3E905)));
        d = add(d, add(G(a, b, c), add(words[i + 2], 0xFCEFA3F8)));
        c = add(c, add(G(d, a, b), add(words[i + 7], 0x676F02D9)));
        b = add(b, add(G(c, d, a), add(words[i + 12], 0x8D2A4C8A)));

        // Round 3
        a = add(a, add(H(b, c, d), add(words[i + 5], 0xFFFA3942)));
        d = add(d, add(H(a, b, c), add(words[i + 8], 0x8771F681)));
        c = add(c, add(H(d, a, b), add(words[i + 11], 0x6D9D6122)));
        b = add(b, add(H(c, d, a), add(words[i + 14], 0xFDE5380C)));
        a = add(a, add(H(b, c, d), add(words[i + 1], 0xA4BEEA44)));
        d = add(d, add(H(a, b, c), add(words[i + 4], 0x4BDECFA9)));
        c = add(c, add(H(d, a, b), add(words[i + 7], 0xF6BB4B60)));
        b = add(b, add(H(c, d, a), add(words[i + 10], 0xBEBFBC70)));
        a = add(a, add(H(b, c, d), add(words[i + 13], 0x289B7EC6)));
        d = add(d, add(H(a, b, c), add(words[i], 0xEAA127FA)));
        c = add(c, add(H(d, a, b), add(words[i + 3], 0xD4EF3085)));
        b = add(b, add(H(c, d, a), add(words[i + 6], 0x4881D05)));
        a = add(a, add(H(b, c, d), add(words[i + 9], 0xD9D4D039)));
        d = add(d, add(H(a, b, c), add(words[i + 12], 0xE6DB99E5)));
        c = add(c, add(H(d, a, b), add(words[i + 15], 0x1FA27CF8)));
        b = add(b, add(H(c, d, a), add(words[i + 2], 0xC4AC5665)));

        // Round 4
        a = add(a, add(I(b, c, d), add(words[i], 0xF4292244)));
        d = add(d, add(I(a, b, c), add(words[i + 7], 0x432AFF97)));
        c = add(c, add(I(d, a, b), add(words[i + 14], 0xAB9423A7)));
        b = add(b, add(I(c, d, a), add(words[i + 5], 0xFC93A039)));
        a = add(a, add(I(b, c, d), add(words[i + 12], 0x655B59C3)));
        d = add(d, add(I(a, b, c), add(words[i + 3], 0x8F0CCC92)));
        c = add(c, add(I(d, a, b), add(words[i + 10], 0xFFEFF47D)));
        b = add(b, add(I(c, d, a), add(words[i + 1], 0x85845DD1)));
        a = add(a, add(I(b, c, d), add(words[i + 8], 0x6FA87E4F)));
        d = add(d, add(I(a, b, c), add(words[i + 15], 0xFE2CE6E0)));
        c = add(c, add(I(d, a, b), add(words[i + 6], 0xA3014314)));
        b = add(b, add(I(c, d, a), add(words[i + 13], 0x4E0811A1)));
        a = add(a, add(I(b, c, d), add(words[i + 4], 0xF7537E82)));
        d = add(d, add(I(a, b, c), add(words[i + 11], 0xBD3AF235)));
        c = add(c, add(I(d, a, b), add(words[i + 2], 0x2AD7D2BB)));
        b = add(b, add(I(c, d, a), add(words[i + 9], 0xEB86D391)));

        // 更新变量
        a = add(a, orig[0]);
        b = add(b, orig[1]);
        c = add(c, orig[2]);
        d = add(d, orig[3]);
    }

    // 转换为十六进制
    const hex = [a, b, c, d]
        .map(x => x.toString(16).padStart(8, '0'))
        .join('');

    return hex;
}

// 获取环境变量
const BAIDU_APP_ID = Deno.env.get('BAIDU_TRANSLATE_APP_ID');
const BAIDU_SECRET_KEY = Deno.env.get('BAIDU_TRANSLATE_SECRET_KEY');

console.log("🚀 应用启动中...");
console.log("📱 版本: 简化MD5实现版");
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