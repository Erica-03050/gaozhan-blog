#!/usr/bin/env python3
"""
智能内容获取器 - 批量获取微信文章HTML内容
使用正确的API字段(html)来获取完整的文章内容
"""

import requests
import json
import time
import os
from datetime import datetime
from typing import Dict, List, Optional

class SmartContentFetcher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.dajiala.com"
        self.session = requests.Session()
        self.stats = {
            'total_articles': 0,
            'success_count': 0,
            'failed_count': 0,
            'restricted_count': 0,
            'total_cost': 0.0
        }
    
    def get_article_html(self, url: str) -> Dict:
        """获取文章HTML内容"""
        api_url = f"{self.base_url}/fbmain/monitor/v3/article_html"
        params = {
            'key': self.api_key,
            'url': url
        }
        
        try:
            print(f"📝 获取内容: {url[:80]}...")
            response = self.session.get(api_url, params=params, timeout=30)
            result = response.json()
            
            if result.get('code') == 0:
                data = result.get('data', {})
                html_content = data.get('html', '')  # 使用正确的html字段
                
                if html_content:
                    print(f"✅ 成功获取 ({len(html_content)} 字符)")
                    self.stats['success_count'] += 1
                    self.stats['total_cost'] += 0.04  # HTML接口费用
                    return {
                        'success': True,
                        'content': html_content,
                        'cost': 0.04
                    }
                else:
                    print(f"⚠️  内容为空")
                    self.stats['failed_count'] += 1
                    return {
                        'success': False,
                        'content': '',
                        'error': 'empty_content',
                        'cost': 0.04
                    }
            else:
                error_msg = result.get('msg', '未知错误')
                if '限制访问' in error_msg or 'restricted' in error_msg.lower():
                    print(f"🚫 访问受限: {error_msg}")
                    self.stats['restricted_count'] += 1
                    return {
                        'success': False,
                        'content': '',
                        'error': 'restricted',
                        'cost': 0.04
                    }
                else:
                    print(f"❌ API错误: {error_msg}")
                    self.stats['failed_count'] += 1
                    return {
                        'success': False,
                        'content': '',
                        'error': error_msg,
                        'cost': 0.04
                    }
                    
        except Exception as e:
            print(f"💥 异常错误: {e}")
            self.stats['failed_count'] += 1
            return {
                'success': False,
                'content': '',
                'error': str(e),
                'cost': 0.0
            }
    
    def process_sync_file(self, filename: str) -> bool:
        """处理同步文件，为所有文章获取HTML内容"""
        if not os.path.exists(filename):
            print(f"❌ 文件不存在: {filename}")
            return False
        
        print(f"📂 处理文件: {filename}")
        
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                sync_data = json.load(f)
            
            # 统计总文章数
            total_articles = 0
            for account_result in sync_data['account_results']:
                total_articles += len(account_result['articles'])
            
            self.stats['total_articles'] = total_articles
            print(f"📊 总共需要处理 {total_articles} 篇文章")
            
            # 处理每个公众号的文章
            for account_idx, account_result in enumerate(sync_data['account_results']):
                account_name = account_result['account_name']
                articles = account_result['articles']
                
                print(f"\n🏛️  处理公众号: {account_name} ({len(articles)} 篇文章)")
                
                for article_idx, article in enumerate(articles):
                    url = article.get('original_url', '')
                    if not url:
                        print(f"⚠️  文章 {article_idx + 1} 缺少URL，跳过")
                        continue
                    
                    # 检查是否已有HTML内容
                    if article.get('content_html') and len(article.get('content_html', '')) > 100:
                        print(f"✓ 文章 {article_idx + 1} 已有内容，跳过")
                        continue
                    
                    # 获取HTML内容
                    result = self.get_article_html(url)
                    
                    # 更新文章数据
                    article['content_html'] = result['content']
                    article['fetch_success'] = result['success']
                    article['fetch_error'] = result.get('error', '')
                    article['fetch_cost'] = result['cost']
                    article['fetch_time'] = datetime.now().isoformat()
                    
                    # 为避免频率限制，稍作延迟
                    time.sleep(1)
                    
                    # 每10篇文章保存一次
                    if (article_idx + 1) % 10 == 0:
                        self._save_intermediate_result(filename, sync_data)
                        print(f"💾 已保存中间结果 ({article_idx + 1}/{len(articles)})")
            
            # 更新统计信息
            sync_data['content_fetch_stats'] = self.stats.copy()
            sync_data['content_fetch_time'] = datetime.now().isoformat()
            
            # 保存最终结果
            self._save_final_result(filename, sync_data)
            
            print(f"\n🎉 处理完成！")
            print(f"📊 统计信息:")
            print(f"   - 总文章数: {self.stats['total_articles']}")
            print(f"   - 成功获取: {self.stats['success_count']}")
            print(f"   - 获取失败: {self.stats['failed_count']}")
            print(f"   - 访问受限: {self.stats['restricted_count']}")
            print(f"   - 总费用: {self.stats['total_cost']:.2f} 元")
            
            return True
            
        except Exception as e:
            print(f"💥 处理文件时出错: {e}")
            return False
    
    def _save_intermediate_result(self, original_filename: str, data: dict):
        """保存中间结果"""
        backup_filename = original_filename.replace('.json', '_backup.json')
        with open(backup_filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def _save_final_result(self, filename: str, data: dict):
        """保存最终结果"""
        # 保存到原文件
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 创建带时间戳的备份
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = filename.replace('.json', f'_with_content_{timestamp}.json')
        with open(backup_filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 已保存最终结果到: {filename}")
        print(f"💾 备份文件: {backup_filename}")

def find_latest_sync_file() -> Optional[str]:
    """查找最新的同步文件"""
    sync_files = []
    for filename in os.listdir('.'):
        if filename.startswith('sync_results_') and filename.endswith('.json'):
            sync_files.append(filename)
    
    if not sync_files:
        return None
    
    # 按修改时间排序，返回最新的
    sync_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    return sync_files[0]

def main():
    API_KEY = "JZLebac614e9c88d8b4"
    
    print("🚀 智能内容获取器启动")
    print("=" * 60)
    
    # 查找最新的同步文件
    sync_file = find_latest_sync_file()
    if not sync_file:
        print("❌ 未找到同步结果文件")
        print("请先运行 wechat_syncer.py 获取文章列表")
        return
    
    print(f"📂 找到同步文件: {sync_file}")
    
    # 创建获取器并处理文件
    fetcher = SmartContentFetcher(API_KEY)
    success = fetcher.process_sync_file(sync_file)
    
    if success:
        print("\n✅ 所有文章内容获取完成！")
        print("现在可以在网站上看到完整的文章内容了。")
    else:
        print("\n❌ 内容获取过程中出现错误")

if __name__ == "__main__":
    main()

