#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
微信公众号实时监控系统启动脚本
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_dependencies():
    """检查依赖"""
    try:
        import schedule
        import requests
        print("✅ Python依赖检查通过")
        return True
    except ImportError as e:
        print(f"❌ 缺少Python依赖: {e}")
        print("请运行: pip install schedule requests")
        return False

def check_next_server():
    """检查Next.js服务器是否运行"""
    try:
        response = requests.get("http://localhost:3000/api/monitor", timeout=5)
        print("✅ Next.js服务器运行正常")
        return True
    except:
        print("❌ Next.js服务器未运行")
        print("请先运行: npm run dev")
        return False

def install_dependencies():
    """安装Python依赖"""
    print("📦 安装Python依赖...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "schedule", "requests"])
        print("✅ 依赖安装成功")
        return True
    except subprocess.CalledProcessError:
        print("❌ 依赖安装失败")
        return False

def start_scheduler():
    """启动调度器"""
    script_path = Path(__file__).parent / "scheduler.py"
    
    if not script_path.exists():
        print(f"❌ 找不到调度器脚本: {script_path}")
        return False
    
    print("🚀 启动监控调度器...")
    try:
        # 使用subprocess启动调度器
        process = subprocess.Popen([
            sys.executable, str(script_path)
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        print(f"✅ 调度器已启动，进程ID: {process.pid}")
        
        # 监控调度器输出
        try:
            for line in iter(process.stdout.readline, ''):
                print(line.rstrip())
        except KeyboardInterrupt:
            print("\n⏹️ 收到停止信号，正在关闭调度器...")
            process.terminate()
            process.wait()
            print("✅ 调度器已关闭")
        
        return True
        
    except Exception as e:
        print(f"❌ 启动调度器失败: {e}")
        return False

def main():
    """主函数"""
    print("🎯 微信公众号实时监控系统")
    print("=" * 50)
    
    # 检查依赖
    if not check_dependencies():
        if input("是否自动安装依赖? (y/n): ").lower() == 'y':
            if not install_dependencies():
                sys.exit(1)
        else:
            sys.exit(1)
    
    # 检查Next.js服务器
    if not check_next_server():
        print("\n请先启动Next.js开发服务器:")
        print("cd gaozhan-blog && npm run dev")
        sys.exit(1)
    
    print("\n📋 系统检查完成，准备启动监控...")
    time.sleep(2)
    
    # 启动调度器
    start_scheduler()

if __name__ == "__main__":
    main()
