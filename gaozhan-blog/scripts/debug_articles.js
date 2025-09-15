const fs = require('fs');
const path = require('path');

// 获取最新的同步数据文件
function getLatestSyncFile() {
  const files = fs.readdirSync(__dirname + '/..');
  const syncFiles = files.filter(f => f.startsWith('sync_results_') && f.endsWith('.json'));
  
  if (syncFiles.length === 0) {
    return null;
  }
  
  const latestFile = syncFiles.sort().reverse()[0];
  return path.join(__dirname, '..', latestFile);
}

// 调试文章重复问题
function debugArticles() {
  const syncFile = getLatestSyncFile();
  if (!syncFile) {
    console.log('❌ 未找到同步数据文件');
    return;
  }
  
  console.log(`🔍 调试文件: ${path.basename(syncFile)}`);
  
  const data = JSON.parse(fs.readFileSync(syncFile, 'utf8'));
  
  const titleCounts = {};
  const wechatIdCounts = {};
  const urlCounts = {};
  
  let totalArticles = 0;
  let qualityArticles = 0;
  
  data.account_results.forEach((account) => {
    console.log(`\n📋 ${account.account_name} (${account.articles.length} 篇):`);
    
    account.articles.forEach((article, index) => {
      totalArticles++;
      
      // 统计标题重复
      if (titleCounts[article.title]) {
        titleCounts[article.title]++;
        console.log(`  🔄 重复标题: ${article.title} (第${titleCounts[article.title]}次)`);
      } else {
        titleCounts[article.title] = 1;
      }
      
      // 统计微信ID重复
      if (article.wechat_article_id) {
        if (wechatIdCounts[article.wechat_article_id]) {
          wechatIdCounts[article.wechat_article_id]++;
          console.log(`  🔄 重复微信ID: ${article.wechat_article_id} - ${article.title}`);
        } else {
          wechatIdCounts[article.wechat_article_id] = 1;
        }
      }
      
      // 统计URL重复
      if (urlCounts[article.original_url]) {
        urlCounts[article.original_url]++;
        console.log(`  🔄 重复URL: ${article.original_url}`);
      } else {
        urlCounts[article.original_url] = 1;
      }
      
      // 检查内容质量
      const content = article.content_html || article.content || '';
      const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      
      if (article.fetch_success === false) {
        console.log(`  ❌ ${article.title} - ${article.fetch_error}`);
      } else if (textContent.length >= 200) {
        qualityArticles++;
        console.log(`  ✅ ${article.title} (${textContent.length}字符)`);
      } else {
        console.log(`  ⚠️  ${article.title} - 内容过短 (${textContent.length}字符)`);
      }
    });
  });
  
  // 统计重复情况
  const duplicateTitles = Object.entries(titleCounts).filter(([title, count]) => count > 1);
  const duplicateWechatIds = Object.entries(wechatIdCounts).filter(([id, count]) => count > 1);
  const duplicateUrls = Object.entries(urlCounts).filter(([url, count]) => count > 1);
  
  console.log(`\n📊 重复统计:`);
  console.log(`  重复标题: ${duplicateTitles.length}`);
  console.log(`  重复微信ID: ${duplicateWechatIds.length}`);
  console.log(`  重复URL: ${duplicateUrls.length}`);
  
  if (duplicateTitles.length > 0) {
    console.log(`\n🔄 重复标题详情:`);
    duplicateTitles.forEach(([title, count]) => {
      console.log(`  "${title}" - 出现${count}次`);
    });
  }
  
  if (duplicateWechatIds.length > 0) {
    console.log(`\n🔄 重复微信ID详情:`);
    duplicateWechatIds.forEach(([id, count]) => {
      console.log(`  ${id} - 出现${count}次`);
    });
  }
  
  console.log(`\n📈 总体统计:`);
  console.log(`  总文章数: ${totalArticles}`);
  console.log(`  优质文章: ${qualityArticles} (${(qualityArticles/totalArticles*100).toFixed(1)}%)`);
  console.log(`  去重后预计: ${totalArticles - duplicateTitles.length} 篇`);
}

// 运行调试
debugArticles();
