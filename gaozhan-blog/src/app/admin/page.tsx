'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/types';

// 模拟文章数据
const mockArticles = [
  {
    id: '1',
    title: '《江湖夜雨十年灯》——我的诗词创作心得',
    category: '高瞻的文艺人生',
    publish_time: '2023-06-15',
    read_count: 1200,
    is_featured: true,
    sync_status: 'synced'
  },
  {
    id: '2',
    title: '奇门遁甲实战：如何预测商业机遇',
    category: '高瞻的数术人生',
    publish_time: '2023-06-10',
    read_count: 2400,
    is_featured: true,
    sync_status: 'synced'
  },
  {
    id: '3',
    title: '武林高手的交易心法：以静制动',
    category: '高瞻的交易人生',
    publish_time: '2023-06-05',
    read_count: 3100,
    is_featured: false,
    sync_status: 'pending'
  }
];

// 模拟同步日志
const mockSyncLogs = [
  {
    id: '1',
    time: '2023-06-15 14:30:25',
    action: '自动同步',
    result: '成功',
    details: '同步了3篇新文章',
    articles_count: 3
  },
  {
    id: '2',
    time: '2023-06-14 09:15:10',
    action: '手动同步',
    result: '成功', 
    details: '同步了1篇新文章',
    articles_count: 1
  },
  {
    id: '3',
    time: '2023-06-13 16:45:33',
    action: '自动同步',
    result: '失败',
    details: '微信Token过期',
    articles_count: 0
  }
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 真实同步功能
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxPages: 2,
          getContent: false
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`同步成功！获取了${result.data.sync_stats.total_articles}篇文章，费用${result.data.sync_stats.total_cost.toFixed(2)}元`);
        // 可以在这里刷新页面数据
        window.location.reload();
      } else {
        alert(`同步失败：${result.message}`);
      }
    } catch (error) {
      alert('同步过程中发生错误');
      console.error('同步失败:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 筛选文章
  const filteredArticles = mockArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category.includes(selectedCategory);
    const matchesSearch = article.title.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 管理后台头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <i className="fas fa-shield-alt text-amber-700 text-2xl mr-3"></i>
              <h1 className="title-font text-2xl text-gray-900">高瞻江湖管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`flex items-center px-4 py-2 rounded-lg text-white font-medium transition duration-300 ${
                  isSyncing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-amber-700 hover:bg-amber-800'
                }`}
              >
                <i className={`fas ${isSyncing ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
                {isSyncing ? '同步中...' : '一键同步'}
              </button>
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition duration-300"
              >
                <i className="fas fa-home mr-1"></i>
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 导航标签 */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'dashboard', label: '数据概览', icon: 'fas fa-chart-line' },
              { key: 'articles', label: '文章管理', icon: 'fas fa-file-alt' },
              { key: 'sync', label: '同步日志', icon: 'fas fa-history' },
              { key: 'settings', label: '系统设置', icon: 'fas fa-cog' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition duration-300 ${
                  activeTab === tab.key
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 数据概览 */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <i className="fas fa-file-alt text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总文章数</p>
                  <p className="text-2xl font-bold text-gray-900">67</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <i className="fas fa-eye text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总阅读量</p>
                  <p className="text-2xl font-bold text-gray-900">128.5k</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                  <i className="fas fa-layer-group text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">分类数量</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <i className="fas fa-clock text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">最后同步</p>
                  <p className="text-sm font-bold text-gray-900">2小时前</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 文章管理 */}
        {activeTab === 'articles' && (
          <div className="bg-white rounded-lg shadow">
            {/* 筛选工具栏 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="搜索文章标题..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">所有分类</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 文章列表 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      发布时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      阅读量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {article.title}
                            </div>
                            {article.is_featured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                置顶
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.publish_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.read_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.sync_status === 'synced' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.sync_status === 'synced' ? '已同步' : '待同步'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-amber-600 hover:text-amber-900 mr-3">
                          编辑
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 同步日志 */}
        {activeTab === 'sync' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">同步日志</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {mockSyncLogs.map((log) => (
                <div key={log.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        log.result === '成功' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        <i className={`fas ${
                          log.result === '成功' ? 'fa-check' : 'fa-times'
                        }`}></i>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {log.action} - {log.result}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.details}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 系统设置 */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">系统设置</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  微信公众号Token
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="请输入微信公众号Token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自动同步间隔（小时）
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  <option value="1">1小时</option>
                  <option value="6">6小时</option>
                  <option value="12">12小时</option>
                  <option value="24">24小时</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-classify"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-classify" className="ml-2 block text-sm text-gray-900">
                  启用智能分类
                </label>
              </div>

              <div className="pt-4">
                <button className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg transition duration-300">
                  保存设置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
