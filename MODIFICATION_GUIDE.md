# nanobanana 项目修改说明

## 🔧 重要修复说明 (2025-11-11)

### 修复内容
- **模型ID修复**: 修复了ChatGPT DALL-E 3模型的无效模型ID错误
- **原问题**: OpenRouter上没有`openai/dall-e-3`模型，导致400 Bad Request错误
- **解决方案**: 使用OpenRouter上实际可用的`openai/gpt-5-image-mini`模型

**具体变更**:
- 错误信息: `"openai/dall-e-3 is not a valid model ID"`
- 修复方案: 改用 `openai/gpt-5-image-mini` 模型
- API端点: 继续使用 `https://openrouter.ai/api/v1/chat/completions`
- 模型特点: GPT-5 Image Mini 版本，成本效益较高

## 📋 修改概述

本次修改为 nanobanana 项目新增了 **ChatGPT (DALL-E 3)** 模型支持，并调整了前端界面布局。

## ✨ 新增功能

### 1. ChatGPT 模型支持
- **新增模型**: ChatGPT (GPT-5 Image Mini)
- **API 提供商**: OpenRouter (使用 openai/gpt-5-image-mini 模型)
- **模型标识**: `chatgpt`
- **功能特点**:
  - 支持文生图 (text-to-image)
  - 支持图生图 (image-to-image) - 支持多模态输入
  - 支持多张图片上传（使用第一张作为参考）
  - 支持中英文提示词
  - GPT-5 Image Mini 版本，成本效益较高

### 2. 界面调整
- **模型选择器顺序调整**: ChatGPT → Nano Banana → Qwen-Image → Flux → Kontext → Krea
- **ChatGPT 独立控制面板**: 
  - 独立的 OpenAI API Key 输入区域
  - 独立的图片上传功能
  - 独立的提示词输入框
  - 独立的生成按钮
  - 独立的缩略图显示

## 🔧 技术实现

### 后端修改 (main.ts)
1. **新增 API 端点**:
   - `/api/openai-key-status` - 检查 OpenAI API Key 状态
   - **模型支持**: `chatgpt` 模型识别和处理

2. **GPT-5 Image API 集成**:
   - 新增 `callDALLE3()` 函数
   - 通过OpenRouter调用 `openai/gpt-5-image-mini` 模型
   - 支持图文混合输入 (prompt + images)
   - 使用OpenRouter的消息格式
   - API端点: `https://openrouter.ai/api/v1/chat/completions`

3. **API 调用逻辑**:
   ```typescript
   // 新增的模型处理分支
   } else if (model === 'chatgpt') {
       const openaiApiKey = apikey || Deno.env.get("OPENAI_API_KEY");
       if (!openaiApiKey) { return createJsonErrorResponse("OpenAI API key is not set.", 500); }
       if (!prompt) { return createJsonErrorResponse("Prompt is required.", 400); }
       
       // 直接调用OpenAI DALL-E 3 API
       const result = await callDALLE3(prompt, openaiApiKey, images || []);
       // ... 处理返回结果
   }
   ```

### 前端修改 (index.html)
1. **模型选择器**:
   ```html
   <!-- 调整后的模型顺序 -->
   <div class="model-card active" data-model="chatgpt">ChatGPT</div>
   <div class="model-card" data-model="nanobanana">Nano Banana</div>
   <!-- 其他模型... -->
   ```

2. **ChatGPT 控制面板**:
   - **API Key 输入**: `api-key-input-openai`
   - **图片上传**: `image-upload-chatgpt`
   - **缩略图容器**: `thumbnails-container-chatgpt`
   - **提示词输入**: `prompt-input-chatgpt`
   - **控制面板 ID**: `chatgpt-controls`

### 前端逻辑修改 (script.js)
1. **元素引用**:
   - 新增 ChatGPT 相关元素的选择器
   - 为每个模型维护独立的文件上传状态

2. **状态管理**:
   - `selectedFilesChatGPT` - ChatGPT 模型的上传文件
   - `modelStates.chatgpt` - ChatGPT 模型的状态

3. **文件上传功能**:
   - ChatGPT 和 Nano Banana 使用独立的文件上传系统
   - 互不干扰，各自有独立的缩略图显示

4. **生成处理**:
   - 新增 `handleChatGPTGeneration()` 函数
   - 支持 ChatGPT 模型的图片生成流程

## 🔧 API 修复详情 (2025-11-11)

### 问题背景
用户使用OpenRouter API Key，并将其设置为环境变量`OPENAI_API_KEY`，但调用时出现`openai/dall-e-3 is not a valid model ID`错误。

### 问题原因
OpenRouter上没有名为`openai/dall-e-3`的模型，模型ID格式错误。

