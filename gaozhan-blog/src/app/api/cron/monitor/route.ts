import { NextRequest, NextResponse } from 'next/server';

// 微信公众号配置
const WECHAT_ACCOUNTS = {
  'zhengming': { biz: 'Mzk4ODQzMTM3NA==', name: '高瞻的論正人生' },
  'wisdom': { biz: 'MzkwNDg1MzEwMg==', name: '高瞻的智慧人生' },
  'trading': { biz: 'MzkxNzgzNTEwNQ==', name: '高瞻的交易人生' },
  'literary': { biz: 'Mzk0Mjg1MzQ1NA==', name: '高瞻的文艺人生' },
  'music': { biz: 'MzE5OTMxOTg3OQ==', name: '高瞻的音乐人生' },
  'consulting': { biz: 'Mzk1NzI0NDY4MQ==', name: '高瞻的咨询人生' },
  'shushu': { biz: 'MzkzODkzNTE2Mg==', name: '高瞻的术数人生' },
};

const API_KEY = process.env.JIZHILE_API_KEY || 'JZLebac614e9c88d8b4';
const API_BASE_URL = 'https://www.dajiala.com';

interface MonitorResponse {
  code: number;
  msg: string;
  data: Array<{
    position: number;
    url: string;
    post_time: number;
    post_time_str: string;
    cover_url: string;
    original: number;
    item_show_type: number;
    digest: string;
    title: string;
    appmsgid: number;
    msg_status: number;
    send_to_fans_num: number;
    is_deleted: string;
    types: number;
    pic_cdn_url_235_1: string;
    pic_cdn_url_16_9: string;
    pic_cdn_url_1_1: string;
  }>;
  now_page: number;
  now_page_articles_num: number;
  cost_money: number;
  remain_money: number;
}

/**
 * 调用极致了API获取公众号当天发文情况
 */
async function fetchTodayPosts(biz: string): Promise<MonitorResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/fbmain/monitor/v3/post_condition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        biz: biz,
        page: 1,
        key: API_KEY,
        verifycode: ''
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`获取公众号 ${biz} 发文失败:`, error);
    return null;
  }
}

/**
 * 智能分类文章
 */
function classifyArticle(title: string, digest: string): string {
  const content = (title + ' ' + digest).toLowerCase();
  
  // 文艺人生关键词
  if (content.includes('诗') || content.includes('词') || content.includes('文学') || 
      content.includes('艺术') || content.includes('书法') || content.includes('绘画') ||
      content.includes('文化') || content.includes('古典')) {
    return 'literary';
  }
  
  // 智慧人生关键词
  if (content.includes('哲学') || content.includes('思考') || content.includes('智慧') ||
      content.includes('人生') || content.includes('感悟') || content.includes('修养') ||
      content.includes('品格') || content.includes('境界')) {
    return 'wisdom';
  }
  
  // 交易人生关键词
  if (content.includes('股票') || content.includes('交易') || content.includes('投资') ||
      content.includes('金融') || content.includes('市场') || content.includes('基金') ||
      content.includes('证券') || content.includes('期货')) {
    return 'trading';
  }
  
  // 咨询人生关键词
  if (content.includes('咨询') || content.includes('管理') || content.includes('策略') ||
      content.includes('商业') || content.includes('企业') || content.includes('经营') ||
      content.includes('顾问') || content.includes('规划')) {
    return 'consulting';
  }
  
  // 音乐人生关键词
  if (content.includes('音乐') || content.includes('歌') || content.includes('乐器') ||
      content.includes('演奏') || content.includes('作曲') || content.includes('声乐') ||
      content.includes('节奏') || content.includes('旋律')) {
    return 'music';
  }
  
  // 論正人生关键词
  if (content.includes('论') || content.includes('正') || content.includes('评论') ||
      content.includes('观点') || content.includes('分析') || content.includes('见解') ||
      content.includes('辩论') || content.includes('讨论')) {
    return 'zhengming';
  }
  
  // 术数人生关键词
  if (content.includes('术数') || content.includes('风水') || content.includes('命理') ||
      content.includes('占卜') || content.includes('易经') || content.includes('八卦') ||
      content.includes('五行') || content.includes('算命') || content.includes('预测') ||
      content.includes('玄学') || content.includes('奇门') || content.includes('紫微')) {
    return 'shushu';
  }
  
  // 默认分类为智慧人生
  return 'wisdom';
}

