// ModelScope翻译功能测试脚本
// 这个脚本用于测试翻译API是否正常工作

const https = require('https');

async function testModelScopeTranslation() {
    try {
        console.log('🔄 开始测试ModelScope翻译功能...');
        
        // 从环境变量获取API密钥
        const apiKey = process.env.MODELSCOPE_API_KEY;
        if (!apiKey) {
            console.error('❌ 未找到MODELSCOPE_API_KEY环境变量');
            console.log('请设置环境变量：export MODELSCOPE_API_KEY=your_api_key');
            process.exit(1);
        }
        console.log('✅ API密钥已配置');
        
        // 测试用例
        const testCases = [
            {
                input: "你好世界",
                description: "基础问候"
            },
            {
                input: "人工智能技术发展迅速，未来前景广阔",
                description: "科技描述"
            },
            {
                input: "这是一个测试翻译功能的中文文本",
                description: "功能测试"
            },
            {
                input: "ChatGPT图像生成器界面美观，操作简单",
                description: "应用描述"
            },
            {
                input: "一个穿着红色连衣裙的年轻女性在花园里散步，阳光明媚，鲜花盛开",
                description: "图像生成提示词"
            }
        ];
        
        console.log('\n📝 测试用例列表:');
        testCases.forEach((testCase, index) => {
            console.log(`${index + 1}. ${testCase.description}: "${testCase.input}"`);
        });
        
        console.log('\n🚀 开始翻译测试...');
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`\n--- 测试 ${i + 1}/${testCases.length} ---`);
            console.log(`描述: ${testCase.description}`);
            console.log(`原文: "${testCase.input}"`);
            
            try {
                const translatedText = await translateText(testCase.input, apiKey);
                console.log(`译文: "${translatedText}"`);
                console.log('✅ 翻译成功');
            } catch (error) {
                console.error('❌ 翻译失败:', error.message);
            }
            
            // 避免API频率限制
            if (i < testCases.length - 1) {
                console.log('⏳ 等待1秒...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log('\n🎉 ModelScope翻译功能测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

function translateText(text, apiKey) {
    return new Promise((resolve, reject) => {
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
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    
                    // 检查API响应格式
                    if (!responseData || !responseData.outputs) {
                        reject(new Error('翻译API未返回有效结果'));
                        return;
                    }
                    
                    resolve(responseData.outputs);
                } catch (error) {
                    reject(new Error('翻译API响应格式错误: ' + data));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(new Error('网络请求失败: ' + error.message));
        });
        
        req.write(postData);
        req.end();
    });
}

// 运行测试
if (require.main === module) {
    testModelScopeTranslation();
}

module.exports = { testModelScopeTranslation, translateText };