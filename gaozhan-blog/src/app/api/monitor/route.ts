import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  total_num?: number;
  total_page?: number;
  publish_count?: number;
  masssend_count?: number;
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
  
  // 税筹人生关键词
  if (content.includes('税') || content.includes('财务') || content.includes('会计') ||
      content.includes('筹划') || content.includes('合规') || content.includes('审计') ||
      content.includes('法规') || content.includes('政策')) {
    return 'tax';
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
 * 保存监控结果到文件
 */
function saveMonitorResults(results: any) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `monitor_results_${timestamp}.json`;
  const filepath = path.join(process.cwd(), 'monitor_data', filename);
  
  // 确保目录存在
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`监控结果已保存到: ${filepath}`);
}

/**
 * POST /api/monitor - 执行实时监控
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始实时监控微信公众号...');
    
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
        category_id: classifyArticle(article.title, article.digest), // 自动分类
        original_category: categoryId, // 原始分类
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
    results.summary.new_articles = results.summary.total_articles; // 简化处理，假设都是新文章
    
    // 保存监控结果
    saveMonitorResults(results);
    
    console.log('📊 监控完成:', {
      账号数: results.summary.total_accounts,
      文章数: results.summary.total_articles,
      总费用: results.summary.total_cost,
    });
    
    return NextResponse.json({
      success: true,
      message: '实时监控完成',
      data: results,
    });
    
  } catch (error) {
    console.error('监控过程中发生错误:', error);
    return NextResponse.json({
      success: false,
      message: '监控失败',
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}

/**
 * GET /api/monitor - 获取最新监控结果
 */
export async function GET() {
  try {
    const monitorDir = path.join(process.cwd(), 'monitor_data');
    
    if (!fs.existsSync(monitorDir)) {
      return NextResponse.json({
        success: false,
        message: '暂无监控数据',
        data: null,
      });
    }
    
    // 获取最新的监控文件
    const files = fs.readdirSync(monitorDir)
      .filter(file => file.startsWith('monitor_results_') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        message: '暂无监控数据',
        data: null,
      });
    }
    
    const latestFile = path.join(monitorDir, files[0]);
    const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    
    return NextResponse.json({
      success: true,
      message: '获取监控数据成功',
      data: data,
      filename: files[0],
    });
    
  } catch (error) {
    console.error('获取监控数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取监控数据失败',
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
