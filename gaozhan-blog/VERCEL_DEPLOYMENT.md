# 🚀 Vercel部署指南 - 实时监控系统

## 📋 部署概述

这个指南将帮你把微信公众号实时监控系统部署到Vercel，实现：
- ✅ **每小时自动监控** (使用Vercel Cron Jobs)
- ✅ **无服务器架构** (Serverless Functions)
- ✅ **全球CDN加速**
- ✅ **自动扩缩容**

## 🎯 部署步骤

### 第1步：准备项目

确保你的项目结构正确：
```
gaozhan-blog/
├── src/app/api/cron/monitor/route.ts  # Vercel Cron Job端点
├── src/app/api/monitor/route.ts       # 手动监控API
├── vercel.json                        # Vercel配置
├── package.json
└── ...其他文件
```

### 第2步：推送到GitHub

```bash
# 初始化Git仓库（如果还没有）
git init
git add .
git commit -m "Add WeChat monitoring system"

# 推送到GitHub
git remote add origin https://github.com/your-username/gaozhan-blog.git
git push -u origin main
```

### 第3步：连接Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 从GitHub导入你的仓库
4. 选择 `gaozhan-blog` 目录作为根目录

### 第4步：配置环境变量

在Vercel项目设置中添加环境变量：

| 变量名 | 值 | 说明 |
|--------|----|----- |
| `JIZHILE_API_KEY` | `JZLebac614e9c88d8b4` | 极致了API密钥 |
| `CRON_SECRET` | `your_random_secret` | Cron安全密钥（可选） |

**设置步骤：**
1. 进入Vercel项目 → Settings → Environment Variables
2. 添加上述变量
3. 确保选择所有环境（Production, Preview, Development）

### 第5步：部署

```bash
# Vercel会自动部署，或者手动触发
vercel --prod
```

## ⏰ Cron Jobs配置

`vercel.json` 已配置为每小时运行一次：

```json
{
  "crons": [
    {
      "path": "/api/cron/monitor",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Cron表达式说明：**
- `0 * * * *` = 每小时的0分钟执行
- `0 */2 * * *` = 每2小时执行
- `0 8,18 * * *` = 每天8点和18点执行

## 🔍 验证部署

### 1. 测试手动监控API

```bash
curl -X POST https://your-app.vercel.app/api/monitor
```

### 2. 测试Cron端点

```bash
curl https://your-app.vercel.app/api/cron/monitor
```

### 3. 查看监控界面

访问：`https://your-app.vercel.app/admin/monitor`

## 📊 监控和日志

### Vercel函数日志

1. 进入Vercel项目 → Functions
2. 点击函数查看执行日志
3. 监控Cron Job的运行状态

### 监控指标

- **执行频率**: 每小时1次
- **预计费用**: 约30元/月（API调用费用）
- **函数执行**: 免费额度内（每月100GB-小时）

## 🔧 高级配置

### 数据库集成

如果要持久化存储数据，推荐集成Supabase：

```typescript
// 在 /api/cron/monitor/route.ts 中
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function saveArticles(articles: any[]) {
  const { data, error } = await supabase
    .from('articles')
    .insert(articles)
  
  if (error) throw error
  return data
}
```

### 通知集成

添加邮件或Webhook通知：

```typescript
async function sendNotification(summary: any) {
  // 发送到Discord/Slack
  await fetch(process.env.WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `监控完成：获取${summary.total_articles}篇文章，费用${summary.total_cost}元`
    })
  })
}
```

## 💰 成本分析

### Vercel费用
- **Hobby计划**: 免费（适合个人项目）
- **Pro计划**: $20/月（如需更多功能）

### API调用费用
- **每小时监控**: 0.42元
- **每天费用**: ~10元（24次）
- **每月费用**: ~300元

### 优化建议
1. **降低频率**: 改为每2小时监控一次
2. **智能监控**: 只在工作时间监控
3. **缓存优化**: 避免重复获取相同文章

## 🚨 注意事项

### Vercel限制
- **函数超时**: 最大5分钟（已在vercel.json中配置）
- **并发限制**: Hobby计划有并发限制
- **冷启动**: 函数可能有冷启动延迟

### 安全考虑
- ✅ API密钥已配置为环境变量
- ✅ 可选的Cron安全验证
- ✅ 函数级别的错误处理

### 监控建议
- 设置Vercel的监控告警
- 定期检查API余额
- 监控函数执行日志

## 🎯 部署后的使用

### 自动监控
- 系统会每小时自动执行
- 无需任何手动干预
- 自动分类和保存文章

### 手动控制
- 访问管理界面进行手动监控
- 查看实时统计和历史数据
- 监控系统运行状态

### 数据访问
- 通过API获取监控数据
- 集成到现有的博客系统
- 支持第三方工具调用

---

## 🎉 完成！

部署完成后，你的微信公众号监控系统将：

1. **24/7自动运行** - 无需本地服务器
2. **全球访问** - 通过Vercel CDN加速
3. **自动扩缩容** - 根据流量自动调整
4. **成本可控** - 按实际使用付费

**你的监控系统现在可以服务全世界的用户了！** 🌍
