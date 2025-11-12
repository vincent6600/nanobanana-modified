#!/usr/bin/env deno run --allow-env

/**
 * 环境变量快速检查脚本
 * 检查百度翻译API所需的环境变量是否正确设置
 */

function checkBaiduTranslationEnv() {
    console.log('🔍 检查百度翻译API环境变量...\n');
    
    const appId = Deno.env.get("BAIDU_TRANSLATE_APP_ID");
    const secretKey = Deno.env.get("BAIDU_TRANSLATE_SECRET_KEY");
    
    console.log('📋 环境变量检查结果:');
    console.log(`BAIDU_TRANSLATE_APP_ID: ${appId ? '✅ 已设置 (' + appId.substring(0, 10) + '...)' : '❌ 未设置'}`);
    console.log(`BAIDU_TRANSLATE_SECRET_KEY: ${secretKey ? '✅ 已设置 (' + secretKey.substring(0, 10) + '...)' : '❌ 未设置'}`);
    
    if (appId && secretKey) {
        console.log('\n✅ 环境变量配置正确！');
        console.log('🚀 翻译功能应该可以正常工作了');
        
        // 验证长度
        if (appId.length < 8) {
            console.log('⚠️  警告: APP ID 似乎过短，请检查是否正确');
        }
        if (secretKey.length < 16) {
            console.log('⚠️  警告: Secret Key 似乎过短，请检查是否正确');
        }
        
        return true;
    } else {
        console.log('\n❌ 环境变量配置不完整！');
        console.log('\n📝 需要设置以下环境变量:');
        console.log('export BAIDU_TRANSLATE_APP_ID="您的百度翻译APP_ID"');
        console.log('export BAIDU_TRANSLATE_SECRET_KEY="您的百度翻译Secret_Key"');
        console.log('\n💡 获取方式:');
        console.log('1. 访问 https://fanyi-api.baidu.com/');
        console.log('2. 登录并创建应用');
        console.log('3. 复制APP_ID和Secret_Key');
        
        return false;
    }
}

if (import.meta.main) {
    checkBaiduTranslationEnv();
}