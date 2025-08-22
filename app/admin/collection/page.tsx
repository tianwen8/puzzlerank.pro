'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

interface CollectionResult {
  success: boolean
  gameNumber: number
  message: string
  executionTime: number
  timestamp: string
}

interface TodayData {
  id: number
  game_number: number
  date: string
  predicted_word: string
  verified_word: string | null
  status: 'candidate' | 'verified' | 'rejected'
  confidence_score: number
  verification_sources: string[]
}

export default function CollectionAdminPage() {
  const [isCollecting, setIsCollecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [collectionResult, setCollectionResult] = useState<CollectionResult | null>(null)
  const [todayData, setTodayData] = useState<TodayData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load today's data
  const loadTodayData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/wordle/auto?type=today')
      const data = await response.json()
      
      if (data.success) {
        setTodayData(data.data)
      } else {
        setError('Failed to load today\'s data')
      }
    } catch (err) {
      setError('Network error while loading data')
    } finally {
      setIsLoading(false)
    }
  }

  // Manual collection trigger
  const triggerCollection = async () => {
    setIsCollecting(true)
    setError(null)
    setCollectionResult(null)
    
    try {
      const response = await fetch('/api/wordle/auto-collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCollectionResult({
          success: data.result.success,
          gameNumber: data.result.gameNumber,
          message: data.result.message,
          executionTime: data.result.executionTime,
          timestamp: new Date().toISOString()
        })
        
        // Reload today's data after collection
        setTimeout(() => {
          loadTodayData()
        }, 1000)
      } else {
        setError(data.error || 'Collection failed')
      }
    } catch (err) {
      setError('Network error during collection')
    } finally {
      setIsCollecting(false)
    }
  }

  // Auto-load data on component mount
  useState(() => {
    loadTodayData()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500'
      case 'candidate': return 'bg-yellow-500'
      case 'rejected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSourcesDisplay = (sources: string[]) => {
    return sources.includes('NYT Official API') ? 'NYT Official API' : sources.join(', ')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wordle Collection Admin</h1>
        <p className="text-gray-600">Manual collection control and status monitoring</p>
      </div>

      {/* Current Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Status
          </CardTitle>
          <CardDescription>
            Current collection status for today's Wordle answer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading today's data...</span>
            </div>
          ) : todayData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Game Number</label>
                  <p className="text-lg font-semibold">#{todayData.game_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg font-semibold">{todayData.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Answer</label>
                  <p className="text-lg font-semibold">{todayData.verified_word || todayData.predicted_word}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Confidence</label>
                  <p className="text-lg font-semibold">{Math.round(todayData.confidence_score * 100)}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(todayData.status)}>
                    {todayData.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Sources: </span>
                  <span className="text-sm font-medium">{getSourcesDisplay(todayData.verification_sources)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No data available for today</p>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={loadTodayData} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Collection Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Manual Collection
          </CardTitle>
          <CardDescription>
            Manually trigger today's answer collection if automatic collection failed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={triggerCollection}
              disabled={isCollecting}
              size="lg"
              className="w-full md:w-auto"
            >
              {isCollecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Collecting Answer...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Collect Today's Answer
                </>
              )}
            </Button>
            
            <p className="text-sm text-gray-600">
              This will attempt to collect today's Wordle answer using the same process as automatic collection.
              Priority: NYT Official API → Backup sources if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Collection Result Card */}
      {collectionResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {collectionResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Collection Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className={`text-lg font-semibold ${collectionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {collectionResult.success ? 'SUCCESS' : 'FAILED'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Game Number</label>
                  <p className="text-lg font-semibold">#{collectionResult.gameNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Execution Time</label>
                  <p className="text-lg font-semibold">{collectionResult.executionTime}ms</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">{collectionResult.message}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Timestamp</label>
                <p className="text-sm text-gray-600">{new Date(collectionResult.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">Automatic Collection Schedule</h3>
            <p className="text-sm text-blue-700">
              • First attempt: 20:02 Beijing Time (12:02 UTC)<br/>
              • Second attempt: 21:00 Beijing Time (13:00 UTC)<br/>
              • Uses NYT Official API as primary source
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}