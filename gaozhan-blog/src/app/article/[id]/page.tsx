import { notFound } from 'next/navigation';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';

// 模拟文章详情数据
const mockArticleDetail = {
  id: '1',
  title: '《江湖夜雨十年灯》——我的诗词创作心得',
  content: `
    <h2>前言</h2>
    <p>十年江湖夜雨，一盏孤灯相伴。诗词创作如同武林修行，需要内外兼修，心境与技法并重。今日与诸位江湖同道分享我多年来在诗词创作中的感悟与心得。</p>
    
    <h2>一、诗词创作的心境修炼</h2>
    <p>古人云："诗言志，歌咏言。"诗词创作首先要有感而发，情真意切。武林中有"心法"一说，诗词创作亦是如此。</p>
    
    <blockquote>
      <p>"江湖夜雨十年灯，一卷诗书伴此生。"</p>
      <footer>—— 高瞻</footer>
    </blockquote>
    
    <h3>1. 观察生活，感悟人生</h3>
    <p>诗词源于生活，高于生活。我们要用诗人的眼光去观察世界，用武者的心境去感悟人生。每一朵花开，每一片叶落，都可能成为诗词的灵感来源。</p>
    
    <h3>2. 读万卷书，行万里路</h3>
    <p>诗词创作需要深厚的文化底蕴。我常说，武功要练，书也要读。从《诗经》到唐诗宋词，从古典文学到现代诗歌，都是我们的营养源泉。</p>
    
    <h2>二、诗词技法的修炼之道</h2>
    <p>心境有了，技法也不能落下。正如武林高手需要扎实的基本功，诗词创作也有其技法要求。</p>
    
    <h3>1. 格律韵脚</h3>
    <p>古典诗词讲究格律，这如同武功招式，有其固定的套路。但套路只是基础，真正的高手是要在套路中融入自己的创新。</p>
    
    <h3>2. 意象运用</h3>
    <p>好的诗词善于运用意象。"月"可以是思乡，"竹"可以是气节，"剑"可以是豪情。意象的运用要恰到好处，不能生搬硬套。</p>
    
    <h2>三、我的创作心得</h2>
    <p>这些年来，我总结了几点创作心得，与大家分享：</p>
    
    <ol>
      <li><strong>真情实感最重要</strong>：再华美的辞藻，没有真情也是空壳。</li>
      <li><strong>反复修改是必须</strong>：好诗不厌百回改，这是创作的态度。</li>
      <li><strong>广泛阅读是基础</strong>：读得越多，笔下越有神。</li>
      <li><strong>生活体验是源泉</strong>：诗词来源于生活，体验越丰富，创作越精彩。</li>
    </ol>
    
    <h2>结语</h2>
    <p>诗词创作之路如武林修行，需要持之以恒的努力。愿与诸位江湖同道共勉，在文字的江湖中找到属于自己的那份精彩。</p>
    
    <p class="text-right"><em>高瞻于江湖书斋<br/>2023年6月15日</em></p>
  `,
  summary: '十年江湖夜雨，一盏孤灯相伴。诗词创作如同武林修行，需要内外兼修...',
  category_id: 'literary',
  category: {
    id: 'literary',
    name: '高瞻的文艺人生',
    slug: 'literary',
    color: 'amber-700',
    icon: 'fas fa-feather-alt',
    description: '诗词歌赋，琴棋书画',
    created_at: '2023-01-01'
  },
  cover_image: 'https://img.freepik.com/free-photo/traditional-chinese-calligraphy-brush-ink_1150-12978.jpg',
  publish_time: '2023-06-15',
  original_link: 'https://mp.weixin.qq.com/s/example',
  read_count: 1200,
  is_featured: true,
  created_at: '2023-06-15',
  updated_at: '2023-06-15'
};

// 模拟相关文章
const mockRelatedArticles = [
  {
    id: '4',
    title: '古风词韵：从《诗经》到现代诗歌的传承',
    content: '',
    summary: '从《诗经》的质朴天真到唐诗的雄浑壮丽，从宋词的婉约豪放到现代诗歌的自由奔放...',
    category_id: 'literary',
    category: {
      id: 'literary',
      name: '高瞻的文艺人生',
      slug: 'literary',
      color: 'amber-700',
      icon: 'fas fa-feather-alt',
      description: '诗词歌赋，琴棋书画',
      created_at: '2023-01-01'
    },
    publish_time: '2023-06-12',
    read_count: 980,
    is_featured: false,
    created_at: '2023-06-12',
    updated_at: '2023-06-12'
  },
  {
    id: '5',
    title: '书法心境：笔墨间的武侠精神',
    content: '',
    summary: '书法如剑法，需要内功深厚才能运笔如神。每一笔每一画都蕴含着武者的精神境界...',
    category_id: 'literary',
    category: {
      id: 'literary',
      name: '高瞻的文艺人生',
      slug: 'literary',
      color: 'amber-700',
      icon: 'fas fa-feather-alt',
      description: '诗词歌赋，琴棋书画',
      created_at: '2023-01-01'
    },
    publish_time: '2023-06-08',
    read_count: 1500,
    is_featured: false,
    created_at: '2023-06-08',
    updated_at: '2023-06-08'
  }
];

