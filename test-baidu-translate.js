// =======================================================
// 百度翻译API测试脚本
// =======================================================

// 辅助函数：MD5哈希 (复制自main.ts)
async function md5Hash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成百度翻译API签名 (复制自main.ts)
async function generateBaiduSignature(appId, secretKey, salt, timestamp) {
    const signString = `${appId}${secretKey}${salt}${timestamp}`;
    return await md5Hash(signString);
}

// 测试百度翻译API (复制自main.ts)
async function callBaiduTranslate(text, appId, secretKey) {
    console.log(`百度翻译请求: "${text}"`);
    
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
    
    console.log('百度翻译请求参数:', params.toString());
    
    // 发送请求到百度翻译API
    const response = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate?' + params.toString(), {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('百度翻译API错误详情:', errorText);
        throw new Error(`百度翻译API错误: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('百度翻译API响应:', JSON.stringify(data, null, 2));

    // 检查返回结果格式
    if (data.error_code) {
        throw new Error(`百度翻译API错误: ${data.error_code} - ${data.error_msg}`);
    }
    
    if (!data.trans_result || !data.trans_result.length) {
        throw new Error('翻译失败：未返回翻译结果');
    }

    // 返回格式化的结果，保持兼容原有API响应格式
    return {
        trans_result: [
            {
                src: data.trans_result[0].src,
                dst: data.trans_result[0].dst
            }
        ]
    };
}

// 主测试函数
async function testBaiduTranslate() {
    console.log('🔍 开始百度翻译API测试...\n');
    
    // 检查环境变量
    const appId = Deno.env.get('BAIDU_TRANSLATE_APP_ID');
    const secretKey = Deno.env.get('BAIDU_TRANSLATE_SECRET_KEY');
    
    console.log('📋 配置检查:');
    if (!appId) {
        console.error('❌ 错误: BAIDU_TRANSLATE_APP_ID 环境变量未设置');
        console.log('💡 解决: 请设置环境变量: export BAIDU_TRANSLATE_APP_ID="your_app_id"');
        return false;
    } else {
        console.log(`✅ APP ID: ${appId.substring(0, 10)}...`);
    }
    
    if (!secretKey) {
        console.error('❌ 错误: BAIDU_TRANSLATE_SECRET_KEY 环境变量未设置');
        console.log('💡 解决: 请设置环境变量: export BAIDU_TRANSLATE_SECRET_KEY="your_secret_key"');
        return false;
    } else {
        console.log(`✅ Secret Key: ${secretKey.substring(0, 10)}...`);
    }
    
    console.log('\n🧪 开始翻译测试...\n');
    
    // 测试用例
    const testCases = [
        {
            original: '一只可爱的小猫在花园里玩耍',
            description: '基础描述'
        },
        {
            original: '印象派风格的日出风景画，色彩鲜艳，笔触流畅',
            description: '艺术风格描述'
        },
        {
            original: '科技感的未来城市夜景，霓虹灯闪烁',
            description: '复杂场景'
        },
        {
            original: 'Hello World',
            description: '英文测试（应该返回原文本或提示）'
        }
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`🔸 测试 ${i + 1}/${testCases.length}: ${testCase.description}`);
        console.log(`   原文: "${testCase.original}"`);
        
        try {
            const result = await callBaiduTranslate(testCase.original, appId, secretKey);
            const translated = result.trans_result[0].dst;
            console.log(`   译文: "${translated}"`);
            console.log(`   ✅ 翻译成功`);
            successCount++;
        } catch (error) {
            console.error(`   ❌ 翻译失败: ${error.message}`);
            failCount++;
        }
        
        console.log(''); // 空行分隔
    }
    
    // 测试结果汇总
    console.log('📊 测试结果汇总:');
    console.log(`✅ 成功: ${successCount}/${testCases.length}`);
    console.log(`❌ 失败: ${failCount}/${testCases.length}`);
    
    if (successCount === testCases.length) {
        console.log('🎉 所有测试通过！百度翻译API配置正确，可以开始使用。');
        return true;
    } else {
        console.log('⚠️  部分测试失败，请检查API配置或网络连接。');
        return false;
    }
}

// 运行测试
if (import.meta.main) {
    testBaiduTranslate().then(success => {
        if (!success) {
            Deno.exit(1);
        }
    }).catch(error => {
        console.error('测试过程中发生错误:', error);
        Deno.exit(1);
    });
}

export { testBaiduTranslate, callBaiduTranslate };