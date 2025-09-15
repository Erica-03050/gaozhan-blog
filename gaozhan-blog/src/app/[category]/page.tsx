import { notFound } from 'next/navigation';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { CATEGORIES } from '@/types';

// 模拟文章数据
const mockArticles = [
  {
    id: '1',
    title: '《江湖夜雨十年灯》——我的诗词创作心得',
    content: '',
    summary: '十年江湖夜雨，一盏孤灯相伴。诗词创作如同武林修行，需要内外兼修，心境与技法并重。本文将分享我多年来在诗词创作中的感悟与心得...',
    category_id: 'literary',
    publish_time: '2023-06-15',
    read_count: 1200,
    is_featured: true,
    created_at: '2023-06-15',
    updated_at: '2023-06-15'
  },
  {
    id: '4',
    title: '古风词韵：从《诗经》到现代诗歌的传承',
    content: '',
    summary: '从《诗经》的质朴天真到唐诗的雄浑壮丽，从宋词的婉约豪放到现代诗歌的自由奔放，中华诗歌传统源远流长...',
    category_id: 'literary',
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
    publish_time: '2023-06-08',
    read_count: 1500,
    is_featured: false,
    created_at: '2023-06-08',
    updated_at: '2023-06-08'
  }
];

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  
  // 查找对应的分类信息
  const categoryInfo = CATEGORIES.find(cat => cat.slug === category);
  
  if (!categoryInfo) {
    notFound();
  }

  // 筛选对应分类的文章 (这里用模拟数据，实际应该从数据库获取)
  const categoryArticles = mockArticles.filter(article => 
    article.category_id === categoryInfo.id
  );

  // 分页处理
  const articlesPerPage = 12;
  const totalPages = Math.ceil(categoryArticles.length / articlesPerPage);
  const startIndex = (page - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const paginatedArticles = categoryArticles.slice(startIndex, endIndex);

  // 为文章添加分类信息
  const articlesWithCategory = paginatedArticles.map(article => ({
    ...article,
    category: categoryInfo
  }));

  // 获取主题颜色类名
  const getThemeClass = (color: string) => {
    return `theme-${color.replace('-700', '')}`;
  };

  return (
    <div className="min-h-screen">
      {/* 分类页面头部 */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getThemeClass(categoryInfo.color)} mb-6`}>
              <i className={`${categoryInfo.icon} text-3xl text-white`}></i>
            </div>
            <h1 className="title-font text-4xl md:text-5xl mb-4">
              {categoryInfo.name}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {categoryInfo.description}
            </p>
            <div className="mt-6 text-sm text-gray-400">
              共 {categoryArticles.length} 篇武林秘籍
            </div>
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section className="py-16 bg-white bg-opacity-90">
        <div className="container mx-auto px-4">
          {articlesWithCategory.length > 0 ? (
            <>
              {/* 文章网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articlesWithCategory.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-2">
                    {/* 上一页 */}
                    {page > 1 && (
                      <a
                        href={`/${category}?page=${page - 1}`}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300"
                      >
                        上一页
                      </a>
                    )}

                    {/* 页码 */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <a
                        key={pageNum}
                        href={`/${category}?page=${pageNum}`}
                        className={`px-4 py-2 rounded-lg transition duration-300 ${
                          pageNum === page
                            ? 'bg-amber-700 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </a>
                    ))}

                    {/* 下一页 */}
                    {page < totalPages && (
                      <a
                        href={`/${category}?page=${page + 1}`}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300"
                      >
                        下一页
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* 空状态 */
            <div className="text-center py-16">
              <div className="mb-6">
                <i className="fas fa-scroll text-6xl text-gray-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                暂无武林秘籍
              </h3>
              <p className="text-gray-600 mb-8">
                高瞻正在此板块潜心修炼，敬请期待...
              </p>
              <Link
                href="/"
                className="inline-flex items-center bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-full transition duration-300 shadow-lg"
              >
                返回江湖首页
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// 生成所有可能的分类路径
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

// 动态元数据
export async function generateMetadata({ params }: { params: { category: string } }) {
  const { category } = await params;
  const categoryInfo = CATEGORIES.find(cat => cat.slug === category);
  
  if (!categoryInfo) {
    return {
      title: '分类不存在 - 高瞻江湖',
    };
  }

  return {
    title: `${categoryInfo.name} - 高瞻江湖`,
    description: `${categoryInfo.description} - 高瞻毕生所学，尽在此处。`,
  };
}