interface ArticlePageProps {
  params: {
    id: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  
  // 这里应该根据ID从数据库获取文章，现在用模拟数据
  const article = id === '1' ? mockArticleDetail : null;
  
  if (!article) {
    notFound();
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 获取分类颜色类名
  const getCategoryColorClass = (color: string) => {
    const baseColor = color?.replace('-700', '') || 'gray';
    return `bg-${baseColor}-100 text-${baseColor}-800`;
  };

  return (
    <div className="min-h-screen">
      {/* 文章头部 */}
      <header className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* 面包屑导航 */}
            <nav className="mb-6 text-sm">
              <Link href="/" className="text-amber-300 hover:text-white transition duration-300">
                江湖首页
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link 
                href={`/${article.category?.slug}`} 
                className="text-amber-300 hover:text-white transition duration-300"
              >
                {article.category?.name}
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-300">文章详情</span>
            </nav>

            {/* 分类标签 */}
            <div className="mb-4">
              <span className={`${getCategoryColorClass(article.category?.color || 'gray-700')} px-3 py-1 rounded-full text-sm font-medium`}>
                {article.category?.name}
              </span>
            </div>

            {/* 文章标题 */}
            <h1 className="title-font text-3xl md:text-4xl lg:text-5xl mb-6">
              {article.title}
            </h1>

            {/* 文章信息 */}
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <div className="flex items-center">
                <i className="fas fa-calendar-alt mr-2"></i>
                <span>{formatDate(article.publish_time)}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-eye mr-2"></i>
                <span>{article.read_count.toLocaleString()} 阅读</span>
              </div>
              {article.original_link && (
                <div className="flex items-center">
                  <i className="fas fa-link mr-2"></i>
                  <Link 
                    href={article.original_link} 
                    target="_blank" 
                    className="text-amber-300 hover:text-white transition duration-300"
                  >
                    原文链接
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <article className="py-16 bg-white bg-opacity-90">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* 封面图片 */}
            {article.cover_image && (
              <div className="mb-8">
                <img 
                  src={article.cover_image} 
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* 文章正文 */}
            <div 
              className="prose prose-lg max-w-none prose-headings:title-font prose-h2:text-2xl prose-h2:text-gray-800 prose-h2:border-b prose-h2:border-amber-200 prose-h2:pb-2 prose-h3:text-xl prose-h3:text-gray-700 prose-p:text-gray-700 prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50 prose-blockquote:p-4 prose-blockquote:my-6 prose-strong:text-gray-800 prose-ol:text-gray-700 prose-ul:text-gray-700"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* 文章底部信息 */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-700 mr-4">
                    <img 
                      src="https://img.freepik.com/free-photo/portrait-handsome-chinese-man-traditional-costume_23-2149436919.jpg" 
                      alt="高瞻" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">高瞻</h3>
                    <p className="text-sm text-gray-600">掌门人 · 智多星</p>
                  </div>
                </div>

                {/* 分享按钮 */}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">分享到：</span>
                  <button className="text-gray-600 hover:text-amber-700 transition duration-300">
                    <i className="fab fa-weixin text-xl"></i>
                  </button>
                  <button className="text-gray-600 hover:text-amber-700 transition duration-300">
                    <i className="fab fa-weibo text-xl"></i>
                  </button>
                  <button className="text-gray-600 hover:text-amber-700 transition duration-300">
                    <i className="fab fa-zhihu text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* 相关文章推荐 */}
      <section className="py-16 bg-gray-100 bg-opacity-80">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="title-font text-3xl text-gray-800 mb-4">相关武林秘籍</h2>
              <div className="flex justify-center">
                <div className="w-16 h-1 bg-amber-700 rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mockRelatedArticles.map((relatedArticle) => (
                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link 
                href={`/${article.category?.slug}`}
                className="inline-flex items-center bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-full transition duration-300 shadow-lg"
              >
                查看更多{article.category?.name}
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// 动态元数据
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  // 这里应该根据ID从数据库获取文章信息
  const article = id === '1' ? mockArticleDetail : null;
  
  if (!article) {
    return {
      title: '文章不存在 - 高瞻江湖',
    };
  }

  return {
    title: `${article.title} - 高瞻江湖`,
    description: article.summary,
    keywords: `${article.category?.name},高瞻,${article.title}`,
  };
}
