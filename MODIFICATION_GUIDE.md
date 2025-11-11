# nanobanana 项目修改说明

## 📋 修改概述

本次修改为 nanobanana 项目新增了 **ChatGPT (DALL-E 3)** 模型支持，并调整了前端界面布局。

## ✨ 新增功能

### 1. ChatGPT 模型支持
- **新增模型**: ChatGPT (DALL-E 3)
- **API 提供商**: OpenRouter (通过 OpenRouter 调用 OpenAI 的 DALL-E 3 模型)
- **模型标识**: `chatgpt`
- **功能特点**:
  - 支持文生图 (text-to-image)
  - 支持图生图 (image-to-image)
  - 支持多张图片上传
  - 支持中英文提示词

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

2. **DALL-E 3 API 集成**:
   - 新增 `callDALLE3()` 函数
   - 通过 OpenRouter API 调用 OpenAI 的 DALL-E 3 模型
   - 支持图文混合输入 (prompt + images)

3. **API 调用逻辑**:
   ```typescript
   // 新增的模型处理分支
   } else if (model === 'chatgpt') {
       const openaiApiKey = apikey || Deno.env.get("OPENAI_API_KEY");
       if (!openaiApiKey) { return createJsonErrorResponse("OpenAI API key is not set.", 500); }
       // ... 调用 DALL-E 3 的逻辑
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
| **API 提供商** | OpenRouter → OpenAI | OpenRouter | ModelScope |
| **支持图片上传** | ✅ | ✅ | ❌ |
| **提示词语言** | 中英文 | 中英文 | 英文 (Qwen 支持中文) |
| **生成质量** | 高 | 中 | 中-高 |
| **生成速度** | 中等 | 较快 | 较慢 |
| **成本** | 付费 | 付费 | 部分免费 |

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

## 🐛 故障排除

### 常见问题
1. **API Key 错误**: 检查 OpenAI API Key 是否有效和正确
2. **生成失败**: 检查 API Key 余额和请求频率限制
3. **图片上传失败**: 检查文件大小和格式
4. **界面显示异常**: 清除浏览器缓存后重新加载

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