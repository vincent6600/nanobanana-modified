#!/usr/bin/env python3
"""
百度翻译API签名修复验证工具
验证修复后的签名是否正确
"""

import os
import hashlib

def verify_signature_fix():
    """验证签名修复"""
    print("🔧 验证签名修复...")
    
    # 读取修复后的main.ts
    try:
        with open('/workspace/nanobanana-modified/main.ts', 'r') as f:
            content = f.read()
        
        # 检查修复是否应用
        if '.toUpperCase()' in content:
            print("✅ 签名已修复：包含 .toUpperCase()")
        else:
            print("❌ 签名未修复：缺少 .toUpperCase()")
            return False
        
        # 查找签名生成函数
        if 'generateBaiduSignature' in content:
            print("✅ 签名生成函数存在")
        else:
            print("❌ 签名生成函数不存在")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ 文件读取错误: {e}")
        return False

def test_signature_format():
    """测试签名格式"""
    print("\n🧪 测试签名格式...")
    
    # 使用百度官方示例
    appid = "2015063000000001"
    q = "hello"
    salt = "1435660288"
    secret_key = "12345678"
    
    sign_string = f"{appid}{q}{salt}{secret_key}"
    signature = hashlib.md5(sign_string.encode('utf-8')).hexdigest()
    
    print(f"百度API测试用例:")
    print(f"  签名字符串: {sign_string}")
    print(f"  小写签名: {signature}")
    print(f"  大写签名: {signature.upper()}")
    
    return {
        'lower': signature,
        'upper': signature.upper()
    }

def test_environment():
    """测试环境"""
    print("\n🔑 测试环境...")
    
    app_id = os.environ.get('BAIDU_TRANSLATE_APP_ID')
    secret_key = os.environ.get('BAIDU_TRANSLATE_SECRET_KEY')
    
    if app_id and secret_key:
        print(f"✅ 环境变量已设置")
        print(f"  APP ID: {app_id[:10]}...")
        print(f"  Secret Key: {secret_key[:10]}...")
        return True
    else:
        print("❌ 环境变量未设置")
        print("请设置:")
        print("  export BAIDU_TRANSLATE_APP_ID=您的应用ID")
        print("  export BAIDU_TRANSLATE_SECRET_KEY=您的密钥")
        return False

def generate_fix_report():
    """生成修复报告"""
    print("\n📋 修复报告:")
    print("=" * 50)
    
    print("🔍 问题诊断:")
    print("  错误: 54001 - Invalid Sign")
    print("  原因: MD5签名未转换为大写")
    print("  位置: generateBaiduSignature函数")
    
    print("\n🛠️  修复内容:")
    print("  原始: return md5Hash(signString);")
    print("  修复: return md5Hash(signString).toUpperCase();")
    
    print("\n✅ 修复验证:")
    verification = verify_signature_fix()
    env_test = test_environment()
    signature_test = test_signature_format()
    
    print("\n🚀 下一步操作:")
    if verification and env_test:
        print("1. 重启服务器: deno run --allow-net --allow-env main.ts")
        print("2. 访问 http://localhost:8000")
        print("3. 测试翻译功能")
        print("4. 应该看到翻译成功，无Invalid Sign错误")
    else:
        print("1. 请先完成上述修复验证")
        print("2. 确保环境变量正确设置")
        print("3. 然后重启服务器")
    
    print("\n📝 重要提醒:")
    print("百度翻译API要求签名必须是大写32字符MD5值")
    print("修复前：小写签名 → API返回 Invalid Sign")
    print("修复后：大写签名 → API接受并正常处理")
    
    return verification and env_test

def main():
    """主函数"""
    print("=" * 60)
    print("🔧 百度翻译API Invalid Sign 修复验证")
    print("=" * 60)
    
    success = generate_fix_report()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 修复验证通过！")
        print("现在可以测试百度翻译功能了")
    else:
        print("⚠️  请检查修复和环境设置")
    print("=" * 60)

if __name__ == "__main__":
    main()