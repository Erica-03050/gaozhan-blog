#!/usr/bin/env python3
"""
获取公众号主体信息
获取每个公众号的详细信息：介绍、头像、类型等
"""

import requests
import json
import time
import os
from datetime import datetime
from typing import Dict, List, Optional

class AccountInfoFetcher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.dajiala.com"
        self.session = requests.Session()
        
        # 7个公众号信息
        self.accounts = [
            {
                'name': '高瞻的論正人生',
                'biz': 'Mzk4ODQzMTM3NA==',
                'category_id': 'politics',
                'category_name': '论正人生'
            },
            {
                'name': '高瞻的智慧人生',
                'biz': 'MzkwNDg1MzEwMg==',
                'category_id': 'wisdom',
                'category_name': '智慧人生'
            },
            {
                'name': '高瞻的交易人生',
                'biz': 'MzkxNzgzNTEwNQ==',
                'category_id': 'trading',
                'category_name': '交易人生'
            },
            {
                'name': '高瞻的文艺人生',
                'biz': 'Mzk0Mjg1MzQ1NA==',
                'category_id': 'literary',
                'category_name': '文艺人生'
            },
            {
                'name': '高瞻的音乐人生',
                'biz': 'MzE5OTMxOTg3OQ==',
                'category_id': 'music',
                'category_name': '音乐人生'
            },
            {
                'name': '高瞻的咨询人生',
                'biz': 'Mzk1NzI0NDY4MQ==',
                'category_id': 'consulting',
                'category_name': '咨询人生'
            },
            {
                'name': '高瞻的术数人生',
                'biz': 'MzkzODkzNTE2Mg==',
                'category_id': 'numerology',
                'category_name': '术数人生'
            }
        ]
        
        self.stats = {
            'total_accounts': len(self.accounts),
            'success_count': 0,
            'failed_count': 0,
            'total_cost': 0.0
        }
    
    def get_account_principal_info(self, biz: str) -> Dict:
        """获取公众号主体信息 - 0.5元/次"""
        api_url = f"{self.base_url}/fbmain/monitor/v3/principal_info"
        params = {
            'key': self.api_key,
            'biz': biz
        }
        
        try:
            print(f"📋 获取主体信息: {biz}")
            response = self.session.get(api_url, params=params, timeout=30)
            result = response.json()
            
            if result.get('code') == 0:
                data = result.get('data', {})
                print(f"✅ 成功获取主体信息")
                self.stats['success_count'] += 1
                self.stats['total_cost'] += 0.5
                return {
                    'success': True,
                    'data': data,
                    'cost': 0.5
                }
            else:
                error_msg = result.get('msg', '未知错误')
                print(f"❌ 获取失败: {error_msg}")
                self.stats['failed_count'] += 1
                return {
                    'success': False,
                    'error': error_msg,
                    'cost': 0.5
                }
                
        except Exception as e:
            print(f"💥 异常错误: {e}")
            self.stats['failed_count'] += 1
            return {
                'success': False,
                'error': str(e),
                'cost': 0.0
            }
    
    def get_account_basic_info(self, biz: str) -> Dict:
        """获取公众号基础信息 - 0.5元/次"""
        api_url = f"{self.base_url}/fbmain/monitor/v3/avatar_type"
        params = {
            'key': self.api_key,
            'biz': biz
        }
        
        try:
            print(f"🏛️  获取基础信息: {biz}")
            response = self.session.get(api_url, params=params, timeout=30)
            result = response.json()
            
            if result.get('code') == 0:
                data = result.get('data', {})
                print(f"✅ 成功获取基础信息")
                self.stats['success_count'] += 1
                self.stats['total_cost'] += 0.5
                return {
                    'success': True,
                    'data': data,
                    'cost': 0.5
                }
            else:
                error_msg = result.get('msg', '未知错误')
                print(f"❌ 获取失败: {error_msg}")
                self.stats['failed_count'] += 1
                return {
                    'success': False,
                    'error': error_msg,
                    'cost': 0.5
                }
                
        except Exception as e:
            print(f"💥 异常错误: {e}")
            self.stats['failed_count'] += 1
            return {
                'success': False,
                'error': str(e),
                'cost': 0.0
            }
    
    def fetch_all_account_info(self) -> Dict:
        """获取所有公众号的完整信息"""
        print("🚀 开始获取所有公众号信息")
        print("=" * 60)
        
        account_info_results = []
        
        for account in self.accounts:
            print(f"\n📱 处理公众号: {account['name']}")
            print(f"🔗 BIZ: {account['biz']}")
            print(f"📂 分类: {account['category_name']}")
            
            account_result = {
                'name': account['name'],
                'biz': account['biz'],
                'category_id': account['category_id'],
                'category_name': account['category_name'],
                'principal_info': None,
                'basic_info': None,
                'fetch_time': datetime.now().isoformat(),
                'total_cost': 0.0
            }
            
            # 获取主体信息
            principal_result = self.get_account_principal_info(account['biz'])
            if principal_result['success']:
                account_result['principal_info'] = principal_result['data']
            account_result['total_cost'] += principal_result['cost']
            
            # 稍作延迟
            time.sleep(2)
            
            # 获取基础信息
            basic_result = self.get_account_basic_info(account['biz'])
            if basic_result['success']:
                account_result['basic_info'] = basic_result['data']
            account_result['total_cost'] += basic_result['cost']
            
            account_info_results.append(account_result)
            
            print(f"💰 单个账号费用: {account_result['total_cost']:.2f} 元")
            
            # 稍作延迟避免频率限制
            time.sleep(2)
        
        # 整理最终结果
        final_result = {
            'fetch_stats': self.stats.copy(),
            'fetch_time': datetime.now().isoformat(),
            'account_info': account_info_results
        }
        
        return final_result
    
    def save_account_info(self, data: Dict, filename: str = None):
        """保存公众号信息到JSON文件"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"account_info_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"💾 已保存公众号信息到: {filename}")
            return filename
            
        except Exception as e:
            print(f"💥 保存文件失败: {e}")
            return None

def main():
    API_KEY = "JZLebac614e9c88d8b4"
    
    print("🚀 公众号信息获取器启动")
    print("=" * 60)
    print("📋 将获取以下信息:")
    print("   - 公众号主体信息 (主体名称、认证类型等)")
    print("   - 公众号基础信息 (头像、简介、账号类型等)")
    print("💰 预估费用: 7个公众号 × 2个接口 × 0.5元 = 7元")
    print("=" * 60)
    
    # 确认是否继续
    confirm = input("是否继续获取公众号信息？(y/N): ").strip().lower()
    if confirm not in ['y', 'yes']:
        print("❌ 操作已取消")
        return
    
    # 创建获取器并开始处理
    fetcher = AccountInfoFetcher(API_KEY)
    results = fetcher.fetch_all_account_info()
    
    # 保存结果
    filename = fetcher.save_account_info(results)
    
    if filename:
        print(f"\n🎉 公众号信息获取完成！")
        print(f"📊 统计信息:")
        print(f"   - 总公众号数: {fetcher.stats['total_accounts']}")
        print(f"   - 成功获取: {fetcher.stats['success_count']}")
        print(f"   - 获取失败: {fetcher.stats['failed_count']}")
        print(f"   - 总费用: {fetcher.stats['total_cost']:.2f} 元")
        print(f"💾 结果已保存到: {filename}")
    else:
        print("\n❌ 获取过程中出现错误")

if __name__ == "__main__":
    main()

