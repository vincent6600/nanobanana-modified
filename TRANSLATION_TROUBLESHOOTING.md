# 翻译功能故障排除指南

## 问题概述
翻译按钮报错通常是由环境变量未设置或配置错误导致的。

## 🔑 环境变量设置

### 必需的环境变量
```bash
BAIDU_TRANSLATE_APP_ID=您的百度翻译APP_ID
BAIDU_TRANSLATE_SECRET_KEY=您的百度翻译Secret_Key
```

### 设置步骤
1. 访问 [百度翻译开放平台](https://fanyi-api.baidu.com/)
2. 使用百度账号登录
3. 进入"应用管理" → "创建应用"
4. 记录生成的APP_ID和Secret_Key
5. 在Deno环境变量中设置上述两个字段

## 🔍 诊断步骤

### 步骤1: 检查环境变量
```bash
cd nanobanana-modified
deno run --allow-env check-baidu-env.js
```

### 步骤2: 启动服务器
```bash
# 设置环境变量（替换为您的实际密钥）
export BAIDU_TRANSLATE_APP_ID="your_actual_app_id"
export BAIDU_TRANSLATE_SECRET_KEY="your_actual_secret_key"

# 启动服务器
deno run --allow-net --allow-env main.ts
```

### 步骤3: 测试翻译功能
在浏览器中打开 http://localhost:8000
1. 打开任意一个模型的控制面板
2. 在提示词输入框中输入中文
3. 点击"翻译"按钮
4. 查看是否成功翻译成英文

### 步骤4: 详细测试（可选）
```bash
deno run --allow-net --allow-env test-translation-complete.js
```

## 🚨 常见错误及解决方案

### 错误1: "百度翻译服务未配置"
**原因**: 环境变量未设置或拼写错误
**解决**: 
```bash
# 重新设置环境变量
export BAIDU_TRANSLATE_APP_ID="您的正确APP_ID"
export BAIDU_TRANSLATE_SECRET_KEY="您的正确Secret_Key"
```

### 错误2: "54003 签名错误"
**原因**: APP_ID或Secret_Key不正确
**解决**: 
1. 检查百度翻译平台中的应用信息
2. 确认APP_ID和Secret_Key没有多余的空格
3. 重新生成密钥对

### 错误3: "54004 账号余额不足"
**原因**: 百度翻译账号余额不足
**解决**: 
1. 登录百度翻译开放平台
2. 查看账号余额
3. 充值或购买更多翻译额度

### 错误4: "网络错误"或"连接超时"
**原因**: 网络连接问题
**解决**: 
1. 检查网络连接
2. 确认防火墙设置
3. 尝试使用代理或VPN

### 错误5: "CORS错误"
**原因**: 跨域请求被阻止
**解决**: 
1. 确保服务器正在运行在端口8000
2. 检查浏览器控制台的CORS错误信息
3. 确认后端设置了正确的CORS头

## 🧪 快速测试命令

### 测试环境变量
```bash
deno run --allow-env check-baidu-env.js
```

### 测试完整功能
```bash
deno run --allow-net --allow-env test-translation-complete.js
```

### 检查API状态
```bash
curl http://localhost:8000/api/baidu-translate-status
```

### 手动测试翻译API
```bash
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"q": "一只可爱的小猫", "from": "zh", "to": "en"}'
```

## 📊 功能验证清单

- [ ] 环境变量 `BAIDU_TRANSLATE_APP_ID` 已设置
- [ ] 环境变量 `BAIDU_TRANSLATE_SECRET_KEY` 已设置  
- [ ] Deno服务器成功启动
- [ ] 访问 http://localhost:8000 正常
- [ ] 翻译按钮可以点击
- [ ] 点击翻译按钮后提示词被替换为英文
- [ ] 没有错误信息显示

## 💡 最佳实践

### API密钥安全
- ✅ 使用环境变量存储敏感信息
- ✅ 不要在代码中硬编码密钥
- ✅ 定期轮换API密钥
- ✅ 监控API使用量

### 翻译使用建议
1. **文本长度**: 单次翻译建议不超过500字符
2. **频率控制**: 避免过于频繁的请求
3. **错误处理**: 应用程序已内置错误处理
4. **缓存策略**: 对相同文本进行结果缓存

## 🆘 获取帮助

如果按照本指南操作后仍然有问题，请提供以下信息：

1. **错误信息**: 完整的错误消息
2. **环境检查结果**: `deno run --allow-env check-baidu-env.js` 的输出
3. **服务器日志**: 启动服务器时的控制台输出
4. **浏览器控制台**: 浏览器开发者工具中的错误信息

---
**最后更新**: 2025-11-12  
**版本**: 1.0  
**作者**: MiniMax Agent