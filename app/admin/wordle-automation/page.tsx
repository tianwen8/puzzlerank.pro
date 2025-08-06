'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Play, Square, Database, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface TaskResult {
  task: string;
  success: boolean;
  gameNumber?: number;
  message: string;
  executionTime: number;
  timestamp: string;
}

interface SchedulerStatus {
  isRunning: boolean;
  currentGameNumber: number;
  lastTask?: TaskResult;
  totalTasks: number;
  recentTasks: TaskResult[];
}

interface SystemStats {
  total: number;
  verified: number;
  candidates: number;
  verificationRate: number;
}

export default function WordleAutomationAdmin() {
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskRunning, setTaskRunning] = useState<string | null>(null);

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 获取调度器状态
      const statusResponse = await fetch('/api/wordle/auto?type=scheduler-status');
      const statusData = await statusResponse.json();
      if (statusData.success) {
        setSchedulerStatus(statusData.data);
      }
      
      // 获取系统统计
      const statsResponse = await fetch('/api/wordle/auto?type=stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setSystemStats(statsData.data);
      }
      
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 执行任务
  const runTask = async (action: string, params?: any) => {
    try {
      setTaskRunning(action);
      
      const response = await fetch('/api/wordle/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`任务执行成功: ${result.data?.message || '完成'}`);
        await loadData(); // 重新加载数据
      } else {
        alert(`任务执行失败: ${result.error}`);
      }
      
    } catch (error) {
      console.error('执行任务失败:', error);
      alert(`任务执行失败: ${error.message}`);
    } finally {
      setTaskRunning(null);
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />已验证</Badge>;
      case 'candidate':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />候选</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />已拒绝</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />未知</Badge>;
    }
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  useEffect(() => {
    loadData();
    // 每30秒自动刷新
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Wordle Automation System Admin
          </h1>
          <p className="text-gray-600">
            Manage Wordle answer collection, verification and scheduling system
          </p>
        </div>

        {/* 系统概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">调度器状态</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {schedulerStatus?.isRunning ? '运行中' : '已停止'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${schedulerStatus?.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">当前游戏</p>
                  <p className="text-2xl font-bold text-gray-900">
                    #{schedulerStatus?.currentGameNumber || 0}
                  </p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">验证率</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats ? Math.round(systemStats.verificationRate * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总任务数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {schedulerStatus?.totalTasks || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容 */}
        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="control">控制面板</TabsTrigger>
            <TabsTrigger value="tasks">任务历史</TabsTrigger>
            <TabsTrigger value="data">数据管理</TabsTrigger>
            <TabsTrigger value="settings">系统设置</TabsTrigger>
          </TabsList>

          {/* 控制面板 */}
          <TabsContent value="control" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 调度器控制 */}
              <Card>
                <CardHeader>
                  <CardTitle>调度器控制</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => runTask('start-scheduler')}
                      disabled={schedulerStatus?.isRunning || taskRunning === 'start-scheduler'}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      启动调度器
                    </Button>
                    <Button
                      onClick={() => runTask('stop-scheduler')}
                      disabled={!schedulerStatus?.isRunning || taskRunning === 'stop-scheduler'}
                      variant="outline"
                      className="flex-1"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      停止调度器
                    </Button>
                  </div>
                  <Button
                    onClick={loadData}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    刷新状态
                  </Button>
                </CardContent>
              </Card>

              {/* 手动任务 */}
              <Card>
                <CardHeader>
                  <CardTitle>手动执行任务</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => runTask('run-daily-collection')}
                    disabled={taskRunning === 'run-daily-collection'}
                    className="w-full"
                  >
                    {taskRunning === 'run-daily-collection' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    执行每日采集
                  </Button>
                  <Button
                    onClick={() => runTask('run-hourly-verification')}
                    disabled={taskRunning === 'run-hourly-verification'}
                    variant="outline"
                    className="w-full"
                  >
                    {taskRunning === 'run-hourly-verification' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    执行验证任务
                  </Button>
                  <Button
                    onClick={() => {
                      const start = prompt('起始游戏编号:', '1500');
                      const end = prompt('结束游戏编号:', '1510');
                      if (start && end) {
                        runTask('run-historical-backfill', {
                          startGameNumber: parseInt(start),
                          endGameNumber: parseInt(end)
                        });
                      }
                    }}
                    disabled={taskRunning === 'run-historical-backfill'}
                    variant="outline"
                    className="w-full"
                  >
                    {taskRunning === 'run-historical-backfill' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    历史数据回填
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 系统统计 */}
            {systemStats && (
              <Card>
                <CardHeader>
                  <CardTitle>系统统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{systemStats.total}</p>
                      <p className="text-sm text-gray-600">总预测数</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{systemStats.verified}</p>
                      <p className="text-sm text-gray-600">已验证</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{systemStats.candidates}</p>
                      <p className="text-sm text-gray-600">候选中</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round(systemStats.verificationRate * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">验证率</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 任务历史 */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>最近任务执行历史</CardTitle>
              </CardHeader>
              <CardContent>
                {schedulerStatus?.recentTasks?.length ? (
                  <div className="space-y-4">
                    {schedulerStatus.recentTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${task.success ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium">{task.task}</p>
                            <p className="text-sm text-gray-600">{task.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {task.gameNumber && `#${task.gameNumber}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(task.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {task.executionTime}ms
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">暂无任务历史</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>数据库操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => {
                      if (confirm('确定要清除所有候选预测吗？')) {
                        // TODO: 实现清除候选预测的API
                        alert('功能开发中...');
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    清除候选预测
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('确定要重置系统配置吗？')) {
                        // TODO: 实现重置配置的API
                        alert('功能开发中...');
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    重置系统配置
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>数据导出</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => {
                      // TODO: 实现数据导出功能
                      alert('功能开发中...');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    导出验证数据
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: 实现日志导出功能
                      alert('功能开发中...');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    导出采集日志
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 系统设置 */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>系统配置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">验证阈值设置</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          最小验证源数量
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          defaultValue={2}
                          min={1}
                          max={10}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          最小置信度
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          defaultValue={0.8}
                          min={0}
                          max={1}
                          step={0.1}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">调度设置</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          每日采集时间
                        </label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          defaultValue="00:01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          验证间隔（小时）
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          defaultValue={1}
                          min={1}
                          max={24}
                        />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    保存配置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}