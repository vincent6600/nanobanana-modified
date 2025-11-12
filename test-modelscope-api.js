// 直接测试ModelScope翻译API
async function testModelScopeAPI() {
    try {
        const https = require('https');
        const fs = require('fs');
        
        // 从环境变量或文件中读取SDK Token（注意：使用的是SDK_TOKEN，不是API_KEY）
        let apiKey = process.env.MODELSCOPE_SDK_TOKEN;
        
        if (!apiKey) {
            console.log("请设置MODELSCOPE_SDK_TOKEN环境变量");
            process.exit(1);
        }
        
        console.log('开始测试ModelScope翻译API...');
        console.log('API密钥已配置:', apiKey ? '✓' : '✗');
        
        // 测试数据
        const testTexts = [
            "你好世界",
            "人工智能技术发展迅速",
            "这是一个测试翻译功能",
            "ChatGPT图像生成器界面美观"
        ];
        
        for (const text of testTexts) {
            try {
                console.log(`\n正在翻译: "${text}"`);
                
                const postData = JSON.stringify({
                    inputs: text
                });
                
                const options = {
                    hostname: 'api-inference.modelscope.cn',
                    port: 443,
                    path: '/api-inference/v1/models/iic/nlp_imt_translation_zh2en',
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };
                
                await new Promise((resolve, reject) => {
                    const req = https.request(options, (res) => {
                        let data = '';
                        
                        res.on('data', (chunk) => {
                            data += chunk;
                        });
                        
                        res.on('end', () => {
                            try {
                                const responseData = JSON.parse(data);
                                console.log(`原文: ${text}`);
                                console.log(`译文: ${responseData.outputs || responseData.result || data}`);
                                console.log('---');
                                resolve();
                            } catch (error) {
                                console.error('解析响应失败:', data);
                                reject(error);
                            }
                        });
                    });
                    
                    req.on('error', (error) => {
                        console.error('请求失败:', error.message);
                        reject(error);
                    });
                    
                    req.write(postData);
                    req.end();
                });
                
                // 避免API频率限制
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`翻译失败 "${text}":`, error.message);
            }
        }
        
        console.log('\nModelScope翻译API测试完成！');
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
if (require.main === module) {
    testModelScopeAPI();
}