// =======================================================
// 环境变量检查脚本
// =======================================================

console.log('🔍 检查环境变量配置...\n');

// 检查各种ModelScope相关环境变量
const modelScopeVars = [
    'MODELSCOPE_API_KEY',
    'MODELSCOPE_SDK_TOKEN',
    'MODELSCOPE_KEY'
];

let hasAnyModelScopeKey = false;

console.log('📋 ModelScope相关环境变量:');
modelScopeVars.forEach(varName => {
    const value = Deno.env.get(varName);
    if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 15)}...`);
        hasAnyModelScopeKey = true;
    } else {
        console.log(`❌ ${varName}: 未设置`);
    }
});

// 检查百度翻译环境变量
console.log('\n📋 百度翻译环境变量:');
const baiduVars = [
    'BAIDU_TRANSLATE_APP_ID',
    'BAIDU_TRANSLATE_SECRET_KEY'
];

let hasBaiduConfig = true;
baiduVars.forEach(varName => {
    const value = Deno.env.get(varName);
    if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 15)}...`);
    } else {
        console.log(`❌ ${varName}: 未设置`);
        hasBaiduConfig = false;
    }
});

// 检查其他API密钥
console.log('\n📋 其他API密钥:');
const otherVars = [
    'OPENROUTER_API_KEY',
    'OPENAI_API_KEY'
];

otherVars.forEach(varName => {
    const value = Deno.env.get(varName);
    if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 15)}...`);
    } else {
        console.log(`❌ ${varName}: 未设置`);
    }
});

console.log('\n📊 配置总结:');
console.log(`ModelScope密钥: ${hasAnyModelScopeKey ? '✅ 已配置' : '❌ 未配置'}`);
console.log(`百度翻译: ${hasBaiduConfig ? '✅ 已配置' : '❌ 未配置'}`);

if (!hasAnyModelScopeKey) {
    console.log('\n💡 ModelScope配置建议:');
    console.log('您可以设置以下任一环境变量:');
    console.log('1. export MODELSCOPE_API_KEY="your_api_key"');
    console.log('2. export MODELSCOPE_SDK_TOKEN="your_token"');
}

if (!hasBaiduConfig) {
    console.log('\n💡 百度翻译配置建议:');
    console.log('1. 访问 https://fanyi-api.baidu.com/');
    console.log('2. 获取APP_ID和Secret Key');
    console.log('3. 设置环境变量:');
    console.log('   export BAIDU_TRANSLATE_APP_ID="your_app_id"');
    console.log('   export BAIDU_TRANSLATE_SECRET_KEY="your_secret_key"');
}

console.log('\n✅ 环境变量检查完成');