### 解决方案
1. **使用正确的模型ID**: 
   - 原ID: `openai/dall-e-3` (无效)
   - 新ID: `openai/gpt-5-image-mini` (有效)

2. **API调用结构**:
   ```typescript
   {
     model: "openai/gpt-5-image-mini",
     messages: [
       {
         role: "user", 
         content: [
           { type: "text", text: "用户提示词" },
           { type: "image_url", image_url: { url: "base64图片数据" } }
         ]
       }
     ]
   }
   ```

3. **返回处理**:
   - 提取 `choices[0].message.images[0].image_url.url`
   - 或提取 `choices[0].message.content` (base64格式)

4. **图片上传处理**:
   - 支持多图片上传，但只使用第一张作为参考
   - 使用OpenRouter的多模态消息格式
   - 保持与原有多图片上传接口的兼容

### 兼容性保证
- 修复不影响其他模型的功能
- 前端接口保持不变
- 向后兼容原有的所有功能

## 📝 使用方法

### 1. 部署步骤
1. **上传文件**: 将修改后的文件上传到服务器
2. **配置 API Key**: 在界面中输入 OpenAI API Key (或设置环境变量 `OPENAI_API_KEY`)
3. **访问应用**: 打开网站，选择 ChatGPT 模型

### 2. ChatGPT 模型使用
1. **选择模型**: 点击 "ChatGPT" 卡片
2. **设置 API Key**: 在输入框中填入 OpenAI API Key
3. **上传图片** (可选): 点击上传区域或拖拽图片文件
4. **输入提示词**: 在提示词输入框中描述想要的图片
5. **生成图片**: 点击 "生成" 按钮
6. **查看结果**: 生成完成后图片将显示在结果区域

### 3. API Key 获取
- **OpenAI API Key**: 访问 [OpenAI Platform](https://platform.openai.com/)
- **注意事项**: DALL-E 3 是付费服务，请确保账户有足够余额

## 🔄 模型对比

| 特性 | ChatGPT (DALL-E 3) | Nano Banana | ModelScope 模型 |
|------|-------------------|-------------|------------------|
| **API 提供商** | OpenAI 官方API | OpenRouter | ModelScope |
| **支持图片上传** | ✅ (作为参考图) | ✅ | ❌ |
| **提示词语言** | 中英文 | 中英文 | 英文 (Qwen 支持中文) |
| **生成质量** | 高 | 中 | 中-高 |
| **生成速度** | 中等 | 较快 | 较慢 |
| **成本** | 付费 (GPT-5 Image Mini) | 付费 | 部分免费 |

## 🛠️ 文件结构

```
nanobanana-modified/
├── main.ts                 # 后端服务器 (已修改)
├── static/
│   ├── index.html         # 前端界面 (已修改)
│   ├── script.js          # 前端逻辑 (已修改)
│   └── style.css          # 样式文件 (未修改)
├── README.md              # 原始说明文档
└── MODIFICATION_GUIDE.md  # 本修改说明
```

## ⚠️ 注意事项

1. **API Key 安全**: 请妥善保管 API Key，不要在前端代码中硬编码
2. **成本控制**: DALL-E 3 是付费服务，请注意使用成本
3. **文件大小**: 图片上传可能受到服务器配置限制
4. **兼容性**: 修改后的代码向后兼容原有功能
5. **网络要求**: 
   - OpenAI API: 需要能够访问 `api.openai.com`
   - OpenRouter API: 需要能够访问 `openrouter.ai`
   - ModelScope API: 需要能够访问 `api-inference.modelscope.cn`
6. **GPT-5 Image 限制**: 
   - 使用Mini版本（成本优化）
   - 单次生成1张图片
   - 支持标准分辨率

## 🐛 故障排除

### 常见问题
1. **API Key 错误**: 检查 OpenAI API Key 是否有效和正确
2. **生成失败**: 检查 API Key 余额和请求频率限制
3. **图片上传失败**: 检查文件大小和格式
4. **界面显示异常**: 清除浏览器缓存后重新加载
5. **401错误**: 确保使用的是OpenAI API Key而不是OpenRouter API Key
6. **网络错误**: 检查能否访问 OpenAI API 端点

### 调试信息
- 打开浏览器开发者工具查看控制台日志
- 后端服务器会输出详细的 API 调用日志
- 网络请求错误会显示具体的错误信息

## 📞 技术支持

如遇到问题，请检查：
1. API Key 是否正确配置
2. 网络连接是否正常
3. 浏览器控制台是否有错误信息
4. 服务器日志是否有异常记录

---

**修改完成时间**: 2025-11-11  
**修改者**: MiniMax Agent  
**版本**: nanobanana-v2.0 (with ChatGPT support)