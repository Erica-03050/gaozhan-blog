#!/usr/bin/env python3
"""
简单的API测试脚本 - 验证极致了API是否正常工作
"""

import requests
import json

def test_api():
    """测试API基本功能"""
    
    API_KEY = "JZLebac614e9c88d8b4"
    
    # 7个公众号的biz值和对应分类
    ACCOUNTS = {
        "高瞻的論正人生": {"biz": "Mzk4ODQzMTM3NA==", "category": "politics"},
        "高瞻的智慧人生": {"biz": "MzkwNDg1MzEwMg==", "category": "wisdom"},
        "高瞻的交易人生": {"biz": "MzkxNzgzNTEwNQ==", "category": "trading"},
        "高瞻的文艺人生": {"biz": "Mzk0Mjg1MzQ1NA==", "category": "literary"},
        "高瞻的音乐人生": {"biz": "MzE5OTMxOTg3OQ==", "category": "music"},
        "高瞻的咨询人生": {"biz": "Mzk1NzI0NDY4MQ==", "category": "consulting"},
        "高瞻的术数人生": {"biz": "MzkzODkzNTE2Mg==", "category": "numerology"},
    }
    
    print("🔍 测试极致了API...")
    print(f"API Key: {API_KEY}")
    print(f"公众号数量: {len(ACCOUNTS)}")
    print("=" * 60)
    
    # 测试获取账户余额
    print("1️⃣ 测试获取账户余额...")
    try:
        balance_url = "https://www.dajiala.com/fbmain/monitor/v3/get_remain_money"
        balance_data = {"key": API_KEY}
        
        response = requests.post(balance_url, json=balance_data, timeout=10)
        result = response.json()
        
        if result.get('code') == 0:
            balance = result.get('data', {}).get('money', 0)
            print(f"✅ 账户余额: {balance}元")
        else:
            print(f"❌ 获取余额失败: {result.get('msg', '未知错误')}")
    except Exception as e:
        print(f"❌ 余额查询异常: {e}")
    
    print("\n" + "="*60)
    
    # 测试每个公众号
    total_articles = 0
    account_summary = {}
    
    for account_name, account_info in ACCOUNTS.items():
        print(f"\n2️⃣ 测试公众号: {account_name}")
        print(f"   分类: {account_info['category']}")
        print(f"   BIZ: {account_info['biz']}")
        print("-" * 40)
        
        try:
            list_url = "https://www.dajiala.com/fbmain/monitor/v3/post_history"
            params = {
                'key': API_KEY,
                'biz': account_info['biz'],
                'page': 0,
                'count': 3  # 只获取3篇文章测试
            }
            
            response = requests.get(list_url, params=params, timeout=15)
            result = response.json()
            
            if result.get('code') == 0:
                articles = result.get('data', [])  # data是直接的文章列表
                total = result.get('total_num', 0)  # 总数在total_num字段
                
                print(f"✅ 成功获取文章列表")
                print(f"📊 总文章数: {total}")
                print(f"📄 最新3篇:")
                
                total_articles += total
                account_summary[account_name] = {
                    'total': total,
                    'category': account_info['category'],
                    'status': '正常'
                }
                
                # 显示最新3篇文章
                for i, article in enumerate(articles[:3]):
                    print(f"   {i+1}. {article.get('title', 'N/A')[:40]}...")
                    print(f"      📅 {article.get('post_time_str', 'N/A')}")  # 修改字段名
                    print(f"      👥 {article.get('send_to_fans_num', 0)}推送粉丝")  # 修改字段名
                
                # 测试一篇文章的详情
                if articles:
                    test_url = articles[0].get('url', '')
                    if test_url:
                        print(f"\n   🔍 测试文章详情获取...")
                        detail_url = "https://www.dajiala.com/fbmain/monitor/v3/article_detail"
                        detail_params = {
                            'key': API_KEY,
                            'url': test_url
                        }
                        
                        detail_response = requests.get(detail_url, params=detail_params, timeout=15)
                        detail_result = detail_response.json()
                        
                        if detail_result.get('code') == 0:
                            detail_data = detail_result.get('data', {})
                            content = detail_data.get('content', '')
                            print(f"   ✅ 详情获取成功，内容长度: {len(content)}字符")
                        else:
                            print(f"   ⚠️ 详情获取失败: {detail_result.get('msg', '未知错误')}")
                            
            else:
                print(f"❌ 获取失败: {result.get('msg', '未知错误')}")
                account_summary[account_name] = {
                    'total': 0,
                    'category': account_info['category'],
                    'status': '失败'
                }
                
        except Exception as e:
            print(f"❌ 查询异常: {e}")
            account_summary[account_name] = {
                'total': 0,
                'category': account_info['category'],
                'status': '异常'
            }
    
    # 输出总结
    print("\n" + "="*60)
    print("📊 测试总结")
    print("="*60)
    
    print(f"总文章数量: {total_articles}")
    
    print("\n📋 各公众号状态:")
    for name, info in account_summary.items():
        status_icon = "✅" if info['status'] == '正常' else "❌"
        print(f"  {status_icon} {name} ({info['category']}): {info['total']}篇文章 - {info['status']}")
    
    print("\n📈 分类文章统计:")
    category_stats = {}
    for info in account_summary.values():
        if info['status'] == '正常':
            category = info['category']
            category_stats[category] = category_stats.get(category, 0) + info['total']
    
    for category, count in category_stats.items():
        print(f"  📚 {category}: {count}篇")
    
    print("\n🎉 所有公众号测试完成!")

if __name__ == "__main__":
    test_api()
