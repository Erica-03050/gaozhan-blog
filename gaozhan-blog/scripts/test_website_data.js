const fs = require('fs');
const path = require('path');

// 模拟数据服务
function testWebsiteData() {
  console.log('🧪 测试网站数据处理逻辑...\n');
  
  // 读取同步数据
  const files = fs.readdirSync('.');
  const syncFiles = files.filter(f => f.startsWith('sync_results_') && f.endsWith('.json'));
  
  if (syncFiles.length === 0) {
    console.log('❌ 未找到同步数据文件');
    return;
  }
  
  const latestFile = syncFiles.sort().reverse()[0];
  console.log(`📁 使用文件: ${latestFile}`);
  
  const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  
  // 模拟去重逻辑
  const allArticles = [];
  const seenTitles = new Set();
  const seenIds = new Set();
  
  data.account_results.forEach((account, accountIndex) => {
    console.log(`\n📋 处理 ${account.account_name}:`);
    
    let processedCount = 0;
    let skippedCount = 0;
    
    account.articles.forEach((syncedArticle, articleIndex) => {
      // 检查质量
      if (syncedArticle.fetch_success === false) {
        skippedCount++;
        return;
      }
      
      const content = syncedArticle.content_html || syncedArticle.content || '';
      const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      
      if (textContent.length < 200) {
        skippedCount++;
        return;
      }
      
      // 检查重复标题
      if (seenTitles.has(syncedArticle.title)) {
        console.log(`  🔄 跳过重复: ${syncedArticle.title}`);
        skippedCount++;
        return;
      }
      
      seenTitles.add(syncedArticle.title);
      
      // 生成ID
      const safeAccountName = account.account_name.replace(/[^a-zA-Z0-9]/g, '');
      const wechatId = syncedArticle.wechat_article_id;
      let finalId;
      
      if (wechatId && wechatId.length >= 5) {
        finalId = `${wechatId}_${safeAccountName}`;
      } else {
        const titleHash = syncedArticle.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').substring(0, 20);
        finalId = `${safeAccountName}_${articleIndex}_${titleHash}`;
      }
      
      // 检查ID重复
      if (seenIds.has(finalId)) {
        finalId = `${finalId}_${allArticles.length}`;
      }
      seenIds.add(finalId);
      
      const article = {
        id: finalId,
        title: syncedArticle.title,
        category_id: syncedArticle.category_id,
        publish_time: syncedArticle.post_time_str,
        content: content,
        textLength: textContent.length
      };
      
      allArticles.push(article);
      processedCount++;
      
      console.log(`  ✅ ${syncedArticle.title} (${textContent.length}字符) - ID: ${finalId.substring(0, 20)}...`);
    });
    
    console.log(`  📊 处理: ${processedCount}, 跳过: ${skippedCount}`);
  });
  
  // 按分类统计
  const categoryStats = {};
  allArticles.forEach(article => {
    if (!categoryStats[article.category_id]) {
      categoryStats[article.category_id] = 0;
    }
    categoryStats[article.category_id]++;
  });
  
  console.log(`\n📈 最终统计:`);
  console.log(`  总文章数: ${allArticles.length}`);
  console.log(`  去重前: ${data.account_results.reduce((sum, acc) => sum + acc.articles.length, 0)}`);
  console.log(`  去重率: ${((1 - allArticles.length / data.account_results.reduce((sum, acc) => sum + acc.articles.length, 0)) * 100).toFixed(1)}%`);
  
  console.log(`\n📊 分类分布:`);
  Object.entries(categoryStats).forEach(([categoryId, count]) => {
    console.log(`  ${categoryId}: ${count} 篇`);
  });
  
  // 检查ID唯一性
  const uniqueIds = new Set(allArticles.map(a => a.id));
  console.log(`\n🔑 ID检查:`);
  console.log(`  生成ID数: ${allArticles.length}`);
  console.log(`  唯一ID数: ${uniqueIds.size}`);
  
  if (allArticles.length === uniqueIds.size) {
    console.log(`  ✅ 所有ID都是唯一的！`);
  } else {
    console.log(`  ❌ 发现重复ID！`);
  }
  
  // 显示一些示例文章
  console.log(`\n📝 示例文章:`);
  allArticles.slice(0, 5).forEach((article, index) => {
    console.log(`  ${index + 1}. ${article.title}`);
    console.log(`     ID: ${article.id}`);
    console.log(`     分类: ${article.category_id}`);
    console.log(`     内容长度: ${article.textLength}字符`);
    console.log('');
  });
  
  return allArticles;
}

// 运行测试
testWebsiteData();
