#!/usr/bin/env python3
"""
正确获取HTML格式文章内容
使用接口13: /fbmain/monitor/v3/article_html
"""

import requests
import json
import time
import os
from datetime import datetime

class HTMLContentFetcher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.dajiala.com"
        self.session = requests.Session()

    def test_single_article(self, article_url: str) -> dict:
        """测试单篇文章的HTML内容获取"""
        print(f"🧪 测试获取文章HTML内容...")
        print(f"📋 文章URL: {article_url}")
        
        # 使用正确的HTML接口
        url = f"{self.base_url}/fbmain/monitor/v3/article_html"
        params = {
            'key': self.api_key,
            'url': article_url
        }
        
        try:
            print(f"🔗 调用接口: {url}")
            print(f"📊 参数: {params}")
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            print(f"✅ HTTP状态码: {response.status_code}")
            
            result = response.json()
            print(f"📄 API响应: {json.dumps(result, ensure_ascii=False, indent=2)[:500]}...")
            
            if result.get('code') == 0:
                data = result.get('data', {})
                content = data.get('html', '')  # 修正：使用html字段
                
                print(f"✅ 成功获取HTML内容!")
                print(f"📏 内容长度: {len(content)} 字符")
                print(f"📝 内容预览: {content[:200]}...")
                
                return data
            else:
                print(f"❌ API返回错误: code={result.get('code')}, msg={result.get('msg')}")
                return {}
                
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return {}

    def get_articles_with_html_content(self, sync_file: str, test_only: bool = False):
        """为文章获取HTML内容"""
        
        print(f"🚀 开始获取文章HTML内容...")
        print(f"📁 同步文件: {sync_file}")
        
        # 读取同步数据
        with open(sync_file, 'r', encoding='utf-8') as f:
            sync_data = json.load(f)
        
        if test_only:
            # 只测试第一篇文章
            first_article = None
            for account in sync_data['account_results']:
                if account['articles']:
                    first_article = account['articles'][0]
                    break
            
            if first_article and first_article.get('original_url'):
                print(f"🧪 测试模式: 只测试第一篇文章")
                return self.test_single_article(first_article['original_url'])
            else:
                print("❌ 没有找到可测试的文章")
                return
        
        total_articles = 0
        success_count = 0
        total_cost = 0.0
        
        # 遍历所有文章
        for account_idx, account in enumerate(sync_data['account_results']):
            account_name = account['account_name']
            print(f"\n📰 处理账户: {account_name}")
            
            for article_idx, article in enumerate(account['articles'][:5]):  # 先测试每个账户的前5篇
                total_articles += 1
                article_url = article.get('original_url', '')
                article_title = article.get('title', 'N/A')
                
                if not article_url:
                    print(f"  ⚠️ 跳过（无URL）: {article_title[:50]}...")
                    continue
                
                print(f"  🔍 [{article_idx+1}] {article_title[:50]}...")
                
                # 使用正确的HTML接口
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
                        data = result.get('data', {})
                        html_content = data.get('html', '')  # 修正：使用html字段而不是content字段
                        
                        if html_content and len(html_content) > 100:
                            # 更新文章内容
                            article['content_html'] = html_content
                            article['content'] = html_content  # 保存HTML格式
                            
                            # 生成纯文本摘要
                            import re
                            plain_text = re.sub(r'<[^>]+>', '', html_content)
                            plain_text = plain_text.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>')
                            article['excerpt'] = plain_text[:300].strip() + ('...' if len(plain_text) > 300 else '')
                            
                            success_count += 1
                            total_cost += 0.04  # HTML接口费用
                            
                            print(f"    ✅ 成功! 长度: {len(html_content)} 字符")
                        else:
                            print(f"    ⚠️ 内容为空")
                    else:
                        error_msg = result.get('msg', '未知错误')
                        print(f"    ❌ 失败: {error_msg}")
                        
                except Exception as e:
                    print(f"    ❌ 异常: {e}")
                
                # 避免请求过频
                time.sleep(1.5)
        
        # 保存更新后的数据
        updated_filename = sync_file.replace('.json', '_with_html.json')
        with open(updated_filename, 'w', encoding='utf-8') as f:
            json.dump(sync_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n📊 处理完成:")
        print(f"   总文章数: {total_articles}")
        print(f"   成功获取: {success_count}")
        print(f"   成功率: {success_count/total_articles*100:.1f}%" if total_articles > 0 else "0%")
        print(f"   总费用: {total_cost:.2f}元")
        print(f"   保存到: {updated_filename}")

def main():
    """主函数"""
    API_KEY = "JZLebac614e9c88d8b4"
    
    # 查找最新的同步文件
    sync_files = [f for f in os.listdir('.') if f.startswith('sync_results_') and f.endswith('.json') and 'html' not in f]
    if not sync_files:
        print("❌ 未找到同步结果文件")
        return
    
    latest_file = sorted(sync_files)[-1]
    print(f"🎯 使用文件: {latest_file}")
    
    fetcher = HTMLContentFetcher(API_KEY)
    
    # 先测试一篇文章
    print("🧪 先测试一篇文章的获取效果...")
    test_result = fetcher.get_articles_with_html_content(latest_file, test_only=True)
    
    if test_result and test_result.get('content'):
        print("\n✅ 测试成功! 是否继续获取所有文章的HTML内容？")
        response = input("继续？(y/n): ")
        if response.lower() == 'y':
            fetcher.get_articles_with_html_content(latest_file, test_only=False)
    else:
        print("\n❌ 测试失败，请检查API配置或文章链接")

if __name__ == "__main__":
    main()
