// 全局变量
let currentModel = 'chatgpt';
let uploadedImages = [];
let uploadedImagesChatGPT = [];

// DOM 元素
const modelCards = document.querySelectorAll('.model-card');
const chatgptControls = document.getElementById('chatgpt-controls');
const nanobananaControls = document.getElementById('nanobanana-controls');
const modelscopeControls = document.getElementById('modelscope-controls');
const apiKeyOpenRouterInput = document.getElementById('api-key-input-openrouter');
const apiKeyOpenAIInput = document.getElementById('api-key-input-openai');
const apiKeyModelScopeInput = document.getElementById('api-key-input-modelscope');
const promptNanoBananaInput = document.getElementById('prompt-input-nanobanana');
const promptChatGPTInput = document.getElementById('prompt-input-chatgpt');
const promptPositiveInput = document.getElementById('prompt-input-positive');
const promptNegativeInput = document.getElementById('prompt-input-negative');
const sizeSelect = document.getElementById('size-select');
const stepsInput = document.getElementById('steps-input');
const cfgInput = document.getElementById('cfg-input');
const seedInput = document.getElementById('seed-input');
const countInput = document.getElementById('count-input');
const generateBtns = document.querySelectorAll('.generate-btn');
const resultsGrid = document.getElementById('results-grid');
const statusMessage = document.getElementById('status-message');
const imageUpload = document.getElementById('image-upload');
const imageUploadChatGPT = document.getElementById('image-upload-chatgpt');
const thumbnailsContainer = document.getElementById('thumbnails-container');
const thumbnailsContainerChatGPT = document.getElementById('thumbnails-container-chatgpt');
const fullscreenModal = document.getElementById('fullscreen-modal');
const modalImage = document.getElementById('modal-image');
const closeBtn = document.querySelector('.close-btn');

// --- 初始化函数 ---
function initialize() {
    setupTheme();
    loadStateForCurrentModel();
    setupInputValidation();
    setUniformButtonWidth();
    updateHighlightPosition();
    setupModalListeners();
    setupFileUploads();
    setupTranslationFeatures(); // 关键：初始化翻译功能
    setupModelSelection();
    setupGenerateButtons();
    
    // 检查API Key状态
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

// --- 翻译功能（核心新增）---
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

    // 2. 绑定输入框连续3个空格触发翻译
    const promptTextareas = [
        'prompt-input-chatgpt',
        'prompt-input-nanobanana',
        'prompt-input-positive',
        'prompt-input-negative'
    ];
    
    promptTextareas.forEach(id => {
        const textarea = document.getElementById(id);
        if (textarea) {
            let spaceCount = 0;
            textarea.addEventListener('input', async (e) => {
                const input = e.target;
                const lastChar = input.value.slice(-1);
                
                if (lastChar === ' ') {
                    spaceCount++;
                    if (spaceCount >= 3) {
                        input.value = input.value.slice(0, -3); // 移除最后3个空格
                        await translateTextareaContent(input);
                        spaceCount = 0;
                    }
                } else {
                    spaceCount = 0;
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
        textarea.disabled = true;
        textarea.placeholder = '翻译中...';
        
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: originalText })
        });
        
        const result = await response.json();
        
        if (result.error) {
            alert(`翻译失败: ${result.error}`);
        } else {
            textarea.value = result.translated;
        }
    } catch (error) {
        console.error('翻译错误:', error);
        alert('网络错误，翻译失败，请稍后重试');
    } finally {
        textarea.disabled = false;
        // 恢复原始占位符（如果有）
        if (textarea.id === 'prompt-input-chatgpt') {
            textarea.placeholder = '例如：一只穿着超级英雄斗篷的猫，电影级灯光';
        } else if (textarea.id === 'prompt-input-nanobanana') {
            textarea.placeholder = '例如：一只穿着超级英雄斗篷的猫，电影级灯光';
        } else if (textarea.id === 'prompt-input-positive') {
            textarea.placeholder = '例如：A golden cat, masterpiece, best quality';
        } else if (textarea.id === 'prompt-input-negative') {
            textarea.placeholder = '例如：worst quality, low quality, normal quality';
        }
        textarea.focus();
    }
}

// --- 原有功能（保持不变，确保页面正常工作）---
// 主题设置
function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle-btn');
    const html = document.documentElement;
    
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

// 模型选择
function setupModelSelection() {
    modelCards.forEach(card => {
        card.addEventListener('click', () => {
            // 更新当前模型
            currentModel = card.dataset.model;
            
            // 更新卡片激活状态
            modelCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // 显示对应的控制面板
            chatgptControls.classList.add('hidden');
            nanobananaControls.classList.add('hidden');
            modelscopeControls.classList.add('hidden');
            
            if (currentModel === 'chatgpt') {
                chatgptControls.classList.remove('hidden');
            } else if (currentModel === 'nanobanana') {
                nanobananaControls.classList.remove('hidden');
            } else {
                modelscopeControls.classList.remove('hidden');
            }
            
            // 加载当前模型的状态
            loadStateForCurrentModel();
            updateHighlightPosition();
            setUniformButtonWidth();
        });
    });
    
    // 初始化显示当前模型的控制面板
    if (currentModel === 'chatgpt') {
        chatgptControls.classList.remove('hidden');
    } else if (currentModel === 'nanobanana') {
        nanobananaControls.classList.remove('hidden');
    } else {
        modelscopeControls.classList.remove('hidden');
    }
}

// 文件上传
function setupFileUploads() {
    // 普通模型文件上传
    imageUpload.addEventListener('change', handleFileUpload);
    
    // ChatGPT模型文件上传
    imageUploadChatGPT.addEventListener('change', (e) => handleFileUpload(e, true));
    
    // 支持粘贴上传
    document.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (currentModel === 'chatgpt') {
                    handleImageFile(file, true);
                } else {
                    handleImageFile(file);
                }
            }
        }
    });
}

