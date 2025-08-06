"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMultiGame } from "@/contexts/multi-game-context"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"
import { Bug, RefreshCw } from "lucide-react"

export default function DebugPanel() {
  const { user } = useAuth()
  const { refreshData } = useMultiGame()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    if (!user) return

    setLoading(true)
    try {
      // 检查游戏会话
      const { data: sessions } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      // 检查玩家统计
      const { data: stats } = await supabase.from("player_stats").select("*").eq("user_id", user.id).single()

      // 检查排行榜
      const { data: leaderboard } = await supabase.from("global_leaderboard").select("*").limit(5)

      // 运行调试函数
      const { data: debugStats } = await supabase.rpc("debug_user_stats", {
        user_uuid: user.id,
      })

      setDebugInfo({
        sessions: sessions || [],
        stats: stats || null,
        leaderboard: leaderboard || [],
        debugStats: debugStats?.[0] || null,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Debug error:", error)
      setDebugInfo({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = async () => {
    await refreshData()
    await runDebug()
  }

  if (!user) return null

  return (
    <Card className="mt-4 bg-gray-100 border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-800">
          <Bug className="w-5 h-5" />
          <span>Debug Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={runDebug} disabled={loading} size="sm">
            <Bug className="w-4 h-4 mr-2" />
            Run Debug
          </Button>
          <Button onClick={forceRefresh} disabled={loading} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Refresh
          </Button>
        </div>

        {debugInfo && (
          <div className="bg-white p-4 rounded border text-sm">
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
