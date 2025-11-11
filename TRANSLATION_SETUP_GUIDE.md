# ModelScope翻译功能设置和测试指南

## 问题解决

**发现的问题**: 之前的翻译失败是因为使用了错误的环境变量名。
- ❌ 错误: `MODELSCOPE_API_KEY` 
- ✅ 正确: `MODELSCOPE_SDK_TOKEN`

**已修复**: 代码已经更新为使用正确的 `MODELSCOPE_SDK_TOKEN` 环境变量。

## 环境设置

### 1. 设置ModelScope SDK Token

```bash
# 方法1: 环境变量
export MODELSCOPE_SDK_TOKEN="your_sdk_token_here"

# 方法2: 在Deno运行时中设置
MODELSCOPE_SDK_TOKEN=your_sdk_token_here deno run --allow-net --allow-read --allow-env main.ts
```

### 2. 获取ModelScope SDK Token

1. 访问 [https://modelscope.cn/my/myaccesstoken](https://modelscope.cn/my/myaccesstoken)
2. 登录您的ModelScope账户
3. 生成新的SDK Token
4. 将SDK Token设置为环境变量

## 启动服务器

### 方法1: 直接启动 (推荐)
```bash
cd nanobanana-modified
deno run --allow-net --allow-read --allow-env main.ts
```

### 方法2: 使用环境变量
```bash
export MODELSCOPE_SDK_TOKEN="your_sdk_token"
cd nanobanana-modified
deno run --allow-net --allow-read --allow-env main.ts
```

## 测试翻译功能

### 1. 使用内置测试页面
打开浏览器访问: `test-translation.html`

### 2. 手动测试API
```bash
# 测试API连接
curl http://localhost:8080/api/modelscope-key-status

# 测试翻译
curl -X POST http://localhost:8080/api/translate \
  -H "Content-Type: application/json" \
  -d '{"q": "你好世界", "from": "zh", "to": "en"}'
```

## 功能验证清单

### ✅ 基本功能
- [ ] 服务器成功启动 (无401错误)
- [ ] API连接状态检查通过
- [ ] 翻译API返回正确格式数据

### ✅ 翻译按钮测试
- [ ] ChatGPT-5 模型: 点击"翻译"按钮工作
- [ ] Nano Banana 模型: 点击"翻译"按钮工作  
- [ ] ModelScope 模型: 点击"翻译"按钮工作
- [ ] 翻译结果正确替换原文本

### ✅ 自动翻译测试
- [ ] 输入中文后按三个空格自动翻译
- [ ] 翻译结果正确替换原文本
- [ ] 所有三个模型的输入框都支持空格触发

### ✅ 翻译质量测试
- [ ] 简单词汇翻译正确
- [ ] 复合句翻译合理
- [ ] AI提示词翻译符合语境

## 故障排除

### 常见问题

1. **401 Unauthorized错误**
   - 检查 `MODELSCOPE_SDK_TOKEN` 是否正确设置
   - 确认 SDK Token 有效且未过期
   - 验证代码使用的是 `MODELSCOPE_SDK_TOKEN` 而非 `MODELSCOPE_API_KEY`

2. **"record not found"错误**
   - 可能是模型端点变更，需要更新API地址
   - 检查 ModelScope API 版本兼容性

3. **服务器启动失败**
   - 确认 Deno 已安装: `deno --version`
   - 检查端口8080是否被占用
   - 确认环境变量正确传递

4. **翻译超时或失败**
   - 检查网络连接
   - 验证 ModelScope API 服务状态
   - 查看服务器控制台错误信息

### 调试工具

```bash
# 检查环境变量
echo $MODELSCOPE_SDK_TOKEN

# 查看服务器日志
# 在服务器启动后，查看控制台输出

# 使用测试脚本
node test-sdk-token.js
node test-modelscope-api.js
```

## 成功指标

服务器启动成功后，您应该看到：
```
Server running on http://localhost:8080
```

API测试通过时：
```json
{"isSet": true}
```

翻译测试成功时：
```json
{
  "trans_result": [
    {
      "src": "你好世界",
      "dst": "Hello World"
    }
  ]
}
```

## 下一步

如果所有测试通过，翻译功能已完全修复并正常工作。您可以：

1. 在主页面测试完整的AI图像生成流程
2. 验证翻译后的提示词生成图像质量
3. 确认两种触发方式都正常工作

如有问题，请检查控制台错误信息并参考故障排除部分。