function handleFileUpload(e, isChatGPT = false) {
    const files = e.target.files;
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            handleImageFile(file, isChatGPT);
        }
    }
    // 重置文件输入，允许重复上传同一文件
    e.target.value = '';
}

function handleImageFile(file, isChatGPT = false) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageUrl = e.target.result;
        if (isChatGPT) {
            uploadedImagesChatGPT.push(imageUrl);
            addThumbnail(imageUrl, thumbnailsContainerChatGPT, isChatGPT);
        } else {
            uploadedImages.push(imageUrl);
            addThumbnail(imageUrl, thumbnailsContainer);
        }
    };
    reader.readAsDataURL(file);
}

function addThumbnail(imageUrl, container, isChatGPT = false) {
    const div = document.createElement('div');
    div.className = 'thumbnail-container';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'thumbnail';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'thumbnail-remove';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
        div.remove();
        if (isChatGPT) {
            uploadedImagesChatGPT = uploadedImagesChatGPT.filter(url => url !== imageUrl);
        } else {
            uploadedImages = uploadedImages.filter(url => url !== imageUrl);
        }
    });
    
    div.appendChild(img);
    div.appendChild(removeBtn);
    container.appendChild(div);
}

// 模态框
function setupModalListeners() {
    closeBtn.addEventListener('click', () => {
        fullscreenModal.classList.add('hidden');
    });
    
    fullscreenModal.addEventListener('click', (e) => {
        if (e.target === fullscreenModal) {
            fullscreenModal.classList.add('hidden');
        }
    });
}

// 生成按钮
function setupGenerateButtons() {
    generateBtns.forEach(btn => {
        btn.addEventListener('click', generateImage);
    });
}

