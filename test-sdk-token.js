// 测试ModelScope SDK Token状态
console.log('=== ModelScope SDK Token 测试 ===');

// 检查环境变量
const sdkToken = process.env.MODELSCOPE_SDK_TOKEN;
const apiKey = process.env.MODELSCOPE_API_KEY;

console.log('MODELSCOPE_SDK_TOKEN:', sdkToken ? '已设置 ✓' : '未设置 ✗');
console.log('MODELSCOPE_API_KEY:', apiKey ? '已设置 ✓' : '未设置 ✗');

if (!sdkToken && !apiKey) {
    console.log('\n❌ 未找到任何ModelScope认证令牌');
    console.log('\n=== 如何获取ModelScope SDK Token ===');
    console.log('1. 访问 https://modelscope.cn/my/myaccesstoken');
    console.log('2. 登录您的ModelScope账户');
    console.log('3. 生成新的SDK Token');
    console.log('4. 将SDK Token设置为环境变量: MODELSCOPE_SDK_TOKEN');
    console.log('\n注意：应该使用MODELSCOPE_SDK_TOKEN，而不是MODELSCOPE_API_KEY');
} else if (sdkToken) {
    console.log('\n✅ MODELSCOPE_SDK_TOKEN已正确配置');
    console.log('Token前缀:', sdkToken.substring(0, 20) + '...');
} else {
    console.log('\n⚠️  检测到MODELSCOPE_API_KEY，但应该使用MODELSCOPE_SDK_TOKEN');
}