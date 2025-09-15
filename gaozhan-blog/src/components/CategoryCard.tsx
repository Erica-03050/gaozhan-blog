import Link from 'next/link';

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
  articleCount?: number;
}

export default function CategoryCard({ 
  name, 
  slug, 
  color, 
  icon, 
  description, 
  articleCount = 0 
}: CategoryCardProps) {
  // 获取主题颜色类名
  const getThemeClass = (color: string) => {
    return `theme-${color.replace('-700', '')}`;
  };

  const getTextColorClass = (color: string) => {
    const baseColor = color.replace('-700', '');
    return `text-${baseColor}-700 hover:text-${baseColor}-900`;
  };

  const getBadgeColorClass = (color: string) => {
    const baseColor = color.replace('-700', '');
    return `bg-${baseColor}-100 text-${baseColor}-800`;
  };

  return (
    <div className="section-card rounded-lg overflow-hidden">
      {/* 图标区域 */}
      <div className={`h-48 ${getThemeClass(color)} flex items-center justify-center`}>
        <i className={`${icon} text-white text-6xl`}></i>
      </div>
      
      {/* 内容区域 */}
      <div className="p-6">
        <h3 className="title-font text-2xl text-gray-800 mb-3">
          {name}
        </h3>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        <div className="flex justify-between items-center">
          <Link 
            href={`/${slug}`} 
            className={`${getTextColorClass(color)} font-medium transition duration-300`}
          >
            探索秘籍 <i className="fas fa-arrow-right ml-1"></i>
          </Link>
          <span className={`text-xs ${getBadgeColorClass(color)} px-2 py-1 rounded-full`}>
            {articleCount}篇
          </span>
        </div>
      </div>
    </div>
  );
}
