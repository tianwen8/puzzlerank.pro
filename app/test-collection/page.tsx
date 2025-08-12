'use client'

import { useState } from 'react'

export default function TestCollectionPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAutoCollection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/wordle/auto-collect', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Auto Collection Test
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page allows you to manually test the automatic Wordle collection system in production.
            </p>
            
            <button
              onClick={testAutoCollection}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold text-white ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '🔄 Testing...' : '🚀 Test Auto Collection'}
            </button>
          </div>

          {/* Results Display */}
          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                ✅ Success!
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Game Number:</strong> {result.data?.gameNumber}</p>
                <p><strong>Answer:</strong> {result.data?.answer}</p>
                <p><strong>Date:</strong> {result.data?.date}</p>
                <p><strong>Source:</strong> {result.data?.source}</p>
                <p><strong>Action:</strong> {result.data?.action}</p>
                {result.data?.beijingTime && (
                  <p><strong>Beijing Time:</strong> {result.data.beijingTime}</p>
                )}
              </div>
              
              {result.data?.hints && (
                <div className="mt-4">
                  <h4 className="font-semibold text-green-800 mb-2">Generated Hints:</h4>
                  <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                    {JSON.stringify(result.data.hints, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="font-semibold text-green-800 mb-2">Full Response:</h4>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                ❌ Error
              </h3>
              <p className="text-red-700">{error}</p>
              
              <div className="mt-4 text-sm text-red-600">
                <p><strong>Possible causes:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Network connectivity issues</li>
                  <li>NYT API temporarily unavailable</li>
                  <li>Proxy services not working</li>
                  <li>Database connection problems</li>
                </ul>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              📋 Testing Instructions
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>1. Production Environment:</strong> This test works best in production (Vercel)</p>
              <p><strong>2. Network Access:</strong> Production environment has better network access than local</p>
              <p><strong>3. Expected Results:</strong> Should return today's Wordle answer and hints</p>
              <p><strong>4. Database:</strong> Results are automatically saved to Supabase</p>
            </div>
          </div>

          {/* API Endpoint Info */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🔗 Direct API Access
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>You can also test directly via:</p>
              <code className="block bg-white p-2 rounded border mt-2">
                GET /api/wordle/auto-collect
              </code>
              <p className="mt-2">Or using curl:</p>
              <code className="block bg-white p-2 rounded border mt-2 break-all">
                curl https://your-domain.vercel.app/api/wordle/auto-collect
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}