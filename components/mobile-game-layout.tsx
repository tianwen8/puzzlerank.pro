"use client"

import { ReactNode, useState, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { useMultiGame } from '@/contexts/multi-game-context'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, User, Trophy, Grid3x3, SpellCheck, LogIn, LogOut } from 'lucide-react'
import { GameType } from '@/lib/supabase/types'
import AuthModal from '@/components/auth/auth-modal'

interface MobileGameLayoutProps {
  children: ReactNode
  leftPanel: ReactNode  // 个人数据面板
  rightPanel: ReactNode // 排行榜面板
  className?: string
}

type PanelState = 'game' | 'left' | 'right'

export default function MobileGameLayout({ 
  children, 
  leftPanel, 
  rightPanel, 
  className 
}: MobileGameLayoutProps) {
  const isMobile = useIsMobile()
  const [activePanel, setActivePanel] = useState<PanelState>('game')
  const [showIndicators, setShowIndicators] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { currentGame, setCurrentGame } = useMultiGame()
  const { user, signOut } = useAuth()

  // 手势控制
  const swipeGesture = useSwipeGesture({
    threshold: 80,
    velocity: 0.2,
    onSwipeLeft: () => {
      if (activePanel === 'game') {
        setActivePanel('right')
      } else if (activePanel === 'left') {
        setActivePanel('game')
      }
    },
    onSwipeRight: () => {
      if (activePanel === 'game') {
        setActivePanel('left')
      } else if (activePanel === 'right') {
        setActivePanel('game')
      }
    }
  })

  // 自动隐藏指示器 - 2048游戏显示更久
  useEffect(() => {
    if (activePanel !== 'game') {
      setShowIndicators(false)
    } else {
      // 2048游戏显示6秒，Wordle显示3秒
      const timeout = currentGame === '2048' ? 6000 : 3000
      const timer = setTimeout(() => setShowIndicators(false), timeout)
      return () => clearTimeout(timer)
    }
  }, [activePanel, currentGame])

  const handleGameSwitch = (gameType: GameType) => {
    setCurrentGame(gameType)
    // 切换游戏时重新显示提示
    setShowIndicators(true)
  }

  const handleAuth = () => {
    if (user) {
      signOut()
    } else {
      setShowAuthModal(true)
    }
  }

  // 桌面端使用原有布局
  if (!isMobile) {
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8", className)}>
        <div className="lg:col-span-2">{leftPanel}</div>
        <div className="lg:col-span-8">{children}</div>
        <div className="lg:col-span-2">{rightPanel}</div>
      </div>
    )
  }

  // 移动端布局
  return (
    <div 
      className={cn(
        "relative w-full h-screen overflow-hidden bg-gradient-to-br from-orange-400 via-red-500 to-pink-500",
        className
      )}
      {...swipeGesture.handlers}
    >
      {/* 移动端顶部导航栏 */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 safe-area">
          {/* 游戏切换按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGameSwitch('wordle')}
              className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                currentGame === 'wordle' 
                  ? "bg-white/30 text-white shadow-lg" 
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              <SpellCheck className="w-4 h-4" />
              <span>Wordle</span>
            </button>
            <button
              onClick={() => handleGameSwitch('2048')}
              className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                currentGame === '2048' 
                  ? "bg-white/30 text-white shadow-lg" 
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              <Grid3x3 className="w-4 h-4" />
              <span>2048</span>
            </button>
          </div>

          {/* 登录/用户按钮 */}
          <button
            onClick={handleAuth}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-all"
          >
                         {user ? (
               <>
                 <LogOut className="w-4 h-4" />
                 <span>Sign Out</span>
               </>
             ) : (
               <>
                 <LogIn className="w-4 h-4" />
                 <span>Sign In</span>
               </>
             )}
          </button>
        </div>
      </div>

      {/* 主容器 */}
      <div 
        className="flex w-[300%] h-full transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${
            activePanel === 'left' ? '0%' : 
            activePanel === 'game' ? '-33.33%' : 
            '-66.66%'
          })`
        }}
      >
        {/* 左侧面板 - 个人数据 */}
        <div className="w-1/3 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 pt-20 safe-area">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </h2>
                <button 
                  onClick={() => setActivePanel('game')}
                  className="text-white/80 hover:text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              {leftPanel}
            </div>
          </div>
        </div>

        {/* 中间面板 - 游戏区域 */}
        <div className="w-1/3 h-full flex flex-col">
          {/* 游戏内容 - 为键盘留出更多空间 */}
          <div className="flex-1 flex flex-col justify-center items-center px-2 relative pt-16 pb-4 safe-area">
            <div className={cn(
              "w-full h-full flex flex-col items-center",
              currentGame === 'wordle' ? "justify-start space-y-4" : "justify-center space-y-6"
            )}>
              {children}
            </div>
            
            {/* 滑动/点击指示器 */}
            {showIndicators && (
              <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4">
                  {currentGame === '2048' ? (
                    // 2048游戏：引导点击底部导航
                    <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                      <div className="w-2 h-2 bg-white rounded-full game-hint-pulse"></div>
                      <span className="animate-pulse">Tap dots below to view stats</span>
                      <div className="w-2 h-2 bg-white rounded-full game-hint-pulse"></div>
                    </div>
                  ) : (
                    // Wordle游戏：滑动提示
                    <div className="flex items-center gap-3 text-white/90 text-xs font-medium">
                      <div className="flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4 animate-pulse" />
                        <span>Swipe for Profile</span>
                      </div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="flex items-center gap-1">
                        <span>Swipe for Ranking</span>
                        <ChevronRight className="w-4 h-4 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧面板 - 排行榜 */}
        <div className="w-1/3 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 pt-20 safe-area">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setActivePanel('game')}
                  className="text-white/80 hover:text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </h2>
              </div>
              {rightPanel}
            </div>
          </div>
        </div>
      </div>

      {/* 底部面板指示器 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="flex gap-2">
          {['left', 'game', 'right'].map((panel) => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel as PanelState)}
              className={cn(
                "rounded-full transition-all duration-200",
                currentGame === '2048' 
                  ? "w-3 h-3" // 2048游戏中更大的导航点
                  : "w-2 h-2", // Wordle游戏中正常大小
                activePanel === panel 
                  ? currentGame === '2048' 
                    ? "bg-white w-8 shadow-lg" // 2048游戏激活状态更明显
                    : "bg-white w-6"
                  : currentGame === '2048'
                    ? `bg-white/60 hover:bg-white/80 ${showIndicators ? 'nav-dot-highlight' : ''}` // 提示显示时添加高亮动画
                    : "bg-white/40"
              )}
            />
          ))}
        </div>
      </div>

      {/* 背景点击关闭面板 */}
      {activePanel !== 'game' && (
        <div 
          className="absolute inset-0 bg-black/20 z-10"
          onClick={() => setActivePanel('game')}
        />
      )}

      {/* 认证模态框 */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
} 