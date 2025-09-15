#!/usr/bin/env python3
"""
微信公众号文章同步脚本
使用极致了API平台获取公众号历史文章并同步到博客系统
"""

import requests
import json
import time
import re
import os
import sys
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass
import hashlib

@dataclass
class WeChatAccount:
    """微信公众号账户信息"""
    name: str
    biz: str
    category_id: str
    
@dataclass 
class ArticleData:
    """文章数据结构"""
    title: str
    url: str
    cover_url: str
    post_time_str: str
    send_to_fans_num: int
    content: str = ""
    category_id: str = ""
    wechat_article_id: str = ""

class WeChatArticleSync:
    def __init__(self, api_key: str, biz: str):
        """
        初始化同步器
        
        Args:
            api_key: 极致了平台API密钥
            biz: 目标公众号的biz值
        """
        self.api_key = api_key
        self.biz = biz
        self.base_url = "https://www.dajiala.com"
        self.session = requests.Session()
        
        # 分类关键词映射到8个板块
        self.category_keywords = {
            'literary': ['文艺', '诗词', '文学', '书法', '艺术', '文化', '古典', '雅致'],
            'numerology': ['数术', '易经', '风水', '占卜', '预测', '玄学', '命理', '八卦'],
            'wisdom': ['智慧', '哲学', '思考', '感悟', '人生', '修养', '境界', '觉悟'],
            'trading': ['交易', '投资', '股票', '金融', '市场', '经济', '财富', '投机'],
            'consulting': ['咨询', '建议', '方案', '策略', '规划', '顾问', '指导', '解决'],
            'tax': ['税务', '税收', '财税', '税筹', '合规', '税法', '避税', '纳税'],
            'music': ['音乐', '歌曲', '音律', '乐器', '演奏', '声音', '旋律', '节拍'],
            'politics': ['論正', '时政', '政治', '评论', '观点', '社会', '公共', '治理']
        }

    def get_article_list(self, page: int = 0, count: int = 5) -> Optional[Dict]:
        """
        获取公众号历史文章列表
        
        Args:
            page: 页码（从0开始）
            count: 每页文章数量（最大5）
            
        Returns:
            API响应数据或None
        """
        url = f"{self.base_url}/fbmain/monitor/v3/post_history"
        
        params = {
            'key': self.api_key,
            'biz': self.biz,
            'page': page,
            'count': count
        }
        
        try:
            print(f"正在获取第{page + 1}页文章列表...")
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            if data.get('code') == 0:
                return data.get('data', {})
            else:
                print(f"API错误: {data.get('msg', '未知错误')}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"请求失败: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"JSON解析失败: {e}")
            return None

    def get_article_detail(self, article_url: str) -> Optional[Dict]:
        """
        获取文章详细内容
        
        Args:
            article_url: 文章链接
            
        Returns:
            文章详情数据或None
        """
        url = f"{self.base_url}/fbmain/monitor/v3/article_detail"
        
        params = {
            'key': self.api_key,
            'url': article_url
        }
        
        try:
            print(f"正在获取文章详情: {article_url[:50]}...")
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            if data.get('code') == 0:
                return data.get('data', {})
            else:
                print(f"获取文章详情失败: {data.get('msg', '未知错误')}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"请求失败: {e}")
            return None

    def classify_article(self, title: str, content: str) -> str:
        """
        根据标题和内容自动分类文章
        
        Args:
            title: 文章标题
            content: 文章内容
            
        Returns:
            分类ID（默认为'wisdom'）
        """
        text = (title + " " + content).lower()
        
        # 计算每个分类的关键词匹配分数
        scores = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                scores[category] = score
        
        # 返回得分最高的分类，如果没有匹配则默认为智慧板块
        if scores:
            return max(scores.items(), key=lambda x: x[1])[0]
        else:
            return 'wisdom'

    def clean_content(self, content: str) -> str:
        """
        清洗文章内容
        
        Args:
            content: 原始内容
            
        Returns:
            清洗后的内容
        """
        if not content:
            return ""
        
        # 去除多余的空白字符
        content = re.sub(r'\s+', ' ', content.strip())
        
        # 去除常见的公众号推广文字
        remove_patterns = [
            r'点击.*?关注',
            r'长按.*?识别',
            r'扫码.*?关注',
            r'更多.*?请关注',
            r'欢迎.*?分享',
        ]
        
        for pattern in remove_patterns:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE)
        
        return content.strip()

    def sync_articles(self, max_pages: int = 5) -> List[Dict]:
        """
        同步文章数据
        
        Args:
            max_pages: 最大页数
            
        Returns:
            同步的文章列表
        """
        all_articles = []
        
        for page in range(max_pages):
            # 获取文章列表
            article_list_data = self.get_article_list(page)
            if not article_list_data:
                print(f"第{page + 1}页获取失败，停止同步")
                break
            
            articles = article_list_data.get('list', [])
            if not articles:
                print(f"第{page + 1}页没有更多文章")
                break
            
            print(f"第{page + 1}页获取到{len(articles)}篇文章")
            
            for article in articles:
                try:
                    # 基本信息
                    article_info = {
                        'title': article.get('title', ''),
                        'url': article.get('url', ''),
                        'cover': article.get('cover', ''),
                        'abstract': article.get('abstract', ''),
                        'publish_time': article.get('publish_time', ''),
                        'read_num': article.get('read_num', 0),
                        'like_num': article.get('like_num', 0),
                    }
                    
                    # 获取详细内容
                    if article_info['url']:
                        detail_data = self.get_article_detail(article_info['url'])
                        if detail_data:
                            content = detail_data.get('content', '')
                            article_info['content'] = self.clean_content(content)
                            article_info['author'] = detail_data.get('author', '')
                        else:
                            article_info['content'] = ''
                            article_info['author'] = ''
                        
                        # 自动分类
                        article_info['category'] = self.classify_article(
                            article_info['title'], 
                            article_info['content']
                        )
                        
                        all_articles.append(article_info)
                        print(f"✓ 已处理: {article_info['title'][:30]}... -> {article_info['category']}")
                    
                    # 避免请求过于频繁
                    time.sleep(1)
                    
                except Exception as e:
                    print(f"处理文章时出错: {e}")
                    continue
            
            # 页面间暂停
            time.sleep(2)
        
        return all_articles

    def save_to_json(self, articles: List[Dict], filename: str = None):
        """
        保存文章数据到JSON文件
        
        Args:
            articles: 文章列表
            filename: 文件名（可选）
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"wechat_articles_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(articles, f, ensure_ascii=False, indent=2)
            print(f"✓ 文章数据已保存到: {filename}")
        except Exception as e:
            print(f"保存文件失败: {e}")

def main():
    """主函数 - 测试同步功能"""
    
    # 配置信息
    API_KEY = "JZLebac614e9c88d8b4"
    BIZ = "Mzk4ODQzMTM3NA=="
    
    print("=" * 60)
    print("微信公众号文章同步测试")
    print("=" * 60)
    
    # 初始化同步器
    syncer = WeChatArticleSync(API_KEY, BIZ)
    
    # 测试获取文章列表（先获取2页测试）
    try:
        articles = syncer.sync_articles(max_pages=2)
        
        if articles:
            print(f"\n✓ 成功同步{len(articles)}篇文章")
            
            # 分类统计
            category_count = {}
            for article in articles:
                category = article.get('category', 'unknown')
                category_count[category] = category_count.get(category, 0) + 1
            
            print("\n📊 分类统计:")
            for category, count in category_count.items():
                print(f"  {category}: {count}篇")
            
            # 保存到文件
            syncer.save_to_json(articles)
            
            # 显示前3篇文章的详细信息
            print("\n📄 前3篇文章预览:")
            for i, article in enumerate(articles[:3]):
                print(f"\n{i+1}. 标题: {article['title']}")
                print(f"   分类: {article['category']}")
                print(f"   发布时间: {article['publish_time']}")
                print(f"   阅读数: {article['read_num']}")
                print(f"   内容预览: {article['content'][:100]}...")
                print("-" * 50)
        else:
            print("❌ 没有获取到文章数据")
            
    except Exception as e:
        print(f"❌ 同步过程中发生错误: {e}")
    
    print("\n✅ 测试完成!")

if __name__ == "__main__":
    main()
