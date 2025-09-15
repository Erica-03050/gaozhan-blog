import Link from 'next/link';
import { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 获取分类颜色类名
  const getCategoryColorClass = (color: string) => {
    const baseColor = color?.replace('-700', '') || 'gray';
    return `bg-${baseColor}-100 text-${baseColor}-800`;
  };

  const getCategoryTextColorClass = (color: string) => {
    const baseColor = color?.replace('-700', '') || 'gray';
    return `text-${baseColor}-700 hover:text-${baseColor}-900`;
  };

  return (
    <div className="article-card p-6 rounded-lg shadow-md transition duration-300">
      {/* 文章头部信息 */}
      <div className="flex items-center mb-4">
        <span className={`${getCategoryColorClass(article.category?.color || 'gray-700')} px-3 py-1 rounded-full text-sm font-medium`}>
          {article.category?.name || '未分类'}
        </span>
        <span className="text-gray-500 text-sm ml-auto">
          {formatDate(article.publish_time)}
        </span>
      </div>

      {/* 文章标题 */}
      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
        {article.title}
      </h3>

      {/* 文章摘要 */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {article.summary}
      </p>

      {/* 文章底部信息 */}
      <div className="flex items-center">
        <img 
          src="https://img.icons8.com/ios/50/000000/reading.png" 
          alt="阅读" 
          className="w-6 h-6 mr-2" 
        />
        <span className="text-gray-500 text-sm">
          {article.read_count.toLocaleString()} 阅读
        </span>
        <Link 
          href={`/article/${article.id}`} 
          className={`ml-auto ${getCategoryTextColorClass(article.category?.color || 'gray-700')} font-medium transition duration-300`}
        >
          阅读全文 <i className="fas fa-arrow-right ml-1"></i>
        </Link>
      </div>
    </div>
  );
}
