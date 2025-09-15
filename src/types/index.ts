// 文章分类类型
export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
  created_at: string;
}

// 文章类型
export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  category_id: string;
  category?: Category;
  cover_image?: string;
  publish_time: string;
  original_link?: string;
  read_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// 首页数据类型
export interface HomeData {
  categories: Category[];
  featured_articles: Article[];
  latest_articles: Article[];
  stats: {
    total_articles: number;
    total_reads: number;
    categories_count: number;
  };
}

// 分页类型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: Pagination;
}

// 8个板块配置
export const CATEGORIES = [
  {
    id: 'literary',
    name: '高瞻的文艺人生',
    slug: 'literary',
    color: 'amber-700',
    icon: 'fas fa-feather-alt',
    description: '诗词歌赋，琴棋书画，文人雅士之风流'
  },
  {
    id: 'math',
    name: '高瞻的数术人生',
    slug: 'math',
    color: 'blue-700',
    icon: 'fas fa-square-root-alt',
    description: '阴阳五行，奇门遁甲，数术玄机之奥秘'
  },
  {
    id: 'wisdom',
    name: '高瞻的智慧人生',
    slug: 'wisdom',
    color: 'purple-700',
    icon: 'fas fa-lightbulb',
    description: '处世哲学，人生智慧，明心见性之真谛'
  },
  {
    id: 'trading',
    name: '高瞻的交易人生',
    slug: 'trading',
    color: 'green-700',
    icon: 'fas fa-coins',
    description: '商场如战场，交易似博弈'
  },
  {
    id: 'consulting',
    name: '高瞻的咨询人生',
    slug: 'consulting',
    color: 'red-700',
    icon: 'fas fa-comments',
    description: '答疑解惑，指点迷津'
  },
  {
    id: 'tax',
    name: '高瞻的税筹人生',
    slug: 'tax',
    color: 'indigo-700',
    icon: 'fas fa-file-invoice-dollar',
    description: '财税之道，精打细算'
  },
  {
    id: 'music',
    name: '高瞻的音乐人生',
    slug: 'music',
    color: 'orange-700',
    icon: 'fas fa-music',
    description: '音律和谐，天籁之音'
  },
  {
    id: 'debate',
    name: '高瞻的論正人生',
    slug: 'debate',
    color: 'gray-700',
    icon: 'fas fa-balance-scale',
    description: '辩论明理，论证求真'
  }
] as const;