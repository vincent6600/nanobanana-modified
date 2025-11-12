#!/usr/bin/env deno run --allow-net --allow-env

/**
 * 修复后翻译功能测试
 * 测试修复后的服务器翻译功能是否正常
 */

async function testFixedTranslation() {
    console.log('🚀 测试修复后的翻译功能...\n');
    
    // 检查环境变量
    const appId = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
    const secretKey = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
    
    if (!appId || !secretKey) {
        console.log('❌ 环境变量未设置');
        console.log('需要设置:');
        console.log('BAIDU_TRANSLATE_APP_ID=' + (appId || '未设置'));
        console.log('BAIDU_TRANSLATE_SECRET_KEY=' + (secretKey ? '已设置' : '未设置'));
        return;
    }
    
    console.log('✅ 环境变量检查通过');
    console.log(`APP ID: ${appId.substring(0, 10)}...`);
    
    // 测试翻译API端点
    const testTexts = [
        '一只可爱的小猫',
        '美丽的夕阳风景',
        'AI图像生成技术'
    ];
    
    for (const text of testTexts) {
        console.log(`\n🔄 测试翻译: "${text}"`);
        
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
            
            if (response.ok && data.trans_result) {
                console.log(`✅ 翻译成功: "${data.trans_result[0].dst}"`);
            } else {
                console.log(`❌ 翻译失败:`);
                console.log(`   HTTP状态: ${response.status}`);
                console.log(`   错误信息: ${data.error || '未知错误'}`);
                
                if (data.error && data.error.includes('Unrecognized algorithm')) {
                    console.log(`   💡 MD5算法问题仍存在，需要进一步修复`);
                }
            }
            
        } catch (error) {
            console.log(`❌ 请求失败: ${error.message}`);
            console.log(`   💡 可能服务器未启动在 http://localhost:8000`);
        }
    }
    
    console.log('\n🎯 测试总结:');
    console.log('如果看到翻译成功的消息，说明修复生效！');
    console.log('如果仍有错误，请检查具体的错误信息。');
}

if (import.meta.main) {
    testFixedTranslation();
}