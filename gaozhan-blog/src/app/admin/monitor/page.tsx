'use client';

import { useState, useEffect } from 'react';

interface MonitorResult {
  timestamp: string;
  accounts: Array<{
    category_id: string;
    account_name: string;
    success: boolean;
    articles: Array<{
      id: string;
      title: string;
      url: string;
      cover_image: string;
      digest: string;
      post_time: string;
      category_id: string;
      original_category: string;
    }>;
    cost: number;
    total_articles: number;
  }>;
  summary: {
    total_accounts: number;
    total_articles: number;
    total_cost: number;
    new_articles: number;
  };
}

export default function MonitorPage() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitorResult, setMonitorResult] = useState<MonitorResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 获取最新监控结果
  const fetchLatestResult = async () => {
    try {
      const response = await fetch('/api/monitor');
      const data = await response.json();
      
      if (data.success && data.data) {
        setMonitorResult(data.data);
        setLastUpdate(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('获取监控结果失败:', error);
    }
  };

  // 执行监控
  const handleMonitor = async () => {
    setIsMonitoring(true);
    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setMonitorResult(result.data);
        setLastUpdate(new Date().toLocaleString());
        alert(`监控成功！获取了${result.data.summary.total_articles}篇文章，费用${result.data.summary.total_cost.toFixed(2)}元`);
      } else {
        alert(`监控失败：${result.message}`);
      }
    } catch (error) {
      alert('监控过程中发生错误');
      console.error('监控失败:', error);
    } finally {
      setIsMonitoring(false);
    }
  };

  // 页面加载时获取最新结果
  useEffect(() => {
    fetchLatestResult();
  }, []);

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const categories: Record<string, string> = {
      'literary': '高瞻的文艺人生',
      'wisdom': '高瞻的智慧人生',
      'trading': '高瞻的交易人生',
      'consulting': '高瞻的咨询人生',
      'music': '高瞻的音乐人生',
      'zhengming': '高瞻的論正人生',
      'shushu': '高瞻的术数人生',
    };
    return categories[categoryId] || categoryId;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">实时监控系统</h1>
          <p className="mt-2 text-gray-600">监控7个微信公众号的实时发文情况</p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">监控控制</h2>
              <p className="text-sm text-gray-500">
                {lastUpdate ? `上次更新: ${lastUpdate}` : '暂无监控数据'}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={fetchLatestResult}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                刷新数据
              </button>
              <button
                onClick={handleMonitor}
                disabled={isMonitoring}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  isMonitoring
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isMonitoring ? '监控中...' : '立即监控'}
              </button>
            </div>
          </div>
        </div>

        {/* 监控结果 */}
        {monitorResult && (
          <>
            {/* 统计概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-users text-blue-400 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          监控账号
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {monitorResult.summary.total_accounts}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-newspaper text-green-400 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          今日文章
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {monitorResult.summary.total_articles}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-star text-yellow-400 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          新文章
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {monitorResult.summary.new_articles}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-dollar-sign text-red-400 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          监控费用
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ¥{monitorResult.summary.total_cost.toFixed(2)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 账号详情 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  账号监控详情
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  各公众号今日发文情况
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {monitorResult.accounts.map((account, index) => (
                  <li key={index}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                            account.success ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {account.account_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {account.success 
                                ? `${account.articles.length} 篇文章，费用 ¥${account.cost.toFixed(2)}`
                                : '获取失败'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCategoryName(account.category_id)}
                        </div>
                      </div>
                      
                      {/* 文章列表 */}
                      {account.success && account.articles.length > 0 && (
                        <div className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {account.articles.slice(0, 6).map((article, articleIndex) => (
                              <div key={articleIndex} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-start space-x-3">
                                  {article.cover_image && (
                                    <img
                                      src={article.cover_image}
                                      alt={article.title}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                      {article.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {article.post_time}
                                    </p>
                                    <div className="flex items-center mt-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        article.category_id !== article.original_category
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {article.category_id !== article.original_category && '🤖 '}
                                        {getCategoryName(article.category_id)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {account.articles.length > 6 && (
                            <p className="text-sm text-gray-500 mt-2">
                              还有 {account.articles.length - 6} 篇文章...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
