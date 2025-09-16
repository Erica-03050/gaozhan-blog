import fs from 'fs';
import path from 'path';
import { Article } from '@/types';

// 缓存变量
let cachedArticles: Article[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2分钟缓存，确保更新及时

interface SyncedArticle {
  title: string;
  original_url: string;
  cover_image_url: string;
  post_time_str: string;
  send_to_fans_num: number;
  wechat_article_id: string;
  content: string;
  content_html?: string; // HTML格式的文章内容
  excerpt: string;
  category_id: string;
  published_at: string;
  fetch_success?: boolean; // 内容获取是否成功
  fetch_error?: string; // 获取错误信息
  fetch_cost?: number; // 获取费用
  fetch_time?: string; // 获取时间
}

interface AccountResult {
  account_name: string;
  total_articles: number;
  new_articles: number;
  errors: number;
  cost: number;
  articles: SyncedArticle[];
}

interface SyncResults {
  sync_stats: {
    total_accounts: number;
    total_articles: number;
    new_articles: number;
    updated_articles: number;
    errors: number;
    total_cost: number;
  };
  account_results: AccountResult[];
  duration?: number;
}

interface AccountInfo {
  name: string;
  biz: string;
  category_id: string;
  category_name: string;
  principal_info?: {
    wx_id: string;
    owner_name: string;
    verify_status: string;
    desc: string;
    service_phone: string;
    last_login_country: string;
    last_login_province: string;
  };
  basic_info?: any;
}

/**
 * 获取最新的同步数据文件
 */
function getLatestSyncFile(): string | null {
  try {
    const projectRoot = process.cwd();
    
    // Vercel环境下，尝试直接访问已知的数据文件
    const knownFiles = [
      'sync_results_20250915_140611_with_content_with_content_20250915_150117.json',
      'sync_results_20250915_140611_with_content_backup.json',
      'sync_results_20250915_140611_with_content.json',
      'sync_results_20250915_140611.json'
    ];
    
    // 首先尝试访问已知文件
    for (const fileName of knownFiles) {
      const filePath = path.join(projectRoot, fileName);
      try {
        if (fs.existsSync(filePath)) {
          console.log(`Found sync file: ${fileName}`);
          return filePath;
        }
      } catch (e) {
        continue;
      }
    }
    
    // 如果已知文件都不存在，尝试读取目录（可能在本地环境）
    try {
      const files = fs.readdirSync(projectRoot);
      const syncFiles = files.filter(f => f.startsWith('sync_results_') && f.endsWith('.json'));
      
      if (syncFiles.length === 0) {
        console.log('No sync files found in directory');
        return null;
      }
      
      // 按文件名排序，获取最新的
      const latestFile = syncFiles.sort().reverse()[0];
      console.log(`Found latest sync file: ${latestFile}`);
      return path.join(projectRoot, latestFile);
    } catch (dirError) {
      console.log('Cannot read directory, trying fallback files');
      return null;
    }
  } catch (error) {
    console.error('Error reading sync files:', error);
    return null;
  }
}

/**
 * 获取公众号信息文件
 */
function getAccountInfoFile(): string | null {
  try {
    const projectRoot = process.cwd();
    
    // Vercel环境下，尝试直接访问已知的账户信息文件
    const knownFiles = [
      'account_info_20250915_151039.json'
    ];
    
    // 首先尝试访问已知文件
    for (const fileName of knownFiles) {
      const filePath = path.join(projectRoot, fileName);
      try {
        if (fs.existsSync(filePath)) {
          console.log(`Found account info file: ${fileName}`);
          return filePath;
        }
      } catch (e) {
        continue;
      }
    }
    
    // 如果已知文件都不存在，尝试读取目录（可能在本地环境）
    try {
      const files = fs.readdirSync(projectRoot);
      const accountFiles = files.filter(f => f.startsWith('account_info_') && f.endsWith('.json'));
      
      if (accountFiles.length === 0) {
        console.log('No account info files found in directory');
        return null;
      }
      
      // 按文件名排序，获取最新的
      const latestFile = accountFiles.sort().reverse()[0];
      console.log(`Found latest account info file: ${latestFile}`);
      return path.join(projectRoot, latestFile);
    } catch (dirError) {
      console.log('Cannot read directory for account info, trying fallback files');
      return null;
    }
  } catch (error) {
    console.error('Error reading account info files:', error);
    return null;
  }
}

/**
 * 读取同步数据
 */
function getSyncData(): SyncResults | null {
  try {
    const latestFile = getLatestSyncFile();
    if (!latestFile) {
      return null;
    }
    
    const content = fs.readFileSync(latestFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading sync data:', error);
    return null;
  }
}

/**
 * 读取公众号信息
 */
function getAccountInfo(): Record<string, AccountInfo> | null {
  try {
    const accountFile = getAccountInfoFile();
    if (!accountFile) {
      return null;
    }
    
    const content = fs.readFileSync(accountFile, 'utf8');
    const data = JSON.parse(content);
    
    // 转换为以category_id为key的对象
    const accountMap: Record<string, AccountInfo> = {};
    data.account_info?.forEach((account: AccountInfo) => {
      accountMap[account.category_id] = account;
    });
    
    return accountMap;
  } catch (error) {
    console.error('Error reading account info:', error);
    return null;
  }
}

/**
 * 生成演示内容
 */
function generateDemoContent(title: string, categoryId: string): string {
  const categoryContent: Record<string, string[]> = {
    politics: [
      '在当今复杂多变的国际政治格局中，我们需要以更加深刻的视角来审视世界的变化。',
      '这篇文章将从地缘政治、国际关系、以及全球治理的角度，深入分析当前的政治形势。',
      '政治智慧不仅体现在对时局的准确判断，更在于对历史规律的深刻理解。',
      '让我们一起探讨这个话题背后的深层逻辑和发展趋势。'
    ],
    wisdom: [
      '人生如棋，每一步都需要深思熟虑。在这个快速变化的时代，古老的智慧显得尤为珍贵。',
      '本文将结合东西方哲学思想，探讨如何在现代生活中应用传统智慧。',
      '智慧不是知识的简单累积，而是对生活的深刻洞察和理解。',
      '希望这些思考能为您的人生旅程提供一些启发和指导。'
    ],
    trading: [
      '市场如战场，成功的交易者必须具备敏锐的洞察力和坚定的执行力。',
      '这篇分析将从技术面、基本面以及市场心理学的角度，全面解读当前的市场形势。',
      '投资不仅是一门科学，更是一门艺术。它需要理性的分析，也需要直觉的判断。',
      '让我们一起深入探讨这个投资机会的内在逻辑和风险收益比。'
    ],
    literary: [
      '文学是心灵的镜子，诗词是情感的载体。在这个浮躁的时代，文艺创作显得格外重要。',
      '本文将分享一些关于文学创作的心得体会，以及对传统文化的思考。',
      '真正的文艺作品不仅要有形式上的美感，更要有精神上的深度。',
      '希望通过这些文字，能够触动您内心深处的文艺情怀。'
    ],
    music: [
      '音乐是情感的语言，是灵魂的表达。每一个音符都承载着作者的情感和思想。',
      '在这篇文章中，我将分享对音乐艺术的理解和感悟。',
      '音律与人生有着千丝万缕的联系，它们都遵循着某种内在的和谐规律。',
      '让我们一起感受音乐的魅力，体验艺术的美好。'
    ],
    consulting: [
      '在商业世界中，正确的策略和精准的执行往往决定了企业的成败。',
      '本文将结合实际案例，分析当前商业环境下的机遇和挑战。',
      '咨询不仅是提供解决方案，更是帮助客户发现问题的本质。',
      '希望这些商业思考能为您的决策提供有价值的参考。'
    ],
    numerology: [
      '数术之学，源远流长。它不仅是古人对自然规律的探索，也是对人生命运的思考。',
      '在这篇文章中，我将分享对传统术数的理解和现代应用。',
      '奇门遁甲、易经八卦，这些古老的智慧在今天仍然具有指导意义。',
      '让我们一起探索这些神秘而深刻的东方智慧。'
    ]
  };

  const templates = categoryContent[categoryId] || categoryContent['wisdom'];
  const intro = `## ${title}\n\n`;
  const content = templates.join('\n\n');
  const footer = '\n\n---\n\n*本文内容基于公众号原文整理，如需查看完整内容，请点击原文链接。*';
  
  return intro + content + footer;
}

/**
 * 分类ID映射表 - 将数据文件中的category_id映射到网站的分类ID
 */
const CATEGORY_ID_MAPPING: Record<string, string> = {
  'politics': 'debate',      // 論正人生
  'literary': 'literary',    // 文艺人生  
  'wisdom': 'wisdom',        // 智慧人生
  'trading': 'trading',      // 交易人生
  'consulting': 'consulting', // 咨询人生
  'tax': 'tax',             // 税筹人生
  'music': 'music',         // 音乐人生
  'math': 'math',           // 数术人生
  'numerology': 'math',     // 数术人生(备用映射)
  'shushu': 'math'          // 数术人生(备用映射)
};

/**
 * 将同步的文章数据转换为网站使用的格式
 */
function convertSyncedArticleToArticle(syncedArticle: SyncedArticle, accountName: string, articleIndex: number, globalIndex: number): Article {
  // 生成稳定的唯一ID - 不使用随机数或时间戳，确保同一文章总是相同ID
  const safeAccountName = accountName.replace(/[^a-zA-Z0-9]/g, '');
  
  // 优先使用微信文章ID
  const wechatId = syncedArticle.wechat_article_id;
  let finalId: string;
  
  if (wechatId && wechatId.length >= 5) {
    // 使用微信ID + 账户名确保唯一性
    finalId = `${wechatId}_${safeAccountName}`;
  } else {
    // 从URL提取ID
    const url = syncedArticle.original_url;
    if (url && url.includes('/s/')) {
      const urlParts = url.split('/s/')[1];
      const urlId = urlParts ? urlParts.split('?')[0] : null;
      if (urlId && urlId.length >= 5) {
        finalId = `${urlId}_${safeAccountName}`;
      } else {
        // 使用标题和账户名生成稳定ID
        const titleHash = syncedArticle.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').substring(0, 20);
        finalId = `${safeAccountName}_${articleIndex}_${titleHash}`;
      }
    } else {
      // 使用标题和账户名生成稳定ID
      const titleHash = syncedArticle.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').substring(0, 20);
      finalId = `${safeAccountName}_${articleIndex}_${titleHash}`;
    }
  }
  
  // 使用获取到的内容（此时已经确保有内容）
  const content = syncedArticle.content_html || syncedArticle.content || '';
  
  // 从HTML内容中提取纯文本作为摘要
  const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const excerpt = syncedArticle.excerpt || (textContent.substring(0, 200) + '...');
  
  // 映射分类ID
  const mappedCategoryId = CATEGORY_ID_MAPPING[syncedArticle.category_id] || syncedArticle.category_id;
  
  return {
    id: finalId,
    title: syncedArticle.title || '无标题',
    content: content,
    summary: excerpt,
    category_id: mappedCategoryId,
    cover_image: syncedArticle.cover_image_url || '',
    publish_time: syncedArticle.post_time_str || new Date().toISOString().split('T')[0],
    original_link: syncedArticle.original_url,
    read_count: syncedArticle.send_to_fans_num || 0,
    is_featured: false,
    created_at: syncedArticle.published_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * 检查文章质量
 */
function isHighQualityArticle(syncedArticle: SyncedArticle): boolean {
  // 检查是否获取失败
  if ('fetch_success' in syncedArticle && !syncedArticle.fetch_success) {
    return false;
  }
  
  // 检查是否有错误信息
  if ('fetch_error' in syncedArticle && syncedArticle.fetch_error) {
    return false;
  }
  
  // 检查标题质量
  if (!syncedArticle.title || syncedArticle.title.length < 5) {
    return false;
  }
  
  // 检查内容质量
  const content = syncedArticle.content_html || syncedArticle.content || '';
  if (!content) {
    return false;
  }
  
  // 移除HTML标签后检查纯文本长度
  const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (textContent.length < 200) { // 至少200字符
    return false;
  }
  
  // 检查是否只是图片内容（没有实质文字）
  const hasImages = content.includes('<img') || content.includes('mmbiz.qpic.cn');
  const hasText = textContent.length > 100;
  
  if (hasImages && !hasText) {
    return false; // 只有图片没有文字
  }
  
  return true;
}

/**
 * 获取所有文章
 */
export function getAllArticles(): Article[] {
  console.log('🔍 getAllArticles called');
  
  // 检查缓存
  const now = Date.now();
  if (cachedArticles && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log(`📦 Using cached articles: ${cachedArticles.length} articles`);
    return cachedArticles;
  }
  
  const syncData = getSyncData();
  console.log('📊 Sync data loaded:', syncData ? 'SUCCESS' : 'FAILED');
  
  if (!syncData) {
    console.log('❌ No sync data available, returning empty array');
    return []; // 如果没有同步数据，返回空数组
  }
  
  console.log(`📈 Sync data stats:`, {
    total_accounts: syncData.sync_stats?.total_accounts,
    total_articles: syncData.sync_stats?.total_articles,
    account_results_count: syncData.account_results?.length
  });
  
  const allArticles: Article[] = [];
  const seenIds = new Set<string>(); // 用于去重
  const seenTitles = new Set<string>(); // 用于标题去重
  
  // 遍历所有账户的文章
  syncData.account_results.forEach((account, accountIndex) => {
    console.log(`🏢 Processing account ${accountIndex + 1}: ${account.account_name} (${account.articles?.length || 0} articles)`);
    
    if (!account.articles || account.articles.length === 0) {
      console.log(`⚠️ Account ${account.account_name} has no articles`);
      return;
    }
    
    account.articles.forEach((syncedArticle, articleIndex) => {
      // 检查是否有实际内容
      const hasContent = syncedArticle.content_html || syncedArticle.content;
      const fetchSuccess = !('fetch_success' in syncedArticle) || syncedArticle.fetch_success;
      
      // 如果没有内容或获取失败，直接跳过
      if (!hasContent || !fetchSuccess) {
        return;
      }
      
      // 检查内容长度（至少要有一些实际内容）
      const textContent = hasContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      if (textContent.length < 50) {
        return; // 跳过内容过短的文章
      }
      
      // 检查标题重复（同一标题只保留第一个）
      if (seenTitles.has(syncedArticle.title)) {
        return; // 跳过重复标题
      }
      seenTitles.add(syncedArticle.title);
      
      const globalIndex = allArticles.length;
      const article = convertSyncedArticleToArticle(
        syncedArticle, 
        account.account_name, 
        articleIndex, 
        globalIndex
      );
      
      // 检查ID重复
      if (seenIds.has(article.id)) {
        // 如果ID重复，重新生成一个唯一ID
        article.id = `${article.id}_${globalIndex}`;
      }
      seenIds.add(article.id);
      
      allArticles.push(article);
    });
  });
  
  // 按发布时间排序（最新的在前）
  const sortedArticles = allArticles.sort((a, b) => 
    new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime()
  );
  
  console.log(`✅ Final result: ${sortedArticles.length} articles processed`);
  if (sortedArticles.length > 0) {
    console.log(`📝 Sample articles:`, sortedArticles.slice(0, 3).map(a => ({
      title: a.title,
      category: a.category_id,
      publish_time: a.publish_time
    })));
  }
  
  // 更新缓存
  cachedArticles = sortedArticles;
  cacheTimestamp = now;
  
  return sortedArticles;
}

/**
 * 根据分类获取文章
 */
export function getArticlesByCategory(categoryId: string): Article[] {
  const allArticles = getAllArticles();
  return allArticles.filter(article => article.category_id === categoryId);
}

/**
 * 根据ID获取单篇文章
 */
export function getArticleById(id: string): Article | null {
  const allArticles = getAllArticles();
  return allArticles.find(article => article.id === id) || null;
}

/**
 * 获取首页数据
 */
export function getHomeData() {
  const allArticles = getAllArticles();
  const syncData = getSyncData();
  const accountInfo = getAccountInfo();
  
  // 每个分类的最新文章
  const categorizedArticles: Record<string, Article[]> = {};
  
  // 按分类分组
  allArticles.forEach(article => {
    if (!categorizedArticles[article.category_id]) {
      categorizedArticles[article.category_id] = [];
    }
    categorizedArticles[article.category_id].push(article);
  });
  
  // 每个分类只取前3篇
  Object.keys(categorizedArticles).forEach(categoryId => {
    categorizedArticles[categoryId] = categorizedArticles[categoryId].slice(0, 3);
  });
  
  return {
    featured_articles: allArticles.slice(0, 6), // 最新的6篇作为推荐
    latest_articles: allArticles.slice(0, 12),  // 最新的12篇
    categorized_articles: categorizedArticles,
    total_articles: allArticles.length,
    account_info: accountInfo,
    sync_info: syncData ? {
      last_sync: syncData.account_results[0]?.articles[0]?.post_time_str || null,
      total_accounts: syncData.sync_stats.total_accounts,
      total_cost: syncData.sync_stats.total_cost
    } : null
  };
}

/**
 * 获取公众号描述信息
 */
export function getAccountDescription(categoryId: string): string | null {
  const accountInfo = getAccountInfo();
  if (!accountInfo || !accountInfo[categoryId]) {
    return null;
  }
  
  return accountInfo[categoryId].principal_info?.desc || null;
}

/**
 * 获取同步状态信息
 */
export function getSyncInfo() {
  const syncData = getSyncData();
  if (!syncData) {
    return null;
  }
  
  return {
    ...syncData.sync_stats,
    accounts: syncData.account_results.map(account => ({
      name: account.account_name,
      articles: account.articles.length,
      errors: account.errors,
      cost: account.cost
    })),
    last_sync_file: getLatestSyncFile()
  };
}