async function generateImage() {
    // 清空之前的状态
    resultsGrid.innerHTML = '';
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
    
    // 禁用所有生成按钮并显示加载状态
    generateBtns.forEach(btn => {
        btn.disabled = true;
        btn.querySelector('.btn-text').classList.add('hidden');
        btn.querySelector('.spinner').classList.remove('hidden');
    });
    
    try {
        let apiKey, prompt, images, parameters;
        
        if (currentModel === 'nanobanana') {
            apiKey = apiKeyOpenRouterInput.value || Deno.env.get("OPENROUTER_API_KEY");
            prompt = promptNanoBananaInput.value.trim();
            images = uploadedImages;
            
            if (!apiKey) {
                throw new Error("请输入 OpenRouter API 密钥");
            }
            if (!prompt) {
                throw new Error("请输入提示词");
            }
        } else if (currentModel === 'chatgpt') {
            apiKey = apiKeyOpenAIInput.value || Deno.env.get("OPENAI_API_KEY");
            prompt = promptChatGPTInput.value.trim();
            images = uploadedImagesChatGPT;
            
            if (!apiKey) {
                throw new Error("请输入 OpenAI API 密钥");
            }
            if (!prompt) {
                throw new Error("请输入提示词");
            }
        } else {
            // ModelScope 模型
            apiKey = apiKeyModelScopeInput.value || Deno.env.get("MODELSCOPE_API_KEY");
            const positivePrompt = promptPositiveInput.value.trim();
            const negativePrompt = promptNegativeInput.value.trim();
            const [width, height] = sizeSelect.value.split('x').map(Number);
            const steps = parseInt(stepsInput.value);
            const cfg = parseFloat(cfgInput.value);
            const seed = seedInput.value.trim() ? parseInt(seedInput.value) : undefined;
            const count = parseInt(countInput.value);
            
            if (!apiKey) {
                throw new Error("请输入 ModelScope API Key");
            }
            if (!positivePrompt) {
                throw new Error("请输入正向提示词");
            }
            
            prompt = positivePrompt;
            parameters = {
                prompt: positivePrompt,
                negative_prompt: negativePrompt,
                width,
                height,
                steps,
                cfg_scale: cfg,
                seed,
                num_images: count
            };
        }
        
        // 发送请求
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: currentModel,
                apikey: apiKey,
                prompt: prompt,
                images: images,
                parameters: parameters,
                timeout: 120 // 超时时间2分钟
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || "生成失败，请稍后重试");
        }
        
        // 处理结果
        if (currentModel === 'nanobanana' || currentModel === 'chatgpt') {
            if (result.type === 'image') {
                addResultImage(result.content);
            } else {
                statusMessage.textContent = `模型返回文本：${result.content}`;
                statusMessage.className = 'status-message status-success';
            }
        } else {
            // ModelScope 可能返回多张图片
            if (result.imageUrl) {
                addResultImage(result.imageUrl);
            } else if (result.output_images && result.output_images.length > 0) {
                result.output_images.forEach(url => addResultImage(url));
            } else {
                throw new Error("生成成功，但未返回图片");
            }
        }
        
        // 保存状态
        saveStateForCurrentModel();
        
    } catch (error) {
        console.error("生成错误:", error);
        statusMessage.textContent = `错误：${error.message}`;
        statusMessage.className = 'status-message status-error';
    } finally {
        // 恢复按钮状态
        generateBtns.forEach(btn => {
            btn.disabled = false;
            btn.querySelector('.btn-text').classList.remove('hidden');
            btn.querySelector('.spinner').classList.add('hidden');
        });
    }
}

function addResultImage(imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'result-image';
    img.alt = '生成结果';
    
    img.addEventListener('click', () => {
        modalImage.src = imageUrl;
        fullscreenModal.classList.remove('hidden');
    });
    
    resultsGrid.appendChild(img);
}

// 状态保存与加载
function saveStateForCurrentModel() {
    const state = {
        promptNanoBanana: promptNanoBananaInput.value,
        promptChatGPT: promptChatGPTInput.value,
        promptPositive: promptPositiveInput.value,
        promptNegative: promptNegativeInput.value,
        size: sizeSelect.value,
        steps: stepsInput.value,
        cfg: cfgInput.value,
        seed: seedInput.value,
        count: countInput.value
    };
    
    localStorage.setItem(`modelState_${currentModel}`, JSON.stringify(state));
}

function loadStateForCurrentModel() {
    const savedState = localStorage.getItem(`modelState_${currentModel}`);
    if (savedState) {
        const state = JSON.parse(savedState);
        promptNanoBananaInput.value = state.promptNanoBanana || '';
        promptChatGPTInput.value = state.promptChatGPT || '';
        promptPositiveInput.value = state.promptPositive || '';
        promptNegativeInput.value = state.promptNegative || '';
        sizeSelect.value = state.size || '1328x1328';
        stepsInput.value = state.steps || '30';
        cfgInput.value = state.cfg || '7';
        seedInput.value = state.seed || '';
        countInput.value = state.count || '1';
    }
}

// 输入验证
function setupInputValidation() {
    stepsInput.addEventListener('input', () => {
        if (stepsInput.value < 1) stepsInput.value = 1;
        if (stepsInput.value > 100) stepsInput.value = 100;
    });
    
    cfgInput.addEventListener('input', () => {
        if (cfgInput.value < 1) cfgInput.value = 1;
        if (cfgInput.value > 30) cfgInput.value = 30;
    });
    
    countInput.addEventListener('input', () => {
        if (countInput.value < 1) countInput.value = 1;
        if (countInput.value > 4) countInput.value = 4;
    });
}

// 统一按钮宽度
function setUniformButtonWidth() {
    let maxWidth = 0;
    generateBtns.forEach(btn => {
        const width = btn.offsetWidth;
        if (width > maxWidth) maxWidth = width;
    });
    generateBtns.forEach(btn => {
        btn.style.width = `${maxWidth}px`;
    });
}

// 更新高亮位置
function updateHighlightPosition() {
    const activeCard = document.querySelector('.model-card.active');
    if (activeCard) {
        const rect = activeCard.getBoundingClientRect();
        const scrollTop = window.scrollY;
        window.scrollTo({
            top: rect.top + scrollTop - 20,
            behavior: 'smooth'
        });
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', initialize);
