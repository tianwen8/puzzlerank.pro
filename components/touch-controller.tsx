"use client"

import { ReactNode, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TouchControllerProps {
  children: ReactNode
  gameType: 'wordle' | '2048'
  className?: string
  onGameInteraction?: () => void
}

export default function TouchController({ 
  children, 
  gameType, 
  className,
  onGameInteraction 
}: TouchControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      onGameInteraction?.()
      
      // 2048游戏只在游戏板内阻止默认行为
      if (gameType === '2048') {
        const target = e.target as HTMLElement
        if (target.closest('.mobile-2048-board') || target.closest('[data-game-tile]')) {
          e.preventDefault()
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      // 2048游戏只在游戏板内阻止滚动，允许页面级手势
      if (gameType === '2048') {
        const target = e.target as HTMLElement
        // 只在游戏网格内阻止默认行为
        if (target.closest('.mobile-2048-board') || target.closest('[data-game-tile]')) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
      
      // Wordle游戏允许垂直滚动，但阻止水平滚动
      if (gameType === 'wordle') {
        const touch = e.touches[0]
        const target = e.target as HTMLElement
        
        // 如果是键盘区域，阻止滚动
        if (target.closest('[data-keyboard]')) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameType === '2048') {
        const target = e.target as HTMLElement
        if (target.closest('.mobile-2048-board') || target.closest('[data-game-tile]')) {
          e.preventDefault()
        }
      }
    }

    // 阻止上下文菜单
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
    }

    // 阻止双击缩放
    const handleDoubleClick = (e: Event) => {
      e.preventDefault()
    }

    // 添加事件监听器
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })
    container.addEventListener('contextmenu', handleContextMenu)
    container.addEventListener('dblclick', handleDoubleClick)

    // 针对2048游戏的额外处理
    if (gameType === '2048') {
      // 禁用选择文本
      container.style.userSelect = 'none'
      ;(container.style as any).webkitUserSelect = 'none'
      ;(container.style as any).webkitTouchCallout = 'none'
    }

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('contextmenu', handleContextMenu)
      container.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [gameType, onGameInteraction])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        gameType === '2048' && "touch-none select-none", // CSS版本的触摸控制
        gameType === 'wordle' && "touch-pan-y", // 允许垂直滚动
        className
      )}
      style={{
        // 2048游戏完全禁用触摸滚动
        touchAction: gameType === '2048' ? 'none' : 'pan-y',
        // 禁用iOS的弹性滚动
        WebkitOverflowScrolling: 'touch',
        // 禁用文本选择
        userSelect: gameType === '2048' ? 'none' : 'auto',
        WebkitUserSelect: gameType === '2048' ? 'none' : 'auto',
        WebkitTouchCallout: gameType === '2048' ? 'none' : 'default'
      }}
    >
      {children}
    </div>
  )
} 