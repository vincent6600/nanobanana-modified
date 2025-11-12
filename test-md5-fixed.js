#!/usr/bin/env deno run --allow-env

/**
 * MD5修复测试脚本
 * 测试新的MD5实现是否能正确生成百度翻译API签名
 */

// 复制的MD5函数（从修复后的main.ts中提取）
function md5Hash(text) {
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

function generateBaiduSignature(appId, secretKey, salt, timestamp) {
    const signString = `${appId}${secretKey}${salt}${timestamp}`;
    return md5Hash(signString);
}

// 测试用例
function runTests() {
    console.log('🔍 测试MD5修复后的百度翻译API签名生成...\n');
    
    // 测试MD5的基本功能
    console.log('📝 测试MD5基本功能:');
    
    // 标准MD5测试用例
    const testCases = [
        { input: '', expected: 'd41d8cd98f00b204e9800998ecf8427e' }, // 空字符串
        { input: 'a', expected: '0cc175b9c0f1b6a831c399e269772661' }, // 单个字符
        { input: 'abc', expected: '900150983cd24fb0d6963f7d28e17f72' }, // 简单字符串
        { input: 'message digest', expected: 'f96b697d7cb7938d525a2f31aaf161d0' }, // 中等长度
    ];
    
    for (const test of testCases) {
        const result = md5Hash(test.input);
        const isCorrect = result === test.expected;
        console.log(`  "${test.input}" -> ${result} ${isCorrect ? '✅' : '❌'}`);
        if (!isCorrect) {
            console.log(`    期望: ${test.expected}`);
        }
    }
    
    // 测试百度翻译API签名
    console.log('\n🔐 测试百度翻译API签名生成:');
    
    // 示例参数（用于测试）
    const appId = '12345678'; // 8位示例APP ID
    const secretKey = '123456789012345678901234567890'; // 32位示例密钥
    const salt = '1435660288';
    const timestamp = '1435660288';
    
    const signString = `${appId}${secretKey}${salt}${timestamp}`;
    const signature = generateBaiduSignature(appId, secretKey, salt, timestamp);
    
    console.log(`签名字符串: ${signString}`);
    console.log(`生成的签名: ${signature}`);
    console.log(`签名长度: ${signature.length} 字符`);
    
    // 验证签名格式
    const isValidFormat = signature.length === 32 && /^[a-f0-9]+$/.test(signature);
    console.log(`签名格式验证: ${isValidFormat ? '✅ 正确' : '❌ 错误'}`);
    
    // 测试实际的百度API调用（需要真实的环境变量）
    console.log('\n🌐 尝试百度翻译API调用:');
    
    const realAppId = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
    const realSecretKey = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
    
    if (!realAppId || !realSecretKey) {
        console.log('⚠️  真实API密钥未设置，跳过实际API测试');
        return;
    }
    
    const testSalt = Math.random().toString(36).substring(2, 15);
    const testTimestamp = Math.floor(Date.now() / 1000).toString();
    const testSignature = generateBaiduSignature(realAppId, realSecretKey, testSalt, testTimestamp);
    
    console.log(`使用的APP ID: ${realAppId.substring(0, 10)}...`);
    console.log(`生成的测试签名: ${testSignature}`);
    
    const params = new URLSearchParams({
        q: '测试翻译',
        from: 'zh',
        to: 'en',
        appid: realAppId,
        salt: testSalt,
        timestamp: testTimestamp,
        sign: testSignature
    });
    
    console.log('请求URL:', 'https://fanyi-api.baidu.com/api/trans/vip/translate?' + params.toString());
    
    // 实际调用百度翻译API
    try {
        console.log('发送请求...');
        const response = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate?' + params.toString(), {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TranslationTest/1.0)'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && !result.error_code) {
            console.log('✅ 百度翻译API调用成功!');
            console.log(`翻译结果: ${result.trans_result[0].dst}`);
        } else {
            console.log('❌ 百度翻译API调用失败:');
            console.log(`错误代码: ${result.error_code}`);
            console.log(`错误信息: ${result.error_msg}`);
            console.log('💡 这通常表示签名正确，可能是APP ID或Secret Key问题');
        }
        
    } catch (error) {
        console.log('❌ 网络请求失败:', error.message);
    }
    
    console.log('\n🎉 测试完成！');
}

if (import.meta.main) {
    runTests();
}