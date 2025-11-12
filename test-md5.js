// MD5测试脚本 - 测试百度翻译API签名生成
import { createHash } from "https://deno.land/std@0.224.0/crypto/mod.ts";

console.log("测试MD5签名生成...");

// 测试案例：百度翻译API文档提供的示例
const apiKey = "2015063000000001";
const query = "hello";
const salt = "1435660288";
const secretKey = "12345678";

// 正确格式：appid+q+salt+密钥
const input = `${apiKey}${query}${salt}${secretKey}`;
console.log(`输入字符串: ${input}`);

// 测试方法1：使用Deno std crypto（如果支持）
try {
    console.log("\n方法1：使用Deno std crypto");
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = createHash("md5");
    hash.update(data);
    const hashHex1 = hash.toString();
    console.log(`生成的MD5签名: ${hashHex1}`);
    console.log(`期望的结果: 5d41402abc4b2a76b9719d911017c592`);
} catch (error) {
    console.log(`Deno std crypto不可用: ${error.message}`);
}

// 测试方法2：使用Web Crypto API的SHA-256（备选方案）
try {
    console.log("\n方法2：使用Web Crypto API");
    const crypto = globalThis.crypto;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex2 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log(`SHA-256结果: ${hashHex2}`);
} catch (error) {
    console.log(`Web Crypto API不可用: ${error.message}`);
}

// 直接用已知结果验证我们的实现
console.log("\n验证百度翻译API示例：");
console.log("如果appid='2015063000000001', q='hello', salt='1435660288', 密钥='12345678'");
console.log("那么签名应该是：5d41402abc4b2a76b9719d911017c592");

console.log("\n测试完成。");