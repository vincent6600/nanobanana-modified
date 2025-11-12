import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { readFile } from "https://deno.land/std@0.168.0/fs/mod.ts";

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

// 静态文件服务
async function serveStaticFile(path: string): Promise<Response | null> {
  try {
    // 尝试从static目录读取
    let filePath = path;
    if (!path.startsWith('/static/')) {
      filePath = `/static${path}`;
    }
    
    const fullPath = `./${filePath}`;
    const content = await readFile(fullPath);
    
    let contentType = 'text/plain';
    if (path.endsWith('.html')) contentType = 'text/html';
    else if (path.endsWith('.css')) contentType = 'text/css';
    else if (path.endsWith('.js')) contentType = 'application/javascript';
    else if (path.endsWith('.json')) contentType = 'application/json';
    else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (path.endsWith('.png')) contentType = 'image/png';
    else if (path.endsWith('.gif')) contentType = 'image/gif';
    else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
    
    return new Response(content, {
      headers: { ...corsHeaders, 'Content-Type': contentType },
    });
  } catch {
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
    const staticFile = await serveStaticFile(url.pathname);
    if (staticFile) {
      return staticFile;
    }

    // 默认返回主页
    const indexFile = await serveStaticFile('/index.html');
    if (indexFile) {
      return indexFile;
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