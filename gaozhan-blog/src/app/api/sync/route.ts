import { NextRequest, NextResponse } from 'next/server';

// Removed execAsync for Vercel compatibility

interface SyncRequest {
  maxPages?: number;
  getContent?: boolean;
  accounts?: string[];
}

interface SyncStats {
  total_accounts: number;
  total_articles: number;
  new_articles: number;
  updated_articles: number;
  errors: number;
  total_cost: number;
}

interface AccountResult {
  account_name: string;
  total: number;
  new_articles: number;
  errors: number;
  cost: number;
  articles: Record<string, unknown>[];
}

interface SyncResponse {
  success: boolean;
  message: string;
  data?: {
    sync_stats: SyncStats;
    account_results: AccountResult[];
    duration: number;
    result_file?: string;
  };
  error?: string;
}

/**
 * POST /api/sync - 启动微信公众号文章同步（Vercel兼容版本）
 */
export async function POST(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    const body: SyncRequest = await request.json();
    const { maxPages = 2, getContent = false } = body;

    console.log('🚀 开始同步微信公众号文章...');
    console.log(`参数: maxPages=${maxPages}, getContent=${getContent}`);

    // 在Vercel环境中，我们不能执行Python脚本
    // 这里返回一个模拟的成功响应，提醒用户需要集成数据库
    return NextResponse.json({
      success: false,
      message: 'Vercel环境不支持Python脚本执行，请使用监控API或集成数据库',
      error: 'Python execution not available in Vercel serverless environment'
    }, { status: 501 });

  } catch (error) {
    console.error('❌ 同步失败:', error);
    
    return NextResponse.json({
      success: false,
      message: '同步过程中发生错误',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * GET /api/sync - 获取同步状态和历史记录
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'history':
        return await getSyncHistory();
      case 'balance':
        return await getApiBalance();
      default:
        return await getSyncStatus();
    }

  } catch (error) {
    console.error('获取同步信息失败:', error);
    
    return NextResponse.json({
      success: false,
      message: '获取同步信息失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * 获取同步状态（Vercel兼容版本）
 */
async function getSyncStatus(): Promise<NextResponse> {
  try {
    // 在Vercel环境中，没有文件系统持久化
    // 返回基本状态信息
    return NextResponse.json({
      success: true,
      message: '暂无同步记录',
      data: {
        lastSync: null,
        totalArticles: 0,
        totalAccounts: 7
      }
    });

  } catch (error) {
    throw error;
  }
}

/**
 * 获取同步历史记录（Vercel兼容版本）
 */
async function getSyncHistory(): Promise<NextResponse> {
  try {
    // 在Vercel环境中，没有持久化的历史记录
    return NextResponse.json({
      success: true,
      message: '获取历史记录成功',
      data: {
        history: [],
        total: 0
      }
    });

  } catch (error) {
    throw error;
  }
}

/**
 * 获取API余额（Vercel兼容版本）
 */
async function getApiBalance(): Promise<NextResponse> {
  try {
    // 在Vercel环境中，不能执行Python脚本
    // 可以考虑通过HTTP API直接调用
    return NextResponse.json({
      success: false,
      message: 'Vercel环境不支持Python脚本，请手动查询余额',
      error: 'Balance check not available in Vercel environment'
    }, { status: 501 });

  } catch (err) {
    return NextResponse.json({
      success: false,
      message: '获取余额失败',
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
