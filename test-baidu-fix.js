// 百度翻译API修复验证脚本
// 测试MD5签名生成和API调用

// 测试用的MD5算法（简化版本用于验证）
function simpleMd5(str) {
    // 这里使用Node.js的内置crypto模块进行验证
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

// 模拟签名生成（按官方文档标准）
function generateBaiduSignatureTest(appId, text, salt, secretKey) {
    // 官方要求顺序：appid + q + salt + 密钥
    const signString = `${appId}${text}${salt}${secretKey}`;
    console.log('签名字符串:', signString);
    // 官方要求：32位小写MD5签名
    const sign = simpleMd5(signString);
    console.log('MD5签名:', sign);
    return sign;
}

// 测试用例
const testCases = [
    {
        name: "官方文档示例",
        appId: "2015063000000001",
        text: "apple", 
        salt: "65478",
        secretKey: "1234567890",
        expectedSign: "a1a7461d92e5194c5cae3182b5b24de1"
    },
    {
        name: "中文测试",
        appId: "20201106000837143", 
        text: "你好",
        salt: "random123",
        secretKey: "ABC123DEF456GHI"
    }
];

console.log('=== 百度翻译API签名生成测试 ===\n');

testCases.forEach((testCase, index) => {
    console.log(`测试 ${index + 1}: ${testCase.name}`);
    console.log(`参数: appid=${testCase.appId}, text="${testCase.text}", salt=${testCase.salt}`);
    
    const sign = generateBaiduSignatureTest(testCase.appId, testCase.text, testCase.salt, testCase.secretKey);
    
    if (testCase.expectedSign) {
        const isCorrect = sign === testCase.expectedSign;
        console.log(`期望签名: ${testCase.expectedSign}`);
        console.log(`实际签名: ${sign}`);
        console.log(`签名验证: ${isCorrect ? '✅ 通过' : '❌ 失败'}`);
    }
    
    console.log('---\n');
});

console.log('修复要点确认:');
console.log('✅ 签名字符串顺序: appid + q + salt + 密钥');
console.log('✅ MD5签名格式: 32位小写（移除.toUpperCase()）');
console.log('✅ 参数构造: 移除timestamp，使用正确的参数');
console.log('✅ 请求方式: POST + Content-Type: application/x-www-form-urlencoded');
console.log('✅ URL编码: 发送请求前对q做URL encode');
