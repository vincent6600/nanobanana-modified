# 🎨 AI 图片生成中心

[English Version](./README.en.md)

一个先进、一体化的 AI 图片生成 Web 应用平台。本项目提供了一个直观的 **Web 用户界面**，让您可以与一系列强大的文生图模型进行交互，包括 **Qwen-Image (通义万相)、Flux、Kontext、Krea**，以及多模态模型 **Nano Banana**。

项目基于强大的 Deno 后端构建，旨在提供一个无缝衔接且具备专业级水准的创作体验。

---

## ✨ 核心功能

*   **多模型支持**: 在主界面即可无缝切换多种业界顶尖的图片生成模型。
*   **智能翻译功能**: 支持中文提示词一键翻译为英文，提升AI图像生成效果。
    *   两种触发方式：点击"翻译"按钮 或 输入末尾三空格自动翻译
    *   适用于所有模型的提示词输入框（正向、负向提示词）
    *   基于ModelScope翻译API，提供高质量的中英文翻译
*   **直观的 Web UI**: 拥有一个干净、现代化且响应式的用户界面，专为专业创作流程而设计。
*   **高级生成控制**:
    *   **文生图**: 完全掌控正向/负向提示词、分辨率、采样步数、引导系数 (CFG) 和随机种子。
    *   **多模态 (Nano Banana)**: 结合上传的图片和文本提示词，执行图生图、图文理解等任务。
*   **批量生成**: 一次最多可生成4张图片。应用能够智能处理 API 的速率限制，通过在**并发请求**（适用于Flux等模型）和**串行请求**（适用于Qwen等模型）之间自动切换，确保任务成功率。
*   **智能会话记忆**:
    *   **输入持久化**: 您为每个模型设置的所有提示词和参数，都会在当前会话中被记住。即使来回切换模型，您的工作内容也不会丢失。
    *   **后台任务**: 您可以为一个模型开启生成任务，然后立即切换到其他模型进行操作。应用会持续追踪正在运行的任务，当您切回来时，它会自动恢复视图——如果任务仍在运行，则显示实时进度；如果已完成，则展示结果。
*   **专业级用户体验**:
    *   **浅色 & 深色模式**: 内置主题切换功能，满足您的视觉偏好。
    *   **动态进度更新**: 在生成多张图片时，获得实时反馈（例如："正在生成 2/4 张图片..."）。
    *   **全屏预览**: 点击任何一张生成的图片，即可在弹窗中进行全屏预览。
*   **智能 API Key 处理**:
    *   在部署时将 `OPENROUTER_API_KEY` 和 `MODELSCOPE_SDK_TOKEN` 设置为环境变量，前端将自动隐藏密钥输入框，打造一个清爽、可供分享的界面。
    *   如果未设置环境变量，也支持在UI中直接输入。

---

## 🚀 本地开发部署