/**
 * 保存到数据库或外部存储（这里简化处理）
 */
async function saveArticles(articles: any[]) {
  // 在真实部署中，这里应该保存到数据库
  // 现在我们只是记录日志
  console.log(`保存 ${articles.length} 篇文章到数据库`);
  
  // TODO: 集成Supabase或其他数据库
  // 可以调用你现有的数据同步API
  
  return true;
}

/**
 * 发送通知（可选）
 */
async function sendNotification(summary: any) {
  // 这里可以集成邮件通知、Webhook等
  console.log('监控完成通知:', summary);
  
  // TODO: 可以集成：
  // - 邮件通知
  // - Slack/Discord Webhook
  // - 微信通知
  
  return true;
}

/**
 * GET /api/cron/monitor - Vercel Cron Job端点
 * 验证请求来自Vercel Cron
 */
export async function GET(request: NextRequest) {
  try {
    // 验证Cron请求（可选的安全措施）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Vercel Cron Job: 开始监控微信公众号...');
    
    const results = {
      timestamp: new Date().toISOString(),
      accounts: [] as any[],
      summary: {
        total_accounts: 0,
        total_articles: 0,
        total_cost: 0,
        new_articles: 0,
      }
    };
    
    // 并行监控所有账号
    const monitorPromises = Object.entries(WECHAT_ACCOUNTS).map(async ([categoryId, account]) => {
      console.log(`📱 监控账号: ${account.name} (${categoryId})`);
      
      const response = await fetchTodayPosts(account.biz);
      if (!response) {
        return {
          category_id: categoryId,
          account_name: account.name,
          biz: account.biz,
          success: false,
          error: '获取失败',
          articles: [],
          cost: 0,
        };
      }
      
      if (response.code !== 0) {
        return {
          category_id: categoryId,
          account_name: account.name,
          biz: account.biz,
          success: false,
          error: response.msg,
          articles: [],
          cost: response.cost_money || 0,
        };
      }
      
      // 处理文章数据
      const articles = response.data.map(article => ({
        id: `${categoryId}_${article.appmsgid}`,
        title: article.title,
        url: article.url,
        cover_image: article.cover_url,
        digest: article.digest,
        post_time: article.post_time_str,
        position: article.position,
        original: article.original,
        fans_count: article.send_to_fans_num,
        msg_status: article.msg_status,
        types: article.types,
        category_id: classifyArticle(article.title, article.digest),
        original_category: categoryId,
      }));
      
      console.log(`✅ ${account.name}: 获取到 ${articles.length} 篇文章，费用 ${response.cost_money} 元`);
      
      return {
        category_id: categoryId,
        account_name: account.name,
        biz: account.biz,
        success: true,
        articles: articles,
        cost: response.cost_money,
        total_articles: response.now_page_articles_num,
        remain_money: response.remain_money,
      };
    });
    
    // 等待所有监控完成
    const accountResults = await Promise.all(monitorPromises);
    results.accounts = accountResults;
    
    // 统计汇总
    results.summary.total_accounts = accountResults.length;
    results.summary.total_articles = accountResults.reduce((sum, acc) => sum + acc.articles.length, 0);
    results.summary.total_cost = accountResults.reduce((sum, acc) => sum + acc.cost, 0);
    results.summary.new_articles = results.summary.total_articles;
    
    // 保存文章数据
    const allArticles = accountResults.flatMap(acc => acc.articles);
    if (allArticles.length > 0) {
      await saveArticles(allArticles);
    }
    
    // 发送通知
    await sendNotification(results.summary);
    
    console.log('📊 Cron监控完成:', {
      账号数: results.summary.total_accounts,
      文章数: results.summary.total_articles,
      总费用: results.summary.total_cost,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cron监控完成',
      data: results,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Cron监控过程中发生错误:', error);
    return NextResponse.json({
      success: false,
      message: 'Cron监控失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/cron/monitor - 手动触发监控（用于测试）
 */
export async function POST(request: NextRequest) {
  // 复用GET逻辑
  return GET(request);
}
