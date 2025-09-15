import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

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
 * POST /api/sync - 启动微信公众号文章同步
 */
export async function POST(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    const body: SyncRequest = await request.json();
    const { maxPages = 2, getContent = false } = body;

    console.log('🚀 开始同步微信公众号文章...');
    console.log(`参数: maxPages=${maxPages}, getContent=${getContent}`);

    // Python脚本路径
    const scriptPath = path.join(process.cwd(), 'scripts', 'wechat_syncer.py');
    
    // 检查脚本是否存在
    try {
      await fs.access(scriptPath);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: '同步脚本不存在',
        error: `Script not found: ${scriptPath}`
      }, { status: 500 });
    }

    // 构建Python命令
    const command = `python "${scriptPath}"`;
    
    console.log(`执行命令: ${command}`);

    // 执行Python脚本
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 300000, // 5分钟超时
      encoding: 'utf8'
    });

    if (stderr) {
      console.warn('Python stderr:', stderr);
    }

    console.log('Python stdout:', stdout);

    // 查找最新的结果文件
    const resultsDir = process.cwd();
    const files = await fs.readdir(resultsDir);
    const resultFiles = files.filter(f => f.startsWith('sync_results_') && f.endsWith('.json'));
    
    if (resultFiles.length === 0) {
      return NextResponse.json({
        success: false,
        message: '未找到同步结果文件',
        error: 'No result file found'
      }, { status: 500 });
    }

    // 获取最新的结果文件
    const latestFile = resultFiles.sort().reverse()[0];
    const resultPath = path.join(resultsDir, latestFile);
    
    // 读取同步结果
    const resultContent = await fs.readFile(resultPath, 'utf8');
    const syncResult = JSON.parse(resultContent);

    console.log('✅ 同步完成，结果:', syncResult.sync_stats);

    return NextResponse.json({
      success: true,
      message: '同步完成',
      data: {
        ...syncResult,
        result_file: latestFile
      }
    });

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
 * 获取同步状态
 */
async function getSyncStatus(): Promise<NextResponse> {
  try {
    // 查找最近的同步结果文件
    const resultsDir = process.cwd();
    const files = await fs.readdir(resultsDir);
    const resultFiles = files.filter(f => f.startsWith('sync_results_') && f.endsWith('.json'));
    
    if (resultFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '暂无同步记录',
        data: {
          lastSync: null,
          totalArticles: 0,
          totalAccounts: 7
        }
      });
    }

    // 获取最新的结果文件
    const latestFile = resultFiles.sort().reverse()[0];
    const resultPath = path.join(resultsDir, latestFile);
    const resultContent = await fs.readFile(resultPath, 'utf8');
    const syncResult = JSON.parse(resultContent);

    // 从文件名提取时间
    const timestamp = latestFile.replace('sync_results_', '').replace('.json', '');
    const lastSyncTime = `${timestamp.slice(0,4)}-${timestamp.slice(4,6)}-${timestamp.slice(6,8)} ${timestamp.slice(9,11)}:${timestamp.slice(11,13)}:${timestamp.slice(13,15)}`;

    return NextResponse.json({
      success: true,
      message: '获取状态成功',
      data: {
        lastSync: lastSyncTime,
        lastSyncFile: latestFile,
        ...syncResult.sync_stats,
        accounts: syncResult.account_results?.map((acc: AccountResult) => ({
          name: acc.account_name,
          articles: acc.articles?.length || 0,
          errors: acc.errors || 0,
          cost: acc.cost || 0
        })) || []
      }
    });

  } catch (error) {
    throw error;
  }
}

/**
 * 获取同步历史记录
 */
async function getSyncHistory(): Promise<NextResponse> {
  try {
    const resultsDir = process.cwd();
    const files = await fs.readdir(resultsDir);
    const resultFiles = files.filter(f => f.startsWith('sync_results_') && f.endsWith('.json'));
    
    const history = await Promise.all(
      resultFiles.sort().reverse().slice(0, 10).map(async (file) => {
        try {
          const filePath = path.join(resultsDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          
          const timestamp = file.replace('sync_results_', '').replace('.json', '');
          const syncTime = `${timestamp.slice(0,4)}-${timestamp.slice(4,6)}-${timestamp.slice(6,8)} ${timestamp.slice(9,11)}:${timestamp.slice(11,13)}:${timestamp.slice(13,15)}`;
          
          return {
            file,
            syncTime,
            ...data.sync_stats,
            duration: data.duration || 0
          };
        } catch (error) {
          console.warn(`解析文件 ${file} 失败:`, error);
          return null;
        }
      })
    );

    const validHistory = history.filter(h => h !== null);

    return NextResponse.json({
      success: true,
      message: '获取历史记录成功',
      data: {
        history: validHistory,
        total: validHistory.length
      }
    });

  } catch (error) {
    throw error;
  }
}

/**
 * 获取API余额
 */
async function getApiBalance(): Promise<NextResponse> {
  try {
    // 执行余额查询脚本
    const balanceScript = path.join(process.cwd(), 'scripts', 'check_balance.py');
    
    // 如果余额查询脚本不存在，创建一个简单的
    try {
      await fs.access(balanceScript);
    } catch {
      const balanceCode = `
import sys
sys.path.append('${path.join(process.cwd(), 'scripts')}')
from wechat_syncer import WeChatBatchSyncer

syncer = WeChatBatchSyncer("JZLebac614e9c88d8b4")
balance = syncer.get_account_balance()
print(f"BALANCE:{balance}")
`;
      await fs.writeFile(balanceScript, balanceCode);
    }

    const { stdout } = await execAsync(`python "${balanceScript}"`, {
      timeout: 30000
    });

    const balanceMatch = stdout.match(/BALANCE:([\d.]+)/);
    const balance = balanceMatch ? parseFloat(balanceMatch[1]) : 0;

    return NextResponse.json({
      success: true,
      message: '获取余额成功',
      data: {
        balance,
        currency: '元'
      }
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      message: '获取余额失败',
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
