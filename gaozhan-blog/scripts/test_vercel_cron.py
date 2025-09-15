#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试Vercel Cron端点的脚本
"""

import requests
import json
import time

def test_cron_endpoint(base_url="http://localhost:3000"):
    """测试Cron端点"""
    print("🧪 测试Vercel Cron端点...")
    
    try:
        # 测试Cron端点
        response = requests.get(f"{base_url}/api/cron/monitor", timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Cron端点测试成功!")
            
            if result.get('success'):
                data = result.get('data', {})
                summary = data.get('summary', {})
                print(f"📊 监控结果:")
                print(f"  - 账号数: {summary.get('total_accounts', 0)}")
                print(f"  - 文章数: {summary.get('total_articles', 0)}")
                print(f"  - 费用: {summary.get('total_cost', 0)}元")
                print(f"  - 时间: {result.get('timestamp')}")
                
                # 显示文章详情
                accounts = data.get('accounts', [])
                for account in accounts:
                    if account.get('success') and account.get('articles'):
                        print(f"\n📱 {account['account_name']}:")
                        for article in account['articles'][:3]:  # 只显示前3篇
                            print(f"  - {article['title']}")
                            print(f"    分类: {article['category_id']} (原:{article['original_category']})")
            else:
                print(f"❌ 监控失败: {result.get('message')}")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            print(f"响应: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时（这是正常的，监控需要时间）")
    except Exception as e:
        print(f"❌ 测试失败: {e}")

def test_manual_endpoint(base_url="http://localhost:3000"):
    """测试手动监控端点"""
    print("\n🧪 测试手动监控端点...")
    
    try:
        response = requests.post(f"{base_url}/api/monitor", timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 手动监控端点测试成功!")
            
            if result.get('success'):
                data = result.get('data', {})
                summary = data.get('summary', {})
                print(f"📊 监控结果:")
                print(f"  - 账号数: {summary.get('total_accounts', 0)}")
                print(f"  - 文章数: {summary.get('total_articles', 0)}")
                print(f"  - 费用: {summary.get('total_cost', 0)}元")
            else:
                print(f"❌ 监控失败: {result.get('message')}")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")

def main():
    """主函数"""
    print("🎯 Vercel Cron端点测试工具")
    print("=" * 50)
    
    base_url = input("输入测试URL (默认: http://localhost:3000): ").strip()
    if not base_url:
        base_url = "http://localhost:3000"
    
    print(f"\n🔗 测试目标: {base_url}")
    
    # 测试两个端点
    test_cron_endpoint(base_url)
    test_manual_endpoint(base_url)
    
    print("\n✅ 测试完成!")
    print("\n📝 部署到Vercel后的测试:")
    print("1. 替换URL为你的Vercel域名")
    print("2. 测试 /api/cron/monitor 端点")
    print("3. 检查Vercel函数日志")

if __name__ == "__main__":
    main()
