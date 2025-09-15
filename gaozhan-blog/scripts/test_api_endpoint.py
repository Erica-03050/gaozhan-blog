#!/usr/bin/env python3
"""
测试Next.js API接口
"""

import requests
import json
import time

def test_sync_api():
    """测试同步API接口"""
    
    # 等待开发服务器启动
    time.sleep(5)
    
    base_url = "http://localhost:3000"
    
    print("🧪 测试Next.js API接口...")
    print("=" * 50)
    
    # 1. 测试获取同步状态
    print("1️⃣ 测试获取同步状态...")
    try:
        response = requests.get(f"{base_url}/api/sync?action=status", timeout=10)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 获取状态成功: {data.get('message', 'N/A')}")
        else:
            print(f"❌ 获取状态失败: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")
    
    print()
    
    # 2. 测试获取余额
    print("2️⃣ 测试获取余额...")
    try:
        response = requests.get(f"{base_url}/api/sync?action=balance", timeout=30)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                balance = data.get('data', {}).get('balance', 0)
                print(f"✅ 余额查询成功: {balance}元")
            else:
                print(f"⚠️ 余额查询失败: {data.get('message', 'N/A')}")
        else:
            print(f"❌ 余额查询失败: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")
    
    print()
    
    # 3. 测试同步功能（小规模测试）
    print("3️⃣ 测试同步功能...")
    try:
        sync_data = {
            "maxPages": 1,  # 只测试1页
            "getContent": False
        }
        
        response = requests.post(
            f"{base_url}/api/sync",
            json=sync_data,
            timeout=120  # 2分钟超时
        )
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                stats = data.get('data', {}).get('sync_stats', {})
                print(f"✅ 同步成功!")
                print(f"   同步账户: {stats.get('total_accounts', 0)}")
                print(f"   总文章数: {stats.get('total_articles', 0)}")
                print(f"   费用: {stats.get('total_cost', 0):.2f}元")
                print(f"   耗时: {data.get('data', {}).get('duration', 0)}秒")
            else:
                print(f"❌ 同步失败: {data.get('message', 'N/A')}")
        else:
            print(f"❌ 同步请求失败: {response.text}")
            
    except Exception as e:
        print(f"❌ 同步请求异常: {e}")
    
    print("\n🎉 API接口测试完成!")

if __name__ == "__main__":
    test_sync_api()
