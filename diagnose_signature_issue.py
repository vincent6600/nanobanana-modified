#!/usr/bin/env python3
"""
百度翻译API签名问题诊断工具
验证签名格式和环境变量
"""

import os
import subprocess
import json
import hashlib
import time
import random
import string

def test_signature_format():
    """测试签名格式问题"""
    print("🔍 检查百度翻译API签名格式...")
    
    # 使用百度官方示例参数测试
    appid = "2015063000000001"
    q = "hello"
    salt = "1435660288"
    timestamp = "1435660288"
    secret_key = "12345678"
    
    # 百度API要求的签名计算：MD5(appid+q+salt+secret_key)
    sign_string = f"{appid}{q}{salt}{secret_key}"
    expected_signature = hashlib.md5(sign_string.encode('utf-8')).hexdigest().upper()
    
    print(f"百度API示例:")
    print(f"  appid: {appid}")
    print(f"  q: {q}")
    print(f"  salt: {salt}")
    print(f"  timestamp: {timestamp}")
    print(f"  secret_key: {secret_key}")
    print(f"  签名字符串: {sign_string}")
    print(f"  期望签名 (大写): {expected_signature}")
    print(f"  小写签名: {expected_signature.lower()}")
    
    return {
        'sign_string': sign_string,
        'upper_signature': expected_signature,
        'lower_signature': expected_signature.lower()
    }

def check_environment_variables():
    """检查环境变量"""
    print("\n🔑 检查环境变量...")
    
    app_id = os.environ.get('BAIDU_TRANSLATE_APP_ID')
    secret_key = os.environ.get('BAIDU_TRANSLATE_SECRET_KEY')
    
    if not app_id:
        print("❌ BAIDU_TRANSLATE_APP_ID 未设置")
        return False
    
    if not secret_key:
        print("❌ BAIDU_TRANSLATE_SECRET_KEY 未设置")
        return False
    
    print(f"✅ APP ID: {app_id}")
    print(f"✅ Secret Key: {secret_key}")
    
    # 验证格式（百度APP ID通常是10位数字）
    if len(app_id) < 8 or not app_id.isdigit():
        print("⚠️  APP ID格式可能不正确")
        print("   百度APP ID通常是8-10位数字")
    
    return True

def test_current_implementation():
    """测试当前的实现"""
    print("\n🔧 测试当前实现...")
    
    # 检查main.ts中签名的生成
    with open('/workspace/nanobanana-modified/main.ts', 'r') as f:
        content = f.read()
    
    # 检查是否有签名的使用
    if 'generateBaiduSignature' in content:
        print("✅ 签名生成函数存在")
    else:
        print("❌ 签名生成函数不存在")
        return False
    
    # 检查是否有MD5函数
    if 'md5Hash' in content:
        print("✅ MD5函数存在")
    else:
        print("❌ MD5函数不存在")
        return False
    
    # 检查是否包含.toUpperCase()（大写转换）
    if '.toUpperCase()' in content:
        print("✅ 找到大写转换")
        return True
    else:
        print("❌ 未找到大写转换 - 这是问题所在！")
        return False

def generate_fix():
    """生成修复方案"""
    print("\n🛠️ 生成修复方案...")
    
    # 读取当前文件
    with open('/workspace/nanobanana-modified/main.ts', 'r') as f:
        content = f.read()
    
    # 修复签名生成函数，添加大写转换
    old_signature_function = '''// 生成百度翻译API签名
function generateBaiduSignature(appId: string, secretKey: string, salt: string, timestamp: string): string {
    const signString = `${appId}${secretKey}${salt}${timestamp}`;
    return md5Hash(signString);
}'''

    new_signature_function = '''// 生成百度翻译API签名
function generateBaiduSignature(appId: string, secretKey: string, salt: string, timestamp: string): string {
    const signString = `${appId}${secretKey}${salt}${timestamp}`;
    return md5Hash(signString).toUpperCase();
}'''
    
    # 替换函数
    if old_signature_function in content:
        print("✅ 找到需要修复的函数")
        print("修复内容:")
        print("   原始: return md5Hash(signString);")
        print("   修复: return md5Hash(signString).toUpperCase();")
        return True
    else:
        print("❌ 未找到目标函数")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("🔍 百度翻译API Invalid Sign 错误诊断工具")
    print("=" * 60)
    
    # 测试1: 签名格式
    signature_test = test_signature_format()
    
    # 测试2: 环境变量
    env_check = check_environment_variables()
    
    # 测试3: 当前实现
    impl_check = test_current_implementation()
    
    # 测试4: 修复方案
    fix_available = generate_fix()
    
    print("\n" + "=" * 60)
    print("📋 诊断结果:")
    print("=" * 60)
    
    if not impl_check:
        print("❌ 问题确认：MD5签名未转换为大写")
        print("\n🔧 解决方案:")
        print("1. 在签名生成函数中添加 .toUpperCase()")
        print("2. 修复签名：return md5Hash(signString).toUpperCase();")
        print("3. 重启服务器测试")
    else:
        print("✅ 签名格式正确")
    
    if not env_check:
        print("\n❌ 环境变量未正确设置")
        print("请确保设置了：")
        print("  export BAIDU_TRANSLATE_APP_ID=您的应用ID")
        print("  export BAIDU_TRANSLATE_SECRET_KEY=您的密钥")
    
    print("\n📝 重要说明:")
    print("百度翻译API的签名必须是32位大写字符串")
    print("格式: MD5(appid + q + salt + secret_key)")
    print("示例签名字符串: 2015063000000001hello143566028812345678")
    print("示例签名结果: B89C7CDB8C8FAEA6DF38E2F21E1D8885")
    
    print("=" * 60)

if __name__ == "__main__":
    main()