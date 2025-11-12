import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  model: string;
  prompt?: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  seed?: number;
  stylePreset?: string;
  aspectRatio?: string;
}

// Language detection function
function detectLanguage(text: string): string {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  const englishRegex = /[a-zA-Z]/;
  const hasChinese = chineseRegex.test(text);
  const hasEnglish = englishRegex.test(text);
  
  if (hasChinese && hasEnglish) return 'zh'; // Mixed → English
  if (hasChinese) return 'zh'; // Chinese → English
  return 'en'; // English → Chinese
}

// Baidu Translate API integration
async function translateWithBaidu(text: string, targetLang: string = 'en') {
  const appId = Deno.env.get('BAIDU_TRANSLATE_APP_ID');
  const secretKey = Deno.env.get('BAIDU_TRANSLATE_SECRET_KEY');
  
  if (!appId || !secretKey) {
    throw new Error('百度翻译API配置错误');
  }

  // Generate MD5 signature
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

// MD5 generation function
async function generateMD5(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Translate API endpoint
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

    if (url.pathname === '/api/generate' && req.method === 'POST') {
      const requestData: GenerateRequest = await req.json();
      const { model } = requestData;

      let response;
      
      switch (model) {
        case 'chatgpt-5':
          response = await generateChatGPT(requestData);
          break;
        case 'nanobanana':
          response = await generateNanoBanana(requestData);
          break;
        case 'qwen-image':
          response = await generateQwenImage(requestData);
          break;
        default:
          response = { error: '不支持的模型' };
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateChatGPT(request: GenerateRequest) {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) {
    return { error: 'OpenRouter API密钥未配置' };
  }

  try {
    // Generate image using Flux.1 model via OpenRouter
    const prompt = request.prompt || '';
    const negativePrompt = request.negativePrompt || '';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nanobanana-ai.replit.app',
        'X-Title': 'NanoBanana AI',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-1.1-pro',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'text',
                text: negativePrompt ? `Negative prompt: ${negativePrompt}` : ''
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: `API请求失败: ${errorData.error?.message || '未知错误'}` };
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content;
      const imageMatch = content.match(/https:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
      
      if (imageMatch) {
        return { 
          success: true, 
          imageUrl: imageMatch[0],
          model: 'chatgpt-5',
          prompt: prompt
        };
      } else {
        return { error: 'API返回的图片URL格式不正确' };
      }
    } else {
      return { error: 'API响应格式异常' };
    }
  } catch (error) {
    return { error: `网络连接失败: ${error.message}` };
  }
}

async function generateNanoBanana(request: GenerateRequest) {
  try {
    const prompt = request.prompt || '';
    const negativePrompt = request.negativePrompt || '';
    
    const width = request.width || 1024;
    const height = request.height || 1024;
    const steps = request.steps || 50;
    const guidanceScale = request.guidanceScale || 7.5;
    
    const seed = request.seed && request.seed > 0 ? request.seed : Math.floor(Math.random() * 1000000);
    
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('negative_prompt', negativePrompt);
    formData.append('width', width.toString());
    formData.append('height', height.toString());
    formData.append('steps', steps.toString());
    formData.append('guidance_scale', guidanceScale.toString());
    formData.append('seed', seed.toString());

    const response = await fetch('https://nanobanana.com/generate', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NanoBanana API Error:', response.status, errorText);
      return { error: `API请求失败: ${response.status}` };
    }

    const data = await response.json();
    
    if (data.images && data.images.length > 0) {
      return {
        success: true,
        imageUrl: data.images[0],
        model: 'nanobanana',
        prompt: prompt,
        seed: seed
      };
    } else {
      return { error: 'API返回异常: 未找到图片数据' };
    }
  } catch (error) {
    return { error: `网络连接失败: ${error.message}` };
  }
}

async function generateQwenImage(request: GenerateRequest) {
  try {
    const apiKey = Deno.env.get('MODELSCOPE_API_KEY');
    if (!apiKey) {
      return { error: 'ModelScope API密钥未配置' };
    }

    const prompt = request.prompt || '';
    const negativePrompt = request.negativePrompt || '';
    
    const width = request.width || 1024;
    const height = request.height || 1024;
    const aspectRatio = request.aspectRatio || '1:1';
    
    const payload = {
      model: "AI-ModelScope/stable-diffusion-xl-base-1.0",
      input: {
        prompt: prompt,
        negative_prompt: negativePrompt,
        image: "",
        width: width,
        height: height,
        num_inference_steps: 50,
        guidance_scale: 7.5,
        seed: 42
      },
      parameters: {
        style: "<sketch>"
      }
    };

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-SSE': 'disable'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Qwen API Error:', response.status, errorData);
      return { error: `API请求失败: ${errorData.code || '未知错误'}` };
    }

    const data = await response.json();
    
    if (data.output && data.output.results && data.output.results.length > 0) {
      return {
        success: true,
        imageUrl: data.output.results[0].url,
        model: 'qwen-image',
        prompt: prompt
      };
    } else if (data.base64_image) {
      // Handle base64 response
      return {
        success: true,
        imageUrl: `data:image/png;base64,${data.base64_image}`,
        model: 'qwen-image',
        prompt: prompt
      };
    } else {
      console.error('Unexpected API response:', data);
      return { error: 'API返回异常: 未知格式' };
    }
  } catch (error) {
    console.error('Qwen API Network Error:', error);
    return { error: `网络连接失败: ${error.message}` };
  }
}