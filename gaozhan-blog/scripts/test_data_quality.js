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

// 分析数据质量
function analyzeDataQuality() {
  const syncFile = getLatestSyncFile();
  if (!syncFile) {
    console.log('❌ 未找到同步数据文件');
    return;
  }
  
  console.log(`📊 分析文件: ${path.basename(syncFile)}`);
  
  const data = JSON.parse(fs.readFileSync(syncFile, 'utf8'));
  
  let totalArticles = 0;
  let qualityArticles = 0;
  let failedArticles = 0;
  let emptyContentArticles = 0;
  let imageOnlyArticles = 0;
  
  const categoryStats = {};
  
  data.account_results.forEach((account, accountIndex) => {
    console.log(`\n📋 ${account.account_name}:`);
    
    let accountQuality = 0;
    let accountTotal = 0;
    
    account.articles.forEach((article, articleIndex) => {
      totalArticles++;
      accountTotal++;
      
      // 检查获取状态
      if (article.fetch_success === false) {
        failedArticles++;
        console.log(`  ❌ ${article.title} - ${article.fetch_error}`);
        return;
      }
      
      // 检查内容质量
      const content = article.content_html || article.content || '';
      const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      
      if (!content) {
        emptyContentArticles++;
        console.log(`  ⚪ ${article.title} - 无内容`);
        return;
      }
      
      if (textContent.length < 200) {
        const hasImages = content.includes('<img') || content.includes('mmbiz.qpic.cn');
        if (hasImages && textContent.length < 100) {
          imageOnlyArticles++;
          console.log(`  🖼️  ${article.title} - 仅图片内容`);
          return;
        }
      }
      
      // 统计分类
      if (!categoryStats[article.category_id]) {
        categoryStats[article.category_id] = { total: 0, quality: 0 };
      }
      categoryStats[article.category_id].total++;
      
      if (textContent.length >= 200) {
        qualityArticles++;
        accountQuality++;
        categoryStats[article.category_id].quality++;
        console.log(`  ✅ ${article.title} - 优质内容 (${textContent.length}字符)`);
      }
    });
    
    console.log(`  📊 质量统计: ${accountQuality}/${accountTotal} (${(accountQuality/accountTotal*100).toFixed(1)}%)`);
  });
  
  console.log(`\n📈 总体统计:`);
  console.log(`  总文章数: ${totalArticles}`);
  console.log(`  优质文章: ${qualityArticles} (${(qualityArticles/totalArticles*100).toFixed(1)}%)`);
  console.log(`  获取失败: ${failedArticles} (${(failedArticles/totalArticles*100).toFixed(1)}%)`);
  console.log(`  空内容: ${emptyContentArticles} (${(emptyContentArticles/totalArticles*100).toFixed(1)}%)`);
  console.log(`  仅图片: ${imageOnlyArticles} (${(imageOnlyArticles/totalArticles*100).toFixed(1)}%)`);
  
  console.log(`\n📊 分类统计:`);
  Object.entries(categoryStats).forEach(([categoryId, stats]) => {
    const percentage = (stats.quality / stats.total * 100).toFixed(1);
    console.log(`  ${categoryId}: ${stats.quality}/${stats.total} (${percentage}%)`);
  });
  
  console.log(`\n✨ 数据质量评估:`);
  const qualityRatio = qualityArticles / totalArticles;
  if (qualityRatio >= 0.7) {
    console.log(`  🎉 优秀 - 质量比例: ${(qualityRatio*100).toFixed(1)}%`);
  } else if (qualityRatio >= 0.5) {
    console.log(`  👍 良好 - 质量比例: ${(qualityRatio*100).toFixed(1)}%`);
  } else if (qualityRatio >= 0.3) {
    console.log(`  ⚠️  一般 - 质量比例: ${(qualityRatio*100).toFixed(1)}%`);
  } else {
    console.log(`  ❌ 较差 - 质量比例: ${(qualityRatio*100).toFixed(1)}%`);
  }
}

// 运行分析
analyzeDataQuality();
