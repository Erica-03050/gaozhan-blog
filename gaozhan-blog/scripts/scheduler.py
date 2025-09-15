#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
实时监控微信公众号定时任务调度器
定期调用监控API，实现自动化监控
"""

import requests
import time
import schedule
import json
from datetime import datetime, timedelta
import os
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)

class WeChatMonitorScheduler:
    def __init__(self):
        self.api_base_url = "http://localhost:3000/api"
        self.last_check_time = None
        self.check_interval_minutes = 60  # 每60分钟（1小时）检查一次
        
    def call_monitor_api(self):
        """调用监控API"""
        try:
            logging.info("🚀 开始调用监控API...")
            
            response = requests.post(f"{self.api_base_url}/monitor", timeout=300)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    data = result.get('data', {})
                    summary = data.get('summary', {})
                    
                    logging.info(f"✅ 监控成功: 账号数={summary.get('total_accounts', 0)}, "
                               f"文章数={summary.get('total_articles', 0)}, "
                               f"费用={summary.get('total_cost', 0)}元")
                    
                    # 检查是否有新文章
                    if summary.get('new_articles', 0) > 0:
                        self.notify_new_articles(data)
                    
                    self.last_check_time = datetime.now()
                    return True
                else:
                    logging.error(f"❌ 监控失败: {result.get('message')}")
                    return False
            else:
                logging.error(f"❌ API调用失败: HTTP {response.status_code}")
                return False
                
        except requests.exceptions.Timeout:
            logging.error("❌ API调用超时")
            return False
        except Exception as e:
            logging.error(f"❌ 监控过程中发生错误: {e}")
            return False
    
    def notify_new_articles(self, data):
        """通知有新文章"""
        try:
            new_articles = []
            for account in data.get('accounts', []):
                if account.get('success') and account.get('articles'):
                    for article in account['articles']:
                        new_articles.append({
                            'account': account['account_name'],
                            'title': article['title'],
                            'category': article['category_id'],
                            'url': article['url']
                        })
            
            if new_articles:
                logging.info(f"📢 发现 {len(new_articles)} 篇新文章:")
                for article in new_articles[:5]:  # 只显示前5篇
                    logging.info(f"  - {article['account']}: {article['title']}")
                
                # 这里可以添加更多通知方式，比如发送邮件、微信通知等
                self.save_notification(new_articles)
                
        except Exception as e:
            logging.error(f"❌ 处理新文章通知时发生错误: {e}")
    
    def save_notification(self, articles):
        """保存通知记录"""
        try:
            notification = {
                'timestamp': datetime.now().isoformat(),
                'articles_count': len(articles),
                'articles': articles
            }
            
            # 保存到文件
            filename = f"notifications_{datetime.now().strftime('%Y%m%d')}.json"
            filepath = os.path.join('notifications', filename)
            
            # 确保目录存在
            os.makedirs('notifications', exist_ok=True)
            
            # 读取现有通知
            notifications = []
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    notifications = json.load(f)
            
            # 添加新通知
            notifications.append(notification)
            
            # 保存
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(notifications, f, ensure_ascii=False, indent=2)
                
            logging.info(f"📝 通知记录已保存到: {filepath}")
            
        except Exception as e:
            logging.error(f"❌ 保存通知记录失败: {e}")
    
    def schedule_monitoring(self):
        """设置监控调度"""
        # 每1小时执行一次监控
        schedule.every(self.check_interval_minutes).minutes.do(self.call_monitor_api)
        
        # 每天早上8点执行一次完整监控
        schedule.every().day.at("08:00").do(self.call_monitor_api)
        
        # 每天下午6点执行一次完整监控
        schedule.every().day.at("18:00").do(self.call_monitor_api)
        
        logging.info("📅 监控调度已设置:")
        logging.info(f"  - 每 {self.check_interval_minutes} 分钟（1小时）执行一次")
        logging.info("  - 每天 08:00 执行一次")
        logging.info("  - 每天 18:00 执行一次")
    
    def run(self):
        """运行调度器"""
        logging.info("🎯 微信公众号实时监控调度器启动")
        
        # 立即执行一次监控
        logging.info("📱 执行初始监控...")
        self.call_monitor_api()
        
        # 设置定时调度
        self.schedule_monitoring()
        
        # 开始循环调度
        logging.info("⏰ 开始定时调度...")
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # 每分钟检查一次调度
        except KeyboardInterrupt:
            logging.info("⏹️ 收到停止信号，调度器正在关闭...")
        except Exception as e:
            logging.error(f"❌ 调度器运行时发生错误: {e}")
    
    def status(self):
        """获取调度器状态"""
        status_info = {
            'running': True,
            'last_check': self.last_check_time.isoformat() if self.last_check_time else None,
            'next_jobs': [str(job) for job in schedule.jobs],
            'check_interval_minutes': self.check_interval_minutes,
        }
        return status_info

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='微信公众号实时监控调度器')
    parser.add_argument('--interval', type=int, default=30, help='检查间隔(分钟)')
    parser.add_argument('--once', action='store_true', help='只执行一次监控')
    parser.add_argument('--status', action='store_true', help='显示调度器状态')
    
    args = parser.parse_args()
    
    scheduler = WeChatMonitorScheduler()
    scheduler.check_interval_minutes = args.interval
    
    if args.once:
        logging.info("🔄 执行单次监控...")
        success = scheduler.call_monitor_api()
        exit(0 if success else 1)
    elif args.status:
        status = scheduler.status()
        print(json.dumps(status, indent=2, ensure_ascii=False))
    else:
        scheduler.run()

if __name__ == "__main__":
    main()
