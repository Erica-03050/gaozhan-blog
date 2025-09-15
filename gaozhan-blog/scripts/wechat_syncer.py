#!/usr/bin/env python3
"""
微信公众号文章同步脚本 - 完整版
支持多公众号批量同步到Supabase数据库
"""

import requests
import json
import time
import re
import os
import sys
from datetime import datetime, timezone
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
import hashlib
import uuid

@dataclass
class WeChatAccount:
    """微信公众号账户信息"""
    id: str
    name: str
    biz: str
    category_id: str
    is_active: bool = True

@dataclass 
class ArticleData:
    """文章数据结构"""
    title: str
    original_url: str
    cover_image_url: str
    post_time_str: str
    send_to_fans_num: int
    wechat_article_id: str
    content: str = ""
    excerpt: str = ""
    category_id: str = ""
    published_at: str = ""
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return asdict(self)

class WeChatBatchSyncer:
    """微信公众号批量同步器"""
    
    def __init__(self, api_key: str, supabase_url: str = None, supabase_key: str = None):
        """
        初始化同步器
        
        Args:
            api_key: 极致了平台API密钥
            supabase_url: Supabase URL (可选，用于数据库集成)
            supabase_key: Supabase Key (可选，用于数据库集成)
        """
        self.api_key = api_key
        self.base_url = "https://www.dajiala.com"
        self.session = requests.Session()
        
        # 配置公众号账户
        self.accounts = [
            WeChatAccount("1", "高瞻的論正人生", "Mzk4ODQzMTM3NA==", "politics"),
            WeChatAccount("2", "高瞻的智慧人生", "MzkwNDg1MzEwMg==", "wisdom"),
            WeChatAccount("3", "高瞻的交易人生", "MzkxNzgzNTEwNQ==", "trading"),
            WeChatAccount("4", "高瞻的文艺人生", "Mzk0Mjg1MzQ1NA==", "literary"),
            WeChatAccount("5", "高瞻的音乐人生", "MzE5OTMxOTg3OQ==", "music"),
            WeChatAccount("6", "高瞻的咨询人生", "Mzk1NzI0NDY4MQ==", "consulting"),
            WeChatAccount("7", "高瞻的术数人生", "MzkzODkzNTE2Mg==", "numerology"),
        ]
        
        # 同步统计
        self.sync_stats = {
            'total_accounts': 0,
            'total_articles': 0,
            'new_articles': 0,
            'updated_articles': 0,
            'errors': 0,
            'total_cost': 0.0
        }

    def get_account_balance(self) -> float:
        """获取API账户余额"""
        try:
            # 通过获取文章列表API来获取余额信息
            url = f"{self.base_url}/fbmain/monitor/v3/post_history"
            params = {
                'key': self.api_key,
                'biz': self.accounts[0].biz,  # 使用第一个公众号测试
                'page': 0,
                'count': 1
            }
            response = self.session.get(url, params=params, timeout=10)
            result = response.json()
            
            if result.get('code') == 0:
                return result.get('remain_money', 0)
            return 0
        except Exception as e:
            print(f"获取余额失败: {e}")
            return 0

    def get_article_list(self, account: WeChatAccount, page: int = 0, count: int = 5) -> Optional[Dict]:
        """
        获取公众号文章列表
        
        Args:
            account: 公众号账户
            page: 页码
            count: 每页数量
            
        Returns:
            API响应数据
        """
        url = f"{self.base_url}/fbmain/monitor/v3/post_history"
        params = {
            'key': self.api_key,
            'biz': account.biz,
            'page': page,
            'count': count
        }
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('code') == 0:
                return result
            else:
                print(f"获取文章列表失败: {result.get('msg', '未知错误')}")
                return None
                
        except Exception as e:
            print(f"请求失败: {e}")
            return None

    def get_article_content(self, article_url: str) -> Optional[str]:
        """
        获取文章内容
        
        Args:
            article_url: 文章链接
            
        Returns:
            文章内容文本
        """
        url = f"{self.base_url}/fbmain/monitor/v3/article_detail"
        params = {
            'key': self.api_key,
            'url': article_url
        }
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('code') == 0:
                content = result.get('data', {}).get('content', '')
                return self.clean_content(content)
            else:
                print(f"获取文章内容失败: {result.get('msg', '未知错误')}")
                return ""
                
        except Exception as e:
            print(f"获取文章内容异常: {e}")
            return ""

    def clean_content(self, content: str) -> str:
        """清洗文章内容"""
        if not content:
            return ""
        
        # 去除HTML标签
        content = re.sub(r'<[^>]+>', '', content)
        
        # 去除多余空白
        content = re.sub(r'\s+', ' ', content.strip())
        
        # 去除常见推广文字
        remove_patterns = [
            r'点击.*?关注',
            r'长按.*?识别',
            r'扫码.*?关注',
            r'更多.*?请关注',
            r'欢迎.*?分享',
            r'转发.*?朋友圈',
        ]
        
        for pattern in remove_patterns:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE)
        
        return content.strip()

    def generate_slug(self, title: str) -> str:
        """生成文章slug"""
        # 简单的slug生成，可以根据需要改进
        slug = re.sub(r'[^\w\s-]', '', title)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.lower()[:100]

    def generate_excerpt(self, content: str, max_length: int = 200) -> str:
        """生成文章摘要"""
        if not content:
            return ""
        
        # 取前max_length个字符作为摘要
        excerpt = content[:max_length]
        if len(content) > max_length:
            excerpt += "..."
        
        return excerpt

    def parse_article_data(self, raw_article: dict, account: WeChatAccount) -> ArticleData:
        """解析文章数据"""
        
        # 生成文章ID
        url = raw_article.get('url', '')
        wechat_id = hashlib.md5(url.encode()).hexdigest()[:16] if url else str(uuid.uuid4())[:16]
        
        # 解析发布时间
        published_at = ""
        post_time_str = raw_article.get('post_time_str', '')
        if post_time_str:
            try:
                dt = datetime.strptime(post_time_str, '%Y-%m-%d %H:%M:%S')
                published_at = dt.strftime('%Y-%m-%dT%H:%M:%S+00:00')
            except:
                published_at = datetime.now(timezone.utc).isoformat()
        
        return ArticleData(
            title=raw_article.get('title', ''),
            original_url=raw_article.get('url', ''),
            cover_image_url=raw_article.get('cover_url', ''),
            post_time_str=post_time_str,
            send_to_fans_num=raw_article.get('send_to_fans_num', 0),
            wechat_article_id=wechat_id,
            category_id=account.category_id,
            published_at=published_at
        )

    def sync_account(self, account: WeChatAccount, max_pages: int = None, get_content: bool = True) -> Dict:
        """
        同步单个公众号
        
        Args:
            account: 公众号账户
            max_pages: 最大页数限制
            get_content: 是否获取文章内容
            
        Returns:
            同步结果统计
        """
        print(f"\n🔄 开始同步公众号: {account.name}")
        print(f"   分类: {account.category_id}")
        print(f"   BIZ: {account.biz}")
        print("-" * 50)
        
        account_stats = {
            'account_name': account.name,
            'total_articles': 0,
            'new_articles': 0,
            'errors': 0,
            'cost': 0.0,
            'articles': []
        }
        
        try:
            # 先获取第一页了解总数
            first_page = self.get_article_list(account, page=0, count=5)
            if not first_page:
                print(f"❌ 无法获取 {account.name} 的文章列表")
                account_stats['errors'] += 1
                return account_stats
            
            total_articles = first_page.get('total_num', 0)
            total_pages = first_page.get('total_page', 0)
            cost_per_request = first_page.get('cost_money', 0.06)
            
            print(f"📊 总文章数: {total_articles}")
            print(f"📄 总页数: {total_pages}")
            
            # 限制页数
            if max_pages:
                total_pages = min(total_pages, max_pages)
                print(f"⚠️ 限制同步页数: {total_pages}")
            
            account_stats['total_articles'] = total_articles
            
            # 处理所有页面
            for page in range(total_pages):
                print(f"\n📖 处理第 {page + 1}/{total_pages} 页...")
                
                if page == 0:
                    # 使用已获取的第一页数据
                    page_data = first_page
                else:
                    page_data = self.get_article_list(account, page=page, count=5)
                    if not page_data:
                        print(f"⚠️ 第 {page + 1} 页获取失败，跳过")
                        account_stats['errors'] += 1
                        continue
                
                articles = page_data.get('data', [])
                account_stats['cost'] += cost_per_request
                
                print(f"   获取到 {len(articles)} 篇文章")
                
                # 处理每篇文章
                for i, raw_article in enumerate(articles):
                    try:
                        article = self.parse_article_data(raw_article, account)
                        
                        # 获取文章内容
                        if get_content and article.original_url:
                            print(f"     📝 获取内容: {article.title[:30]}...")
                            content = self.get_article_content(article.original_url)
                            article.content = content
                            article.excerpt = self.generate_excerpt(content)
                            account_stats['cost'] += 0.03  # 内容获取费用
                            
                            time.sleep(1)  # 避免请求过频
                        
                        account_stats['articles'].append(article)
                        account_stats['new_articles'] += 1
                        
                        print(f"     ✅ {i+1}. {article.title[:40]}...")
                        
                    except Exception as e:
                        print(f"     ❌ 处理文章失败: {e}")
                        account_stats['errors'] += 1
                
                # 页面间暂停
                time.sleep(2)
            
            print(f"\n✅ {account.name} 同步完成!")
            print(f"   📊 处理文章: {len(account_stats['articles'])}")
            print(f"   💰 消耗费用: {account_stats['cost']:.2f}元")
            
        except Exception as e:
            print(f"❌ {account.name} 同步异常: {e}")
            account_stats['errors'] += 1
        
        return account_stats

    def sync_all_accounts(self, max_pages_per_account: int = 2, get_content: bool = False) -> Dict:
        """
        同步所有公众号
        
        Args:
            max_pages_per_account: 每个公众号最大页数
            get_content: 是否获取文章内容
            
        Returns:
            总体同步结果
        """
        print("🚀 开始批量同步微信公众号文章")
        print("=" * 60)
        
        # 检查余额
        balance = self.get_account_balance()
        print(f"💰 当前余额: {balance}元")
        
        if balance < 1:
            print("⚠️ 余额不足1元，建议充值后再进行同步")
            return self.sync_stats
        
        start_time = time.time()
        all_results = []
        
        for account in self.accounts:
            if not account.is_active:
                continue
                
            account_result = self.sync_account(
                account, 
                max_pages=max_pages_per_account,
                get_content=get_content
            )
            all_results.append(account_result)
            
            # 更新总统计
            self.sync_stats['total_accounts'] += 1
            self.sync_stats['total_articles'] += len(account_result['articles'])
            self.sync_stats['new_articles'] += account_result['new_articles']
            self.sync_stats['errors'] += account_result['errors']
            self.sync_stats['total_cost'] += account_result['cost']
        
        end_time = time.time()
        duration = int(end_time - start_time)
        
        # 输出总结
        print("\n" + "=" * 60)
        print("📊 同步总结")
        print("=" * 60)
        print(f"⏱️ 总耗时: {duration}秒")
        print(f"🏢 同步账户: {self.sync_stats['total_accounts']}")
        print(f"📄 总文章数: {self.sync_stats['total_articles']}")
        print(f"✅ 新增文章: {self.sync_stats['new_articles']}")
        print(f"❌ 错误数量: {self.sync_stats['errors']}")
        print(f"💰 总费用: {self.sync_stats['total_cost']:.2f}元")
        
        # 分账户统计
        print(f"\n📋 各账户详情:")
        for result in all_results:
            status = "✅" if result['errors'] == 0 else "⚠️"
            print(f"  {status} {result['account_name']}: {len(result['articles'])}篇 (费用: {result['cost']:.2f}元)")
        
        result = {
            'sync_stats': self.sync_stats,
            'account_results': all_results,
            'duration': duration
        }
        
        return result

    def save_results_to_json(self, results: Dict, filename: str = None):
        """保存同步结果到JSON文件"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"sync_results_{timestamp}.json"
        
        try:
            # 转换ArticleData对象为字典
            processed_results = results.copy()
            for account_result in processed_results['account_results']:
                account_result['articles'] = [
                    article.to_dict() if hasattr(article, 'to_dict') else article
                    for article in account_result['articles']
                ]
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(processed_results, f, ensure_ascii=False, indent=2)
            
            print(f"\n💾 同步结果已保存到: {filename}")
            
        except Exception as e:
            print(f"❌ 保存文件失败: {e}")

def main():
    """主函数"""
    API_KEY = "JZLebac614e9c88d8b4"
    
    print("🎯 微信公众号文章批量同步工具")
    print("=" * 60)
    
    # 初始化同步器
    syncer = WeChatBatchSyncer(API_KEY)
    
    # 执行同步 (限制每个账户2页，不获取内容以节省费用)
    results = syncer.sync_all_accounts(max_pages_per_account=2, get_content=False)
    
    # 保存结果
    syncer.save_results_to_json(results)
    
    print("\n🎉 同步任务完成!")

if __name__ == "__main__":
    main()
