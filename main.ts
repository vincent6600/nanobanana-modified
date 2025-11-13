// 百度翻译API - 简化MD5实现v2（稳定版本）
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// 🔧 简化的MD5函数（基于标准算法）
function md5(text: string): string {
    // 转为UTF-8字节
    const bytes = new TextEncoder().encode(text);
    const hexBytes = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 计算长度并补齐
    const origLen = hexBytes.length;
    const bitLen = (origLen / 2) * 8;
    
    // 补齐到448位（56字节）
    let padded = hexBytes + '80';
    while ((padded.length / 2) % 64 !== 56) {
        padded += '00';
    }
    
    // 添加原始长度（64位）
    const lenHex = bitLen.toString(16).padStart(16, '0');
    padded += lenHex;
    
    // 转换为32位整数数组
    const words = [];
    for (let i = 0; i < padded.length; i += 8) {
        words.push(parseInt(padded.substr(i, 8), 16) >>> 0);
    }
    
    // MD5常量
    let a = 0x67452301;
    let b = 0xEFCDAB89;
    let c = 0x98BADCFE;
    let d = 0x10325476;
    
    // 辅助函数
    function F(x: number, y: number, z: number): number {
        return (x & y) | (~x & z);
    }
    function G(x: number, y: number, z: number): number {
        return (x & z) | (y & ~z);
    }
    function H(x: number, y: number, z: number): number {
        return x ^ y ^ z;
    }
    function I(x: number, y: number, z: number): number {
        return y ^ (x | ~z);
    }
    function rotl(x: number, n: number): number {
        return (x << n) | (x >>> (32 - n));
    }
    function add(x: number, y: number): number {
        return (x + y) >>> 0;
    }
    
    const T = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x2441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4bea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x4881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];
    
    // 处理每个512位块
    for (let i = 0; i < words.length; i += 16) {
        const aa = a, bb = b, cc = c, dd = d;
        
        // Round 1
        a = add(a, add(F(b, c, d), add(words[i], T[0])));
        d = add(d, add(F(a, b, c), add(words[i + 1], T[1])));
        c = add(c, add(F(d, a, b), add(words[i + 2], T[2])));
        b = add(b, add(F(c, d, a), add(words[i + 3], T[3])));
        a = add(a, add(F(b, c, d), add(words[i + 4], T[4])));
        d = add(d, add(F(a, b, c), add(words[i + 5], T[5])));
        c = add(c, add(F(d, a, b), add(words[i + 6], T[6])));
        b = add(b, add(F(c, d, a), add(words[i + 7], T[7])));
        a = add(a, add(F(b, c, d), add(words[i + 8], T[8])));
        d = add(d, add(F(a, b, c), add(words[i + 9], T[9])));
        c = add(c, add(F(d, a, b), add(words[i + 10], T[10])));
        b = add(b, add(F(c, d, a), add(words[i + 11], T[11])));
        a = add(a, add(F(b, c, d), add(words[i + 12], T[12])));
        d = add(d, add(F(a, b, c), add(words[i + 13], T[13])));
        c = add(c, add(F(d, a, b), add(words[i + 14], T[14])));
        b = add(b, add(F(c, d, a), add(words[i + 15], T[15])));
        
        // Round 2
        a = add(a, add(G(b, c, d), add(words[i + 1], T[16])));
        d = add(d, add(G(a, b, c), add(words[i + 6], T[17])));
        c = add(c, add(G(d, a, b), add(words[i + 11], T[18])));
        b = add(b, add(G(c, d, a), add(words[i], T[19])));
        a = add(a, add(G(b, c, d), add(words[i + 5], T[20])));
        d = add(d, add(G(a, b, c), add(words[i + 10], T[21])));
        c = add(c, add(G(d, a, b), add(words[i + 15], T[22])));
        b = add(b, add(G(c, d, a), add(words[i + 4], T[23])));
        a = add(a, add(G(b, c, d), add(words[i + 9], T[24])));
        d = add(d, add(G(a, b, c), add(words[i + 14], T[25])));
        c = add(c, add(G(d, a, b), add(words[i + 3], T[26])));
        b = add(b, add(G(c, d, a), add(words[i + 8], T[27])));
        a = add(a, add(G(b, c, d), add(words[i + 13], T[28])));
        d = add(d, add(G(a, b, c), add(words[i + 2], T[29])));
        c = add(c, add(G(d, a, b), add(words[i + 7], T[30])));
        b = add(b, add(G(c, d, a), add(words[i + 12], T[31])));
        
        // Round 3
        a = add(a, add(H(b, c, d), add(words[i + 5], T[32])));
        d = add(d, add(H(a, b, c), add(words[i + 8], T[33])));
        c = add(c, add(H(d, a, b), add(words[i + 11], T[34])));
        b = add(b, add(H(c, d, a), add(words[i + 14], T[35])));
        a = add(a, add(H(b, c, d), add(words[i + 1], T[36])));
        d = add(d, add(H(a, b, c), add(words[i + 4], T[37])));
        c = add(c, add(H(d, a, b), add(words[i + 7], T[38])));
        b = add(b, add(H(c, d, a), add(words[i + 10], T[39])));
        a = add(a, add(H(b, c, d), add(words[i + 13], T[40])));
        d = add(d, add(H(a, b, c), add(words[i], T[41])));
        c = add(c, add(H(d, a, b), add(words[i + 3], T[42])));
        b = add(b, add(H(c, d, a), add(words[i + 6], T[43])));
        a = add(a, add(H(b, c, d), add(words[i + 9], T[44])));
        d = add(d, add(H(a, b, c), add(words[i + 12], T[45])));
        c = add(c, add(H(d, a, b), add(words[i + 15], T[46])));
        b = add(b, add(H(c, d, a), add(words[i + 2], T[47])));
        
        // Round 4
        a = add(a, add(I(b, c, d), add(words[i], T[48])));
        d = add(d, add(I(a, b, c), add(words[i + 7], T[49])));
        c = add(c, add(I(d, a, b), add(words[i + 14], T[50])));
        b = add(b, add(I(c, d, a), add(words[i + 5], T[51])));
        a = add(a, add(I(b, c, d), add(words[i + 12], T[52])));
        d = add(d, add(I(a, b, c), add(words[i + 3], T[53])));
        c = add(c, add(I(d, a, b), add(words[i + 10], T[54])));
        b = add(b, add(I(c, d, a), add(words[i + 1], T[55])));
        a = add(a, add(I(b, c, d), add(words[i + 8], T[56])));
        d = add(d, add(I(a, b, c), add(words[i + 15], T[57])));
        c = add(c, add(I(d, a, b), add(words[i + 6], T[58])));
        b = add(b, add(I(c, d, a), add(words[i + 13], T[59])));
        a = add(a, add(I(b, c, d), add(words[i + 4], T[60])));
        d = add(d, add(I(a, b, c), add(words[i + 11], T[61])));
        c = add(c, add(I(d, a, b), add(words[i + 2], T[62])));
        b = add(b, add(I(c, d, a), add(words[i + 9], T[63])));
        
        // 更新状态
        a = add(a, aa);
        b = add(b, bb);
        c = add(c, cc);
        d = add(d, dd);
    }
    
    // 生成最终哈希
    return [a, b, c, d].map(x => x.toString(16).padStart(8, '0')).join('');
}

// 获取环境变量
const BAIDU_APP_ID = Deno.env.get('BAIDU_TRANSLATE_APP_ID');
const BAIDU_SECRET_KEY = Deno.env.get('BAIDU_TRANSLATE_SECRET_KEY');

console.log("🚀 应用启动中...");
console.log("📱 版本: 简化MD5实现v2（稳定版本）");
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
            
            const salt = Date.now().toString(); // ✅ 正确的salt实现
            const signString = BAIDU_APP_ID + text + salt + BAIDU_SECRET_KEY;
            const sign = md5(signString);
            
            console.log("🔑 签名字符串组成:");
            console.log("   AppID:", BAIDU_APP_ID);
            console.log("   文本:", text);
            console.log("   盐值(Salt):", salt, "✅ 正确 - 每次请求都不同");
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
                                "4. 确认环境变量正确",
                                "5. 确认salt使用时间戳正确"
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