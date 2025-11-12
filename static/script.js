// --- 初始化函数 ---
function initialize() {
    setupTheme();
    loadStateForCurrentModel();
    setupInputValidation();
    setUniformButtonWidth();
    updateHighlightPosition();
    setupModalListeners();
    setupFileUploads();
    setupTranslationFeatures(); // 新增：初始化翻译功能
    
    fetch('/api/key-status').then(res => res.json()).then(data => {
        if (data.isSet) { apiKeyOpenRouterInput.parentElement.style.display = 'none'; }
    }).catch(error => console.error("无法检查 OpenRouter API key 状态:", error));

    fetch('/api/openai-key-status').then(res => res.json()).then(data => {
        if (data.isSet) { apiKeyOpenAIInput.parentElement.style.display = 'none'; }
    }).catch(error => console.error("无法检查 OpenAI API key 状态:", error));

    fetch('/api/modelscope-key-status').then(res => res.json()).then(data => {
        if (data.isSet) { apiKeyModelScopeInput.parentElement.style.display = 'none'; }
    }).catch(error => console.error("无法检查 ModelScope API key 状态:", error));
}

// --- 新增：翻译功能相关 ---
function setupTranslationFeatures() {
    // 1. 绑定翻译按钮点击事件
    document.querySelectorAll('.translate-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-target');
            const textarea = document.getElementById(targetId);
            if (textarea) {
                await translateTextareaContent(textarea);
            }
        });
    });

    // 2. 绑定输入框的三个空格触发翻译
    const promptTextareas = [
        'prompt-input-chatgpt',
        'prompt-input-nanobanana',
        'prompt-input-positive',
        'prompt-input-negative'
    ];
    
    promptTextareas.forEach(id => {
        const textarea = document.getElementById(id);
        if (textarea) {
            let spaceCount = 0; // 记录连续空格数
            textarea.addEventListener('input', async (e) => {
                const input = e.target;
                const lastChar = input.value.slice(-1); // 获取最后一个字符
                
                if (lastChar === ' ') {
                    spaceCount++;
                    // 连续输入3个空格时触发翻译
                    if (spaceCount >= 3) {
                        // 移除最后3个空格
                        input.value = input.value.slice(0, -3);
                        await translateTextareaContent(input);
                        spaceCount = 0; // 重置计数
                    }
                } else {
                    spaceCount = 0; // 非空格则重置计数
                }
            });
        }
    });
}

// 翻译文本框内容
async function translateTextareaContent(textarea) {
    const originalText = textarea.value.trim();
    if (!originalText) {
        alert('请先输入需要翻译的内容');
        return;
    }

    try {
        // 显示加载状态
        textarea.disabled = true;
        textarea.placeholder = '翻译中...';
        
        // 调用后端翻译接口
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: originalText })
        });
        
        const result = await response.json();
        
        if (result.error) {
            alert(`翻译失败: ${result.error}`);
        } else {
            textarea.value = result.translated; // 替换为翻译后的内容
        }
    } catch (error) {
        console.error('翻译错误:', error);
        alert('网络错误，翻译失败，请稍后重试');
    } finally {
        // 恢复状态
        textarea.disabled = false;
        textarea.placeholder = textarea.dataset.originalPlaceholder || textarea.placeholder;
        textarea.focus();
    }
}

// --- 以下为原文件中已有的代码（保持不变） ---
// 为了保证文件完整性，这里省略原代码（实际使用时需保留原文件中除上述新增内容外的所有代码）
// 注意：实际替换时，只需在原 script.js 中添加上述翻译相关函数，并在 initialize() 中调用 setupTranslationFeatures()

// 主题设置
function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle-btn');
    const html = document.documentElement;
    
    // 检查本地存储的主题偏好
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    
    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
}

// 其他原有函数（此处省略，实际使用时保留原文件中的所有函数）

// 初始化页面
document.addEventListener('DOMContentLoaded', initialize);
