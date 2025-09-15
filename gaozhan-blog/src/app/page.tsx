import HeroBanner from '@/components/HeroBanner';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import CategoryCard from '@/components/CategoryCard';
import ArticleCard from '@/components/ArticleCard';
import { CATEGORIES } from '@/types';
import { getHomeData } from '@/lib/dataService';
import Link from 'next/link';

// 模拟最新文章数据
const mockLatestArticles = [
  {
    id: '1',
    title: '《江湖夜雨十年灯》——我的诗词创作心得',
    content: '',
    summary: '十年江湖夜雨，一盏孤灯相伴。诗词创作如同武林修行，需要内外兼修...',
    category_id: 'literary',
    category: {
      id: 'literary',
      name: '文艺人生',
      slug: 'literary',
      color: 'amber-700',
      icon: 'fas fa-feather-alt',
      description: '诗词歌赋，琴棋书画',
      created_at: '2023-01-01'
    },
    publish_time: '2023-06-15',
    read_count: 1200,
    is_featured: true,
    created_at: '2023-06-15',
    updated_at: '2023-06-15'
  },
  {
    id: '2',
    title: '奇门遁甲实战：如何预测商业机遇',
    content: '',
    summary: '将古老的奇门遁甲之术应用于现代商业决策，准确预测市场变化...',
    category_id: 'math',
    category: {
      id: 'math',
      name: '数术人生',
      slug: 'math',
      color: 'blue-700',
      icon: 'fas fa-square-root-alt',
      description: '阴阳五行，奇门遁甲',
      created_at: '2023-01-01'
    },
    publish_time: '2023-06-10',
    read_count: 2400,
    is_featured: true,
    created_at: '2023-06-10',
    updated_at: '2023-06-10'
  },
  {
    id: '3',
    title: '武林高手的交易心法：以静制动',
    content: '',
    summary: '将武术中的"以静制动"哲学应用于金融市场交易，等待最佳时机...',
    category_id: 'trading',
    category: {
      id: 'trading',
      name: '交易人生',
      slug: 'trading',
      color: 'green-700',
      icon: 'fas fa-coins',
      description: '商场如战场，交易似博弈',
      created_at: '2023-01-01'
    },
    publish_time: '2023-06-05',
    read_count: 3100,
    is_featured: true,
    created_at: '2023-06-05',
    updated_at: '2023-06-05'
  }
];

// 模拟文章统计数据
const mockArticleCounts = {
  literary: 12,
  math: 8,
  wisdom: 15,
  trading: 10,
  consulting: 7,
  tax: 5,
  music: 6,
  debate: 4
};

export default function Home() {
  // 获取真实的同步数据
  const homeData = getHomeData();
  return (
    <>
      {/* 英雄横幅 */}
      <HeroBanner />

      {/* 关于掌门人 */}
      <AboutSection />

      {/* 武林秘籍分类 */}
      <section id="articles" className="py-20 bg-white bg-opacity-95">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="title-font text-4xl text-gray-800 mb-4">武林秘籍</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              高瞻毕生所学，尽在此处。八大板块，涵盖文武之道。
            </p>
            <div className="flex justify-center mt-4">
              <div className="w-24 h-1 bg-amber-700 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {CATEGORIES.map((category, index) => (
              <div key={category.id} className={`delay-${(index + 1) * 100}`}>
                <CategoryCard
                  {...category}
                  articleCount={mockArticleCounts[category.id as keyof typeof mockArticleCounts]}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最新文章 */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 bg-opacity-90">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="title-font text-4xl text-gray-800 mb-4">最新武林秘籍</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              高瞻最新撰写的江湖秘籍，先睹为快
            </p>
            <div className="flex justify-center mt-4">
              <div className="w-24 h-1 bg-amber-700 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homeData.latest_articles.slice(0, 6).map((article, index) => (
              <div key={article.id} className={`delay-${(index + 1) * 200}`}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/articles" 
              className="inline-flex items-center bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-full transition duration-300 shadow-lg"
            >
              查看更多武林秘籍
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* 江湖联系 */}
      <ContactSection />
    </>
  );
}