### 环境要求
- [Deno](https://deno.land/) 运行时环境
- ModelScope SDK Token（必需）
- OpenRouter API Key（可选，仅用于nano banana模型）

### 1. 获取API密钥

#### ModelScope SDK Token（必需）
1. 访问 [ModelScope平台](https://www.modelscope.cn/)
2. 注册或登录阿里云账号
3. 进入用户面板或API管理页面
4. 创建新的API Key
5. 复制生成的SDK Token

#### OpenRouter API Key（可选）
1. 访问 [OpenRouter.ai](https://openrouter.ai/)
2. 注册账号并获取API Key
3. 仅在使用nano banana模型时需要

### 2. 快速启动

```bash
# 1. 进入项目目录
cd nanobanana-modified

# 2. 复制环境变量模板
cp .env.example .env

# 3. 编辑.env文件，填入你的API密钥
# MODELSCOPE_SDK_TOKEN=ms-your-token-here
# OPENROUTER_API_KEY=sk-your-openrouter-key-here

# 4. 启动服务
chmod +x start.sh
./start.sh

# 或者手动启动
export MODELSCOPE_SDK_TOKEN="your-token"
deno run --allow-net --allow-read --allow-env main.ts
```

### 3. 访问应用
打开浏览器访问：`http://localhost:8000`

---

## 🚀 部署到 Deno Deploy

1.  **Fork 本项目**: 将此仓库 Fork 到您自己的 GitHub 账户。
2.  **登录 Deno Deploy**: 使用您的 GitHub 账号登录 [Deno Deploy Dashboard](https://dash.deno.com/projects)。
3.  **创建新项目**:
    *   点击 "New Project"。
    *   选择您刚刚 Fork 的 GitHub 仓库。
    *   选择 `main` 分支和 `main.ts` 作为入口文件。
4.  **添加环境变量**:
    *   进入项目的 "Settings" -> "Environment Variables"。
    *   添加 `MODELSCOPE_SDK_TOKEN`，值为您的 ModelScope SDK Token（用于翻译和图像生成）。
    *   添加 `OPENROUTER_API_KEY`，值为您的 OpenRouter API密钥（用于 Nano Banana）。
    *   (可选) 添加 `PORT`，设置服务器端口（默认8000）。
5.  **部署**: 点击 "Link" 或 "Deploy" 按钮，您的 AI 图片生成中心就上线了！

---

## 🛠️ 如何使用

1.  打开您部署后的 `*.deno.dev` URL。
2.  如果您没有在部署时设置环境变量，请在所选模型的"设置"区域输入对应的 API Key。
3.  **对于文生图模型 (Qwen, Flux 等)**:
    *   输入您的正向和负向提示词。
    *   可使用"翻译"按钮将中文提示词快速翻译为英文。
    *   调整分辨率、步数、引导系数等参数。
    *   选择您想生成的图片数量。
    *   点击"生成"。
4.  **对于 Nano Banana (多模态模型)**:
    *   （可选）上传一张或多张图片。
    *   输入您的文本提示词。
    *   可使用"翻译"按钮将中文提示词快速翻译为英文。
    *   点击"生成"。

## 🌐 翻译功能

点击提示词框标题右侧的"翻译"按钮，或在输入文本末尾输入三个空格，可自动将中文提示词翻译为英文，提升AI图像生成效果。
- **ModelScope翻译**: 集成ModelScope翻译API，基于阿里云AI技术，提供高质量翻译
- **智能处理**: 支持网络错误、API配额不足等情况的友好提示
- **一键翻译**: 翻译后自动替换原文本，无需手动复制粘贴

## 💻 技术栈

-   **前端**: 原生 HTML, CSS, JavaScript (无框架)
-   **后端**: Deno, Deno Standard Library
-   **AI 模型**:
    *   [魔搭 (ModelScope)](https://modelscope.cn/): `Qwen/Qwen-Image`, `MusePublic/FLUX.1` 等
    *   [OpenRouter](https://openrouter.ai/): `google/gemini-2.5-flash-image-preview` (用于 Nano Banana)

## 🔧 API端点

### 翻译服务
- **端点**: `POST /api/translate`
- **功能**: 中文文本翻译为英文
- **参数**: 
  - `q`: 待翻译的文本
  - `from`: 源语言 (默认: 'zh')
  - `to`: 目标语言 (默认: 'en')

### 状态检查
- `GET /api/modelscope-translate-status`: 检查ModelScope翻译服务状态
- `GET /api/modelscope-image-status`: 检查ModelScope图像服务状态  
- `GET /api/openrouter-status`: 检查OpenRouter服务状态

## 📝 版本更新

### v2.0.0 (当前版本)
- ✅ 迁移到ModelScope翻译服务
- ✅ 移除百度翻译依赖
- ✅ 简化代码结构，提高稳定性
- ✅ 添加完整的错误处理和日志记录
- ✅ 提供完整的部署文档和环境配置

### v1.0.0 (原始版本)
- 使用百度翻译API
- 支持多种图像生成模型

## 🔍 故障排除

### 常见问题

#### 1. 401 Unauthorized 错误
**问题**: ModelScope翻译API返回401错误  
**解决**: 
1. 确认ModelScope SDK Token是否正确
2. 检查Token是否从官方平台获取
3. 验证Token是否有足够的使用配额

#### 2. 翻译不工作
**解决**: 
1. 检查服务器日志中的错误信息
2. 确认网络连接正常
3. 验证`MODELSCOPE_SDK_TOKEN`环境变量设置正确

#### 3. Deno运行时错误
**解决**: 
1. 确保安装了最新版本的Deno
2. 运行命令：`deno --version`
3. 如果版本过低，访问 https://deno.land/ 更新

## 📞 支持

如果遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查服务器日志输出
3. 确认API密钥是否正确配置
4. 验证网络连接和服务状态

---

**注意**: 请妥善保管你的API密钥，不要在公共代码仓库中提交包含真实密钥的配置文件。