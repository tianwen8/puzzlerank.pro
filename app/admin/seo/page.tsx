"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react'

interface SitemapStatus {
  success: boolean
  sitemaps: Array<{
    feedpath: string
    lastSubmitted: string
    isPending: boolean
    isSitemapsIndex: boolean
    type: string
    lastDownloaded: string
    warnings: number
    errors: number
  }>
}

interface SchedulerStatus {
  isRunning: boolean
  config: {
    enableAutoSubmission: boolean
    submissionInterval: number
    maxUrlsPerBatch: number
    retryAttempts: number
  }
}

export default function SEOAdminPage() {
  const [sitemapStatus, setSitemapStatus] = useState<SitemapStatus | null>(null)
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any>(null)

  // 获取sitemap状态
  const fetchSitemapStatus = async () => {
    try {
      const response = await fetch('/api/seo/submit-sitemap?action=status')
      const data = await response.json()
      setSitemapStatus(data)
    } catch (error) {
      console.error('Failed to fetch sitemap status:', error)
    }
  }

  // 获取调度器状态
  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/seo/submit-sitemap?action=scheduler-status')
      const data = await response.json()
      setSchedulerStatus(data)
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error)
    }
  }

  // 手动提交sitemap
  const handleManualSubmission = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seo/submit-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' })
      })
      const result = await response.json()
      setSubmissionResult(result)
      
      // 刷新状态
      await fetchSitemapStatus()
    } catch (error) {
      console.error('Failed to submit sitemap:', error)
      setSubmissionResult({ 
        success: false, 
        message: 'Failed to submit sitemap' 
      })
    } finally {
      setLoading(false)
    }
  }

  // 触发手动调度
  const handleManualScheduler = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seo/submit-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manual' })
      })
      const result = await response.json()
      setSubmissionResult(result)
    } catch (error) {
      console.error('Failed to trigger manual scheduler:', error)
    } finally {
      setLoading(false)
    }
  }

  // 刷新所有数据
  const refreshAll = async () => {
    setLoading(true)
    await Promise.all([
      fetchSitemapStatus(),
      fetchSchedulerStatus()
    ])
    setLoading(false)
  }

  useEffect(() => {
    refreshAll()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO Management</h1>
            <p className="text-gray-600 mt-2">
              Manage sitemap submissions and search engine optimization
            </p>
          </div>
          <Button onClick={refreshAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* 提交结果通知 */}
        {submissionResult && (
          <Card className={`border-l-4 ${
            submissionResult.success 
              ? 'border-l-green-500 bg-green-50' 
              : 'border-l-red-500 bg-red-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center">
                {submissionResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className={
                  submissionResult.success ? 'text-green-800' : 'text-red-800'
                }>
                  {submissionResult.message}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sitemap状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Sitemap Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sitemapStatus?.success ? (
                <div className="space-y-3">
                  {sitemapStatus.sitemaps.length > 0 ? (
                    sitemapStatus.sitemaps.map((sitemap, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {sitemap.feedpath}
                          </span>
                          <Badge variant={sitemap.errors > 0 ? 'destructive' : 'default'}>
                            {sitemap.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Last Submitted: {sitemap.lastSubmitted || 'Never'}</div>
                          <div>Last Downloaded: {sitemap.lastDownloaded || 'Never'}</div>
                          {sitemap.warnings > 0 && (
                            <div className="text-yellow-600">
                              Warnings: {sitemap.warnings}
                            </div>
                          )}
                          {sitemap.errors > 0 && (
                            <div className="text-red-600">
                              Errors: {sitemap.errors}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No sitemaps found
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-red-500">
                  Failed to load sitemap status
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleManualSubmission} 
                  disabled={loading}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Sitemap Manually
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 调度器状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Scheduler Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedulerStatus ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant={schedulerStatus.isRunning ? 'default' : 'secondary'}>
                      {schedulerStatus.isRunning ? 'Running' : 'Stopped'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Auto Submission:</span>
                      <span className={
                        schedulerStatus.config.enableAutoSubmission 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }>
                        {schedulerStatus.config.enableAutoSubmission ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Interval:</span>
                      <span>{schedulerStatus.config.submissionInterval}h</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Max URLs/Batch:</span>
                      <span>{schedulerStatus.config.maxUrlsPerBatch}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Retry Attempts:</span>
                      <span>{schedulerStatus.config.retryAttempts}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Loading scheduler status...
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleManualScheduler} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Trigger Manual Run
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Search className="w-6 h-6 mb-2" />
                <span>Check Index Status</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span>View Analytics</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col">
                <Settings className="w-6 h-6 mb-2" />
                <span>Configure Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Environment Variables Required:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code></li>
                <li>• <code>GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code></li>
                <li>• <code>GOOGLE_PROJECT_ID</code></li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Google Search Console Setup:</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Create a service account in Google Cloud Console</li>
                <li>2. Add the service account to your Search Console property</li>
                <li>3. Enable Search Console API and Indexing API</li>
                <li>4. Configure the environment variables above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}