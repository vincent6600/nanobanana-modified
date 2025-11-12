document.addEventListener('DOMContentLoaded', async () => {
    // 获取页面元素
    const nanobananaControls = document.getElementById('nanobanana-controls');
    const chatgptControls = document.getElementById('chatgpt-controls');
    const modelscopeControls = document.getElementById('modelscope-controls');
    
    const nanobananaPromptInput = document.getElementById('prompt-input-nanobanana');
    const chatgptPromptInput = document.getElementById('prompt-input-chatgpt');
    const positivePromptInput = document.getElementById('prompt-input-positive');
    const negativePromptInput = document.getElementById('prompt-input-negative');
    
    // 翻译按钮和输入框的映射
    const translateButtonMappings = {
        'translate-chatgpt-prompt': chatgptPromptInput,
        'translate-nanobanana-prompt': nanobananaPromptInput,
        'translate-modelscope-positive': positivePromptInput,
        'translate-modelscope-negative': negativePromptInput
    };
    
    // 初始化翻译功能
    initializeTranslation();
    
    // 初始化翻译功能
    function initializeTranslation() {
        setupTranslateButtons();
        setupSpacebarTranslate();
    }
    
    // 设置翻译按钮事件监听
    function setupTranslateButtons() {
        Object.entries(translateButtonMappings).forEach(([buttonId, textarea]) => {
            const button = document.getElementById(buttonId);
            if (button && textarea) {
                button.addEventListener('click', async () => {
                    const text = textarea.value.trim();
                    if (!text) {
                        showTranslateMessage('请先输入要翻译的内容', 'error');
                        return;
                    }
                    
                    // 设置按钮为加载状态
                    button.classList.add('translating');
                    button.textContent = '翻译中...';
                    button.disabled = true;
                    
                    try {
                        const response = await fetch('/api/translate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ text })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok && !data.error) {
                            // 替换文本内容
                            textarea.value = data.translatedText;
                            showTranslateMessage('翻译完成', 'success');
                        } else {
                            throw new Error(data.error || '翻译失败');
                        }
                    } catch (error) {
                        console.error('翻译错误:', error);
                        showTranslateMessage(`翻译失败: ${error.message}`, 'error');
                    } finally {
                        // 恢复按钮状态
                        button.classList.remove('translating');
                        button.textContent = '翻译';
                        button.disabled = false;
                    }
                });
            }
        });
    }
    
    // 设置空格键快捷翻译
    function setupSpacebarTranslate() {
        const textareas = Object.values(translateButtonMappings).filter(textarea => textarea);
        const spaceTracker = {};
        
        textareas.forEach(textarea => {
            spaceTracker[textarea.id] = { count: 0, lastSpaceTime: 0 };
            
            textarea.addEventListener('keydown', (e) => {
                if (e.key === ' ') {
                    const now = Date.now();
                    const tracker = spaceTracker[textarea.id];
                    
                    // 检查是否连续输入空格
                    if (now - tracker.lastSpaceTime < 500) {
                        tracker.count++;
                    } else {
                        tracker.count = 1;
                    }
                    
                    tracker.lastSpaceTime = now;
                    
                    // 如果连续输入三个空格，触发翻译
                    if (tracker.count >= 3) {
                        e.preventDefault();
                        
                        // 删除最后三个空格
                        const currentValue = textarea.value;
                        textarea.value = currentValue.slice(0, -3);
                        
                        // 触发翻译
                        const buttonId = Object.keys(translateButtonMappings).find(id => 
                            translateButtonMappings[id] === textarea
                        );
                        
                        if (buttonId) {
                            const button = document.getElementById(buttonId);
                            if (button) {
                                // 模拟点击按钮
                                button.click();
                            }
                        }
                        
                        // 重置计数器
                        tracker.count = 0;
                    }
                } else if (e.key.length === 1 || e.key === 'Backspace') {
                    // 输入其他字符时重置计数器
                    spaceTracker[textarea.id].count = 0;
                }
            });
        });
    }
    
    // 显示翻译消息
    function showTranslateMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `translate-message ${type}`;
        messageEl.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 显示动画
        requestAnimationFrame(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        });
        
        // 3秒后自动移除
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
    
    // 简单的模型切换逻辑（如果需要的话）
    function switchModel(modelName) {
        // 隐藏所有控制面板
        nanobananaControls.classList.add('hidden');
        chatgptControls.classList.add('hidden');
        modelscopeControls.classList.add('hidden');
        
        // 显示对应的控制面板
        switch(modelName) {
            case 'nanobanana':
                nanobananaControls.classList.remove('hidden');
                break;
            case 'chatgpt':
                chatgptControls.classList.remove('hidden');
                break;
            case 'modelscope':
                modelscopeControls.classList.remove('hidden');
                break;
        }
    }
    
    // 示例：添加模型切换按钮（如果需要）
    if (document.querySelector('.model-switcher')) {
        document.querySelectorAll('.model-switcher button').forEach(btn => {
            btn.addEventListener('click', () => {
                switchModel(btn.dataset.model);
            });
        });
    }
    
    // 生成按钮点击事件（需要根据实际API调整）
    document.querySelectorAll('.generate-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            // 这里添加实际的生成逻辑
            console.log('生成按钮被点击');
            
            // 简单的示例反馈
            btn.textContent = '生成中...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.textContent = '生成';
                btn.disabled = false;
            }, 2000);
        });
    });
});