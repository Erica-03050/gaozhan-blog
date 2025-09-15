#!/usr/bin/env python3
"""
调试API响应数据结构
"""

import requests
import json

def debug_api():
    API_KEY = "JZLebac614e9c88d8b4"
    BIZ = "Mzk4ODQzMTM3NA=="  # 高瞻的論正人生
    
    print("🔍 调试API响应数据结构...")
    print(f"测试公众号: 高瞻的論正人生")
    print(f"BIZ: {BIZ}")
    print("-" * 50)
    
    try:
        list_url = "https://www.dajiala.com/fbmain/monitor/v3/post_history"
        params = {
            'key': API_KEY,
            'biz': BIZ,
            'page': 0,
            'count': 3
        }
        
        response = requests.get(list_url, params=params, timeout=15)
        print(f"HTTP状态码: {response.status_code}")
        
        # 打印原始响应
        print("\n📄 原始响应内容:")
        print(response.text)
        
        # 尝试解析JSON
        try:
            result = response.json()
            print(f"\n📊 JSON解析成功:")
            print(f"响应类型: {type(result)}")
            
            if isinstance(result, dict):
                print(f"响应键: {list(result.keys())}")
                print(f"Code: {result.get('code')}")
                print(f"Message: {result.get('msg')}")
                
                if 'data' in result:
                    data = result['data']
                    print(f"Data类型: {type(data)}")
                    if isinstance(data, dict):
                        print(f"Data键: {list(data.keys())}")
                    elif isinstance(data, list):
                        print(f"Data长度: {len(data)}")
                        if data:
                            print(f"第一个元素类型: {type(data[0])}")
                            if isinstance(data[0], dict):
                                print(f"第一个元素键: {list(data[0].keys())}")
            
            # 美化输出完整JSON
            print(f"\n📋 完整JSON结构:")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析失败: {e}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

if __name__ == "__main__":
    debug_api()
