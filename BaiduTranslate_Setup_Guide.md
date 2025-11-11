# 百度翻译API配置指南

## 概述

已成功将翻译功能从ModelScope迁移到百度翻译API，提供更稳定的翻译服务。

## 🔑 API密钥配置

### 环境变量设置

您需要设置以下两个环境变量：

```bash
# 百度翻译API APP ID（从百度翻译平台获取）
export BAIDU_TRANSLATE_APP_ID="您的APP_ID"

# 百度翻译API密钥（从百度翻译平台获取）
export BAIDU_TRANSLATE_SECRET_KEY="您的Secret_Key"
```

### 获取百度翻译API密钥步骤

#### 第1步：访问百度翻译开放平台
- 访问：https://fanyi-api.baidu.com/
- 使用百度账号登录（或注册新账号）

#### 第2步：创建应用
1. 登录成功后，进入"应用管理"页面
2. 点击"创建应用"
3. 填写应用信息：
   - **应用名称**: nanobanana-translation
   - **应用描述**: AI图像生成平台翻译功能
   - **应用类型**: 选择适合的类型
4. 创建成功后，获得APP ID和Secret Key

#### 第3步：记录密钥
- **APP ID**: 在应用列表中可见
- **Secret Key**: 在应用详情中可见

## 🧪 测试API配置

### 方法1：运行测试脚本
```bash
cd nanobanana-modified
deno run --allow-net test-baidu-translate.js
```

### 方法2：检查API状态
```bash
curl http://localhost:8000/api/baidu-translate-status
```

### 方法3：测试翻译功能
```bash
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"q": "一只可爱的小猫", "from": "zh", "to": "en"}'
```

## 🚀 启动服务器

### 设置环境变量并启动
```bash
# 设置环境变量（替换为您的实际密钥）
export BAIDU_TRANSLATE_APP_ID="your_actual_app_id"
export BAIDU_TRANSLATE_SECRET_KEY="your_actual_secret_key"

# 启动服务器
cd nanobanana-modified
deno run --allow-net --allow-env main.ts
```

### 服务器启动检查
- ✅ 启动成功：显示 "Server started on port 8000"
- ✅ 翻译服务：访问 http://localhost:8000/api/baidu-translate-status 返回 `{"isSet": true}`
- ✅ 翻译功能：在网页中测试翻译按钮

## 📊 功能对比

| 功能特性 | 旧版ModelScope | 新版百度翻译 |
|---------|---------------|-------------|
| 配置难度 | 高（需SDK token） | 低（APP ID + Secret Key） |
| 认证稳定性 | 经常失败（401错误） | 稳定可靠 |
| 翻译质量 | 专业但不稳定 | 高质量通用翻译 |
| 响应速度 | 慢 | 快 |
| 维护成本 | 高 | 低 |
| 服务可用性 | 偶有问题 | 持续稳定 |

## 🔧 故障排除

### 问题1：翻译服务未配置
**错误信息**: "百度翻译服务未配置，请设置BAIDU_TRANSLATE_APP_ID和BAIDU_TRANSLATE_SECRET_KEY环境变量"

**解决方案**:
```bash
# 检查环境变量是否设置
echo $BAIDU_TRANSLATE_APP_ID
echo $BAIDU_TRANSLATE_SECRET_KEY

# 如果为空，重新设置
export BAIDU_TRANSLATE_APP_ID="your_app_id"
export BAIDU_TRANSLATE_SECRET_KEY="your_secret_key"
```

### 问题2：API密钥错误
**错误信息**: "54003 签名错误"

**解决方案**:
1. 检查APP ID和Secret Key是否正确
2. 确保没有额外的空格或字符
3. 重新生成密钥对

### 问题3：配额不足
**错误信息**: "54004 账号余额不足"

**解决方案**:
1. 登录百度翻译开放平台
2. 查看账号余额
3. 充值或购买更多翻译额度

### 问题4：网络连接问题
**错误信息**: 网络请求失败

**解决方案**:
1. 检查网络连接
2. 确认防火墙设置
3. 尝试使用代理或VPN

## 💡 最佳实践

### API密钥安全
- ✅ 不要将密钥提交到代码仓库
- ✅ 使用环境变量存储敏感信息
- ✅ 定期轮换API密钥
- ✅ 监控API使用量

### 翻译使用建议
1. **文本长度**: 单次翻译建议不超过500字符
2. **频率控制**: 避免过于频繁的请求
3. **错误处理**: 应用程序应处理翻译失败情况
4. **缓存策略**: 对相同文本进行结果缓存

### 监控建议
- 监控API调用频率
- 跟踪错误率和响应时间
- 设置使用量预警
- 定期检查余额状态

## 🎯 使用示例

### JavaScript调用
```javascript
// 前端调用翻译API
async function translateText(text) {
    const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            q: text,
            from: 'zh',
            to: 'en'
        })
    });
    
    if (response.ok) {
        const result = await response.json();
        return result.trans_result[0].dst;
    } else {
        throw new Error('翻译失败');
    }
}
```

### 测试用例
```javascript
// 测试翻译功能
const testCases = [
    '一只可爱的小猫',
    '美丽的夕阳风景',
    '现代艺术风格',
    '科技感的城市夜景'
];

for (const text of testCases) {
    const translated = await translateText(text);
    console.log(`${text} -> ${translated}`);
}
```

## 📞 技术支持

如遇到问题，请按以下步骤排查：

1. **检查配置**: 确认环境变量设置正确
2. **测试API**: 运行独立测试脚本验证连接
3. **查看日志**: 检查服务器控制台输出
4. **百度文档**: 参考官方API文档

---

**更新日期**: 2025-11-12  
**版本**: 1.0 (百度翻译版本)  
**作者**: MiniMax Agent