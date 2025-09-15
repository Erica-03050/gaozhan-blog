#!/usr/bin/env python3
"""
调试HTML API响应结构
"""

import requests
import json

def debug_html_api():
    API_KEY = "JZLebac614e9c88d8b4"
    
    # 测试文章URL
    test_url = "https://mp.weixin.qq.com/s/tWg850z3M3GdaoiRFJ4vAg"
    
    print("🧪 调试HTML API响应结构")
    print(f"📋 测试URL: {test_url}")
    print("-" * 60)
    
    # 调用HTML接口
    api_url = "https://www.dajiala.com/fbmain/monitor/v3/article_html"
    params = {
        'key': API_KEY,
        'url': test_url
    }
    
    try:
        response = requests.get(api_url, params=params, timeout=30)
        result = response.json()
        
        print("📄 完整API响应:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
        if result.get('code') == 0:
            data = result.get('data', {})
            print(f"\n📊 数据字段分析:")
            for key, value in data.items():
                if isinstance(value, str):
                    print(f"  {key}: {len(value)} 字符 - {str(value)[:100]}...")
                else:
                    print(f"  {key}: {type(value)} - {value}")
        
    except Exception as e:
        print(f"❌ 请求失败: {e}")

if __name__ == "__main__":
    debug_html_api()

