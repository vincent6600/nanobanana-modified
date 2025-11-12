import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 语言检测函数
function detectLanguage(text: string): string {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  const englishRegex = /[a-zA-Z]/;
  const hasChinese = chineseRegex.test(text);
  const hasEnglish = englishRegex.test(text);
  
  if (hasChinese && hasEnglish) return 'en'; // 混合 → 英文
  if (hasChinese) return 'en'; // 中文 → 英文
  return 'zh'; // 英文 → 中文
}

// 百度翻译API调用
async function translateWithBaidu(text: string, targetLang: string = 'en') {
  const appId = Deno.env.get('BAIDU_TRANSLATE_APP_ID');
  const secretKey = Deno.env.get('BAIDU_TRANSLATE_SECRET_KEY');
  
  if (!appId || !secretKey) {
    throw new Error('百度翻译API配置错误');
  }

  const salt = Math.random().toString(36).slice(-8);
  const query = text;
  const sign = await generateMD5(appId + query + salt + secretKey);

  const params = new URLSearchParams({
    q: query,
    from: 'auto',
    to: targetLang === 'zh' ? 'zh' : 'en',
    appid: appId,
    salt: salt,
    sign: sign
  });

  try {
    const response = await fetch('https://api.fanyi.baidu.com/api/trans/vip/translate?' + params.toString());
    
    if (!response.ok) {
      throw new Error(`网络错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error_code) {
      throw new Error(`翻译失败: ${data.error_msg || '未知错误'}`);
    }
    
    return data.trans_result[0].dst;
  } catch (error) {
    throw new Error(`网络连接失败，请检查网络设置`);
  }
}

// MD5生成函数
async function generateMD5(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// 内嵌静态文件内容
async function getIndexHTML(): Promise<string> {
  return \`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>融图AI-生图工具</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1 class="title">融图AI-生图工具</h1>

    <div class="main-container">
        <div class="controls-container">
            
            <!-- Nano Banana 控制面板 -->
            <div id="nanobanana-controls" class="controls">
                <div class="prompt-section">
                    <div class="prompt-header">
                        <h2>输入提示词</h2>
                        <button class="translate-btn" id="translate-nanobanana-prompt">翻译</button>
                    </div>
                    <textarea id="prompt-input-nanobanana" placeholder="例如：一只穿着超级英雄斗篷的猫，电影级灯光"></textarea>
                </div>
                <button class="generate-btn">生成</button>
            </div>

            <!-- ChatGPT 控制面板 -->
            <div id="chatgpt-controls" class="controls hidden">
                <div class="prompt-section">
                    <div class="prompt-header">
                        <h2>输入提示词</h2>
                        <button class="translate-btn" id="translate-chatgpt-prompt">翻译</button>
                    </div>
                    <textarea id="prompt-input-chatgpt" placeholder="例如：一只穿着超级英雄斗篷的猫，电影级灯光"></textarea>
                </div>
                <button class="generate-btn">生成</button>
            </div>

            <!-- ModelScope 控制面板 -->
            <div id="modelscope-controls" class="controls hidden">
                <div class="prompt-section">
                    <div class="prompt-header">
                        <h2>正向提示词</h2>
                        <button class="translate-btn" id="translate-modelscope-positive">翻译</button>
                    </div>
                    <textarea id="prompt-input-positive" placeholder="例如：A golden cat, masterpiece, best quality"></textarea>
                </div>
                <div class="prompt-section">
                    <div class="prompt-header">
                        <h2>负向提示词</h2>
                        <button class="translate-btn" id="translate-modelscope-negative">翻译</button>
                    </div>
                    <textarea id="prompt-input-negative" placeholder="例如：worst quality, low quality, normal quality"></textarea>
                </div>
                <button class="generate-btn">生成</button>
            </div>
            
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>\`;
}

async function getCSS(): Promise<string> {
  return \`
/* 主题颜色变量*/
:root {
  --gradient-start: #fde847;
  --gradient-mid: #f97316;
  --gradient-end: #ef4444;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

body {
  font-family: var(--font-family);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f2f5;
  margin: 0;
  padding: 2rem 1rem;
  min-height: 100vh;
}

.title {
  text-align: center;
  margin: 2rem 0;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-mid), var(--gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  font-weight: 700;
}

.main-container {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  width: 100%;
  align-items: flex-start;
}

.controls-container {
  flex: 1;
  max-width: 600px;
}

.controls {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.hidden {
  display: none;
}

.prompt-section {
  margin: 20px 0;
}

.prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.prompt-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #1f2937;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: var(--gradient-mid);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.generate-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-mid), var(--gradient-end));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.generate-btn:active {
  transform: translateY(0);
}

.translate-btn {
  background: linear-gradient(90deg, var(--gradient-start), var(--gradient-mid));
  color: #333;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: 10px;
}

.translate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

.translate-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.translate-btn.translating {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.translate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .controls-container {
    max-width: none;
  }
  
  body {
    padding: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .translate-btn {
    font-size: 0.8rem;
    padding: 5px 10px;
    min-width: 50px;
  }
}

/* 翻译消息提示 */
.translate-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 10000;
  transition: all 0.3s ease;
  max-width: 300px;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(-10px);
}

.translate-message.success {
  background-color: #10b981;
  color: white;
}

.translate-message.error {
  background-color: #ef4444;
  color: white;
}

.translate-message.info {
  background-color: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
}
\`;
}

async function getJS(): Promise<string> {
  return \`
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
                        showTranslateMessage(\`翻译失败: \${error.message}\`, 'error');
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
        messageEl.className = \`translate-message \${type}\`;
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
\`;
}

// 简化的静态文件服务
async function serveStaticFile(url: URL): Promise<Response | null> {
  try {
    const path = url.pathname;
    
    // 处理不同类型的文件请求
    if (path === '/' || path === '/index.html') {
      const html = await getIndexHTML();
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }
    
    if (path === '/style.css') {
      const css = await getCSS();
      return new Response(css, {
        headers: { ...corsHeaders, 'Content-Type': 'text/css' },
      });
    }
    
    if (path === '/script.js') {
      const js = await getJS();
      return new Response(js, {
        headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
      });
    }
    
    return null;
  } catch (error) {
    console.error('Static file error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // 翻译API端点 - 新增功能
    if (url.pathname === '/api/translate') {
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: '只支持POST请求' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { text, targetLang = 'auto' } = await req.json();
      
      if (!text || text.trim() === '') {
        return new Response(JSON.stringify({ error: '文本不能为空' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const detectedLang = detectLanguage(text);
      const targetLanguage = targetLang === 'auto' ? (detectedLang === 'zh' ? 'en' : 'zh') : targetLang;

      try {
        const translatedText = await translateWithBaidu(text, targetLanguage);
        
        return new Response(JSON.stringify({ 
          translatedText,
          detectedLanguage: detectedLang,
          targetLanguage: targetLanguage
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 静态文件服务
    const staticFile = await serveStaticFile(url);
    if (staticFile) {
      return staticFile;
    }

    // 如果所有都失败，返回404
    return new Response('Not Found', { 
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});