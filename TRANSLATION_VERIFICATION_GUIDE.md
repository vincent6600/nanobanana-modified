# 百度翻译功能修复验证指南

## 问题分析

您遇到的 "翻译失败:Unrecognized algorithm name" 错误是由以下原因导致的：

1. **根本原因**: Deno的 `crypto.subtle.digest()` 函数不支持 MD5 算法
2. **影响**: 百度翻译API需要 MD5 签名，导致请求失败
3. **修复**: 已实现自定义MD5算法，替换WebCrypto API调用

## 修复状态验证

### ✅ 已完成的修复

1. **自定义MD5算法** (main.ts 第22-139行)
   - 使用32位整数运算实现标准MD5
   - Deno兼容，无需WebCrypto
   - 返回32字符十六进制字符串

2. **签名生成函数** (main.ts 第142-145行)
   ```typescript
   function generateBaiduSignature(appId, secretKey, salt, timestamp) {
       const signString = `${appId}${secretKey}${salt}${timestamp}`;
       return md5Hash(signString);
   }
   ```

3. **百度翻译API调用** (main.ts 第148-220行)
   - 正确的参数构造
   - 错误处理
   - 环境变量配置

4. **API端点** (main.ts 第400-430行)
   - POST `/api/translate` 端点
   - 环境变量检查
   - CORS支持

### 🔧 必需的设置

#### 1. 环境变量
```bash
export BAIDU_TRANSLATE_APP_ID=你的应用ID
export BAIDU_TRANSLATE_SECRET_KEY=你的密钥
```

#### 2. Deno运行时
```bash
# 检查Deno版本
deno --version

# 如果未安装Deno
curl -fsSL https://deno.land/install.sh | sh
```

## 测试步骤

### 步骤1：验证代码修复
```bash
cd nanobanana-modified
```

### 步骤2：检查环境变量
```bash
echo $BAIDU_TRANSLATE_APP_ID
echo $BAIDU_TRANSLATE_SECRET_KEY
```
**预期结果**: 应显示您的API凭证（如果不是空白）

### 步骤3：启动服务器
```bash
# 使用提供的启动脚本
chmod +x start-translation-server.sh
./start-translation-server.sh

# 或手动启动
deno run --allow-net --allow-env main.ts
```

### 步骤4：测试翻译功能

#### 方法1：使用网页界面
1. 打开浏览器访问 http://localhost:8000
2. 在提示词框中输入中文文本
3. 点击"翻译"按钮
4. 观察翻译结果

#### 方法2：使用curl测试API
```bash
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"q":"你好世界","from":"zh","to":"en"}'
```

**预期结果**: 
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

## 常见问题排查

### 问题1: "端口8000已被占用"
**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :8000

# 或使用不同端口
PORT=8080 deno run --allow-net --allow-env main.ts
```

### 问题2: "Deno未找到"
**解决方案**:
```bash
# 安装Deno
curl -fsSL https://deno.land/install.sh | sh

# 添加到PATH
export PATH="$HOME/.deno/bin:$PATH"
```

### 问题3: "环境变量未设置"
**解决方案**:
```bash
# 检查当前变量
echo $BAIDU_TRANSLATE_APP_ID

# 重新设置
export BAIDU_TRANSLATE_APP_ID=你的应用ID
export BAIDU_TRANSLATE_SECRET_KEY=你的密钥
```

### 问题4: 翻译API错误
**检查**:
- API凭证是否有效
- 网络连接是否正常
- 请求参数是否正确

## 验证成功标志

当修复成功时，您应该看到：

1. ✅ 服务器启动无错误
2. ✅ 翻译按钮点击无报错
3. ✅ 中文文本正确翻译为英文
4. ✅ 控制台显示成功日志：
   ```
   百度翻译请求: "你好世界"
   百度翻译请求参数: q=你好世界&from=zh&to=en&appid=...&salt=...&timestamp=...&sign=...
   百度翻译成功: {"trans_result":[{"src":"你好世界","dst":"Hello World"}]}
   ```

## 快速修复脚本

如果您需要快速测试，可以使用以下命令：

```bash
# 检查修复文件
grep -n "md5Hash" main.ts

# 应显示:
# 22: function md5Hash(text: string): string {
# 144: return md5Hash(signString);
```

如果这两行都存在，说明MD5修复已应用。

---

## 总结

✅ **修复完成**: MD5算法已替换为Deno兼容版本
✅ **环境变量**: 需要设置 BAIDU_TRANSLATE_APP_ID 和 BAIDU_TRANSLATE_SECRET_KEY  
✅ **测试**: 按照上述步骤验证功能
✅ **结果**: 翻译功能应正常工作，无"Unrecognized algorithm name"错误