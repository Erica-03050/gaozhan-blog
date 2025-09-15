# 微信公众号实时监控系统

## 🎯 功能概述

本系统可以实时监控7个微信公众号的发文情况，自动获取文章信息和配图，并支持智能分类。

### 主要功能
- ✅ **实时监控**: 自动检测公众号新发文章
- ✅ **智能分类**: AI自动将文章分配到合适的分类
- ✅ **定时任务**: 支持定时自动监控
- ✅ **管理界面**: 可视化监控控制面板
- ✅ **费用统计**: 实时显示API调用费用

## 🚀 快速开始

### 1. 配置API密钥

创建 `.env.local` 文件并配置：

```bash
# 复制示例配置文件
cp env.example .env.local

# 编辑配置文件，填入你的API密钥
JIZHILE_API_KEY=your_actual_api_key_here
```

### 2. 更新公众号BIZ

在 `src/app/api/monitor/route.ts` 中更新实际的BIZ值：

```typescript
const WECHAT_ACCOUNTS = {
  'literary': { biz: '你的实际BIZ值', name: '高瞻的文艺人生' },
  'wisdom': { biz: '你的实际BIZ值', name: '高瞻的智慧人生' },
  // ... 其他账号
};
```

### 3. 启动系统

#### 方法1: 自动启动（推荐）
```bash
# 启动Next.js服务器
npm run dev

# 在新终端中启动监控系统
python scripts/start_monitor.py
```

#### 方法2: 手动启动
```bash
# 启动Next.js服务器
npm run dev

# 安装Python依赖
pip install schedule requests

# 启动调度器
python scripts/scheduler.py
```

### 4. 访问管理界面

打开浏览器访问: `http://localhost:3000/admin/monitor`

## 📋 API接口

### POST /api/monitor
执行一次完整的监控，获取所有公众号的今日发文。

**响应示例:**
```json
{
  "success": true,
  "message": "实时监控完成",
  "data": {
    "timestamp": "2024-09-15T10:00:00.000Z",
    "summary": {
      "total_accounts": 7,
      "total_articles": 25,
      "total_cost": 0.42,
      "new_articles": 5
    },
    "accounts": [...]
  }
}
```

### GET /api/monitor
获取最新的监控结果。

## 🤖 智能分类算法

系统会根据文章标题和摘要自动分类：

- **文艺人生**: 诗词、文学、艺术、书法、绘画、文化
- **智慧人生**: 哲学、思考、智慧、人生感悟、修养
- **交易人生**: 股票、投资、金融、市场、基金、证券
- **咨询人生**: 咨询、管理、策略、商业、企业经营
- **税筹人生**: 税务、财务、会计、筹划、合规、审计
- **音乐人生**: 音乐、歌曲、乐器、演奏、作曲、声乐
- **論正人生**: 论述、评论、观点、分析、见解、辩论

## ⏰ 定时监控

调度器默认配置：
- 每30分钟执行一次监控
- 每天上午8:00执行一次
- 每天下午6:00执行一次

可以通过修改 `scripts/scheduler.py` 中的配置来调整：

```python
# 修改监控间隔
self.check_interval_minutes = 15  # 改为15分钟

# 添加更多定时任务
schedule.every().day.at("12:00").do(self.call_monitor_api)  # 中午12点
```

## 📊 数据存储

监控结果保存在以下位置：
- **监控数据**: `monitor_data/monitor_results_*.json`
- **通知记录**: `notifications/notifications_*.json`
- **调度日志**: `scheduler.log`

## 🔧 高级配置

### 调整监控频率
```bash
# 每15分钟监控一次
python scripts/scheduler.py --interval 15

# 只执行一次监控
python scripts/scheduler.py --once

# 查看调度器状态
python scripts/scheduler.py --status
```

### 自定义分类规则
编辑 `src/app/api/monitor/route.ts` 中的 `classifyArticle` 函数：

```typescript
function classifyArticle(title: string, digest: string): string {
  const content = (title + ' ' + digest).toLowerCase();
  
  // 添加你的分类规则
  if (content.includes('你的关键词')) {
    return 'your_category';
  }
  
  // ... 其他规则
}
```

## 💰 费用说明

根据极致了API定价：
- **BIZ调用**: 0.06元/次
- **URL调用**: 长链接0.06元/次，短链接0.08元/次
- **名称调用**: 0.08元/次

每次完整监控7个账号约花费: **0.42元**

## 🚨 注意事项

1. **API限制**: 不得超过5次/秒的调用频率
2. **余额监控**: 请及时关注API余额，余额不足时监控会失败
3. **数据备份**: 建议定期备份监控数据文件
4. **网络稳定**: 确保服务器网络稳定，避免监控中断

## 🐛 故障排除

### 常见问题

**Q: 监控失败，提示"key或附加码不正确"**
A: 检查 `.env.local` 中的 `JIZHILE_API_KEY` 是否正确

**Q: 监控成功但没有文章**
A: 可能是公众号今天没有发文，或者BIZ值不正确

**Q: 调度器启动失败**
A: 确保已安装Python依赖：`pip install schedule requests`

**Q: 图片无法显示**
A: 这是正常现象，微信图片有防盗链保护

### 日志查看
```bash
# 查看调度器日志
tail -f scheduler.log

# 查看Next.js日志
# 在运行npm run dev的终端中查看
```

## 📞 技术支持

如有问题，请检查：
1. API密钥是否正确配置
2. BIZ值是否为实际值
3. 网络连接是否正常
4. API余额是否充足

---

## 🎉 系统特色

- **零配置启动**: 一键启动完整监控系统
- **智能分类**: AI自动分配文章到合适分类
- **实时通知**: 发现新文章立即通知
- **可视化管理**: 直观的Web管理界面
- **成本透明**: 实时显示API调用费用
- **高可靠性**: 多重错误处理和重试机制
