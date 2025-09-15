#!/usr/bin/env python3
"""
获取完整文章内容脚本
为现有的文章获取HTML格式的完整内容
"""

import requests
import json
import time
import os
from datetime import datetime

class ContentFetcher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.dajiala.com"
        self.session = requests.Session()

    def get_article_html_content(self, article_url: str) -> dict:
        """获取文章的HTML内容"""
        url = f"{self.base_url}/fbmain/monitor/v3/article_html"
        params = {
            'key': self.api_key,
            'url': article_url
        }
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('code') == 0:
                return result.get('data', {})
            else:
                print(f"获取HTML内容失败: {result.get('msg', '未知错误')}")
                return {}
                
        except Exception as e:
            print(f"请求失败: {e}")
            return {}

    def update_articles_with_content(self, sync_file: str):
        """为同步文件中的文章添加完整内容"""
        
        print(f"🔄 开始为文章获取完整内容...")
        print(f"📁 读取文件: {sync_file}")
        
        # 读取现有同步数据
        with open(sync_file, 'r', encoding='utf-8') as f:
            sync_data = json.load(f)
        
        total_articles = 0
        updated_articles = 0
        total_cost = 0.0
        
        # 遍历所有账户的文章
        for account_idx, account in enumerate(sync_data['account_results']):
            account_name = account['account_name']
            print(f"\n📰 处理账户: {account_name}")
            
            for article_idx, article in enumerate(account['articles']):
                total_articles += 1
                article_url = article.get('original_url', '')
                article_title = article.get('title', 'N/A')
                
                if not article_url:
                    print(f"  ⚠️ 跳过文章（无URL）: {article_title[:50]}...")
                    continue
                
                # 检查是否已有内容
                if article.get('content') and len(article['content']) > 100:
                    print(f"  ✅ 已有内容: {article_title[:50]}...")
                    continue
                
                print(f"  🔍 获取内容: {article_title[:50]}...")
                
                # 获取HTML内容
                html_data = self.get_article_html_content(article_url)
                
                if html_data:
                    # 更新文章内容
                    article['content'] = html_data.get('content', '')
                    article['content_html'] = html_data.get('content', '')  # 保留HTML格式
                    
                    # 生成摘要
                    plain_text = html_data.get('content', '').replace('<', ' <').replace('>', '> ')
                    import re
                    plain_text = re.sub(r'<[^>]+>', '', plain_text)
                    article['excerpt'] = plain_text[:200].strip() + ('...' if len(plain_text) > 200 else '')
                    
                    updated_articles += 1
                    total_cost += 0.04  # HTML内容获取费用
                    
                    print(f"    ✅ 成功获取 {len(article['content'])} 字符")
                else:
                    print(f"    ❌ 获取失败")
                
                # 避免请求过频
                time.sleep(1.5)
        
        # 更新统计信息
        sync_data['content_update_stats'] = {
            'total_articles': total_articles,
            'updated_articles': updated_articles,
            'update_time': datetime.now().isoformat(),
            'additional_cost': total_cost
        }
        
        # 保存更新后的数据
        updated_filename = sync_file.replace('.json', '_with_content.json')
        with open(updated_filename, 'w', encoding='utf-8') as f:
            json.dump(sync_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 内容更新完成!")
        print(f"📊 总文章数: {total_articles}")
        print(f"🔄 更新文章数: {updated_articles}")
        print(f"💰 额外费用: {total_cost:.2f}元")
        print(f"📁 保存到: {updated_filename}")

def main():
    """主函数"""
    API_KEY = "JZLebac614e9c88d8b4"
    
    # 查找最新的同步文件
    sync_files = [f for f in os.listdir('.') if f.startswith('sync_results_') and f.endswith('.json')]
    if not sync_files:
        print("❌ 未找到同步结果文件")
        return
    
    latest_file = sorted(sync_files)[-1]
    print(f"🎯 使用最新同步文件: {latest_file}")
    
    # 确认操作
    response = input(f"\n是否要为 {latest_file} 中的文章获取完整内容？(y/n): ")
    if response.lower() != 'y':
        print("操作已取消")
        return
    
    # 创建内容获取器
    fetcher = ContentFetcher(API_KEY)
    
    # 获取内容
    fetcher.update_articles_with_content(latest_file)

if __name__ == "__main__":
    main()

