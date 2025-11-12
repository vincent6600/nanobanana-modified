// 翻译功能测试脚本
// 用于测试前端翻译功能是否正常工作

// 测试用例：模拟用户操作
const testCases = [
    {
        name: "测试按钮翻译",
        input: "一只可爱的猫咪",
        trigger: "button",
        expected: "A cute cat"
    },
    {
        name: "测试三空格自动翻译", 
        input: "一只可爱的猫咪   ",
        trigger: "triple-space",
        expected: "A cute cat"
    },
    {
        name: "测试空文本",
        input: "",
        trigger: "button",
        expected: "warning"
    },
    {
        name: "测试英文输入",
        input: "A beautiful landscape",
        trigger: "button", 
        expected: "unchanged"
    }
];

// 前端测试脚本（可运行在浏览器控制台）
console.log("=== 翻译功能测试用例 ===");

testCases.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log(`   输入: "${test.input}"`);
    console.log(`   触发: ${test.trigger}`);
    console.log(`   期望: ${test.expected}`);
});

// 如果在浏览器环境中，可以执行以下测试代码：
/*
// 模拟点击翻译按钮测试
function simulateButtonClick(targetId) {
    const button = document.querySelector(`[data-target="${targetId}"]`);
    if (button) {
        console.log(`模拟点击按钮: ${targetId}`);
        button.click();
    } else {
        console.error(`未找到翻译按钮: ${targetId}`);
    }
}

// 模拟三空格输入测试  
function simulateTripleSpaceInput(targetId, text) {
    const textarea = document.getElementById(targetId);
    if (textarea) {
        console.log(`模拟输入三空格: ${text}`);
        textarea.value = text;
        textarea.dispatchEvent(new Event('input'));
    } else {
        console.error(`未找到输入框: ${targetId}`);
    }
}

// 测试所有提示词框
const targetIds = [
    'prompt-input-chatgpt',
    'prompt-input-nanobanana', 
    'prompt-input-positive',
    'prompt-input-negative'
];

console.log("\n=== 开始前端测试 ===");

// 测试按钮翻译
targetIds.forEach(id => {
    const textarea = document.getElementById(id);
    if (textarea) {
        textarea.value = "一只可爱的猫咪";
        simulateButtonClick(id);
    }
});

// 测试三空格翻译  
targetIds.forEach(id => {
    const textarea = document.getElementById(id);
    if (textarea) {
        textarea.value = "一只可爱的猫咪   ";
        simulateTripleSpaceInput(id, "一只可爱的猫咪   ");
    }
});
*/

// 后端API测试脚本
console.log("\n=== 后端API测试 ===");

// 测试百度翻译API调用
async function testBaiduTranslateAPI() {
    const testText = "一只可爱的猫咪";
    
    try {
        console.log(`测试翻译: "${testText}"`);
        
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: testText,
                from: 'zh',
                to: 'en'
            })
        });
        
        if (!response.ok) {
            console.error(`API调用失败: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`错误详情: ${errorText}`);
            return;
        }
        
        const result = await response.json();
        console.log("翻译结果:", result);
        
        if (result.trans_result && result.trans_result[0]) {
            console.log(`翻译成功: "${result.trans_result[0].dst}"`);
        } else {
            console.warn("未返回翻译结果");
        }
        
    } catch (error) {
        console.error("API测试失败:", error);
    }
}

// 如果在Node.js环境中运行
if (typeof global !== 'undefined') {
    console.log("可在浏览器控制台中运行前端测试");
    console.log("或在Node.js环境中运行后端API测试");
}

// 导出测试函数（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testCases,
        testBaiduTranslateAPI
    };
}