import React, { useEffect, useRef, useState } from 'react';

interface SwipeGestureOptions {
  threshold?: number; // 最小滑动距离
  velocity?: number;  // 最小滑动速度
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
}

export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    threshold = 50,
    velocity = 0.3,
    onSwipeLeft,
    onSwipeRight,
    onSwipeStart,
    onSwipeEnd
  } = options;

  const [isSwipping, setIsSwipping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const touchData = useRef<TouchData | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY
    };
    setIsSwipping(true);
    onSwipeStart?.();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchData.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchData.current.startX;
    const deltaY = touch.clientY - touchData.current.startY;
    
    touchData.current.currentX = touch.clientX;
    touchData.current.currentY = touch.clientY;

    // 只处理水平滑动，忽略垂直滑动
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault(); // 防止页面滚动
      
      const direction = deltaX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      
      // 计算滑动进度 (0-100)
      const progress = Math.min(Math.abs(deltaX) / threshold, 1) * 100;
      setSwipeProgress(progress);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchData.current) return;

    const deltaX = touchData.current.currentX - touchData.current.startX;
    const deltaY = touchData.current.currentY - touchData.current.startY;
    const deltaTime = Date.now() - touchData.current.startTime;
    const swipeVelocity = Math.abs(deltaX) / deltaTime;

    // 判断是否为有效滑动
    const isValidSwipe = Math.abs(deltaX) > threshold && 
                        Math.abs(deltaX) > Math.abs(deltaY) && 
                        swipeVelocity > velocity;

    if (isValidSwipe) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    // 重置状态
    touchData.current = null;
    setIsSwipping(false);
    setSwipeDirection(null);
    setSwipeProgress(0);
    onSwipeEnd?.();
  };

  return {
    isSwipping,
    swipeDirection,
    swipeProgress,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
} 