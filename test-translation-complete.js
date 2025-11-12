#!/usr/bin/env deno run --allow-net --allow-env

/**
 * 翻译功能完整测试脚本
 * 测试翻译API是否正常工作，包括环境变量检查和翻译功能测试
 */

// 检查环境变量状态
function checkEnvironment() {
    console.log('🔍 检查环境变量状态...');
    
    const appId = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
    const secretKey = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
    
    console.log(`BAIDU_TRANSLATE_APP_ID: ${appId ? '✅ 已设置' : '❌ 未设置'}`);
    console.log(`BAIDU_TRANSLATE_SECRET_KEY: ${secretKey ? '✅ 已设置' : '❌ 未设置'}`);
    
    return !!(appId && secretKey);
}

// 模拟MD5哈希函数
async function md5Hash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成百度翻译API签名
async function generateBaiduSignature(appId, secretKey, salt, timestamp) {
    const signString = `${appId}${secretKey}${salt}${timestamp}`;
    return await md5Hash(signString);
}

// 测试百度翻译API
async function testBaiduTranslation(text) {
    console.log(`\n🔄 测试翻译功能...`);
    console.log(`原文: "${text}"`);
    
    const appId = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
    const secretKey = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
    
    // 准备请求参数
    const salt = Math.random().toString(36).substring(2, 15);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // 生成签名
    const sign = await generateBaiduSignature(appId, secretKey, salt, timestamp);
    
    // 构建请求参数
    const params = new URLSearchParams({
        q: text,
        from: 'zh',
        to: 'en',
        appid: appId,
        salt: salt,
        timestamp: timestamp,
        sign: sign
    });
    
    console.log(`请求参数: ${params.toString()}`);
    
    try {
        // 发送请求到百度翻译API
        const response = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate?' + params.toString(), {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TranslationTest/1.0)'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API错误: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API响应:', JSON.stringify(data, null, 2));

        // 检查返回结果格式
        if (data.error_code) {
            throw new Error(`百度翻译API错误: ${data.error_code} - ${data.error_msg}`);
        }
        
        if (!data.trans_result || !data.trans_result.length) {
            throw new Error('翻译失败：未返回翻译结果');
        }

        const translatedText = data.trans_result[0].dst;
        console.log(`✅ 翻译结果: "${translatedText}"`);
        return translatedText;
        
    } catch (error) {
        console.error('❌ 翻译测试失败:', error.message);
        throw error;
    }
}

// 测试本地API端点
async function testLocalAPI(text) {
    console.log(`\n🔄 测试本地API端点...`);
    console.log(`测试文本: "${text}"`);
    
    try {
        const response = await fetch('http://localhost:8000/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                from: 'zh',
                to: 'en'
            })
        });
        
        const data = await response.json();
        console.log('本地API响应:', JSON.stringify(data, null, 2));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.error || '未知错误'}`);
        }
        
        if (data.trans_result && data.trans_result[0]) {
            console.log(`✅ 本地API翻译结果: "${data.trans_result[0].dst}"`);
            return data.trans_result[0].dst;
        } else {
            throw new Error('API返回格式不正确');
        }
        
    } catch (error) {
        console.error('❌ 本地API测试失败:', error.message);
        return null;
    }
}

// 主测试流程
async function runTests() {
    console.log('🚀 开始翻译功能测试...\n');
    
    // 检查环境变量
    const envReady = checkEnvironment();
    
    if (!envReady) {
        console.log('\n❌ 环境变量未设置，无法继续测试');
        console.log('请设置以下环境变量:');
        console.log('export BAIDU_TRANSLATE_APP_ID="您的APP_ID"');
        console.log('export BAIDU_TRANSLATE_SECRET_KEY="您的Secret_Key"');
        return;
    }
    
    // 测试用例
    const testCases = [
        '一只可爱的小猫',
        '美丽的夕阳风景',
        'AI图像生成技术'
    ];
    
    for (const text of testCases) {
        try {
            await testBaiduTranslation(text);
            console.log('\n' + '='.repeat(50));
        } catch (error) {
            console.error('测试失败:', error.message);
            console.log('\n' + '='.repeat(50));
        }
    }
    
    // 测试本地API（如果服务器在运行）
    console.log('\n🔍 尝试测试本地API...');
    const localResult = await testLocalAPI('测试翻译功能');
    
    if (localResult) {
        console.log('✅ 本地API工作正常');
    } else {
        console.log('⚠️  本地API无法访问（请确保服务器在 http://localhost:8000 运行）');
    }
    
    console.log('\n🎉 测试完成！');
}

// 运行测试
if (import.meta.main) {
    await runTests();
}