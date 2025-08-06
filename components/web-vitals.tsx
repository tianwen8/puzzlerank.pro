'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
  }
}

export function WebVitals() {
  useEffect(() => {
    // 动态导入web-vitals库
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      // 发送Core Web Vitals数据到Google Analytics
      const sendToGoogleAnalytics = ({ name, delta, value, id }: any) => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', name, {
            event_category: 'Web Vitals',
            event_label: id,
            value: Math.round(name === 'CLS' ? delta * 1000 : delta),
            non_interaction: true,
          })
        }
        
        // 同时在控制台输出性能数据（开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] ${name}:`, {
            value: Math.round(name === 'CLS' ? value * 1000 : value),
            delta: Math.round(name === 'CLS' ? delta * 1000 : delta),
            id,
          })
        }
      }

      // 监控所有Core Web Vitals指标
      onCLS(sendToGoogleAnalytics)
      onFCP(sendToGoogleAnalytics)
      onLCP(sendToGoogleAnalytics)
      onTTFB(sendToGoogleAnalytics)
      onINP(sendToGoogleAnalytics)
    }).catch((error) => {
      console.warn('Failed to load web-vitals:', error)
    })
  }, [])

  return null
}

// 性能监控Hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // 监控页面加载性能
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          
          // 计算关键性能指标
          const metrics = {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            request: navEntry.responseStart - navEntry.requestStart,
            response: navEntry.responseEnd - navEntry.responseStart,
            dom: navEntry.domContentLoadedEventEnd - navEntry.responseEnd,
            load: navEntry.loadEventEnd - navEntry.loadEventStart,
            total: navEntry.loadEventEnd - navEntry.fetchStart,
          }
          
          // 发送到分析服务
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_load_performance', {
              event_category: 'Performance',
              custom_map: {
                metric_1: 'dns_time',
                metric_2: 'tcp_time',
                metric_3: 'request_time',
                metric_4: 'response_time',
                metric_5: 'dom_time',
                metric_6: 'total_time',
              },
              metric_1: Math.round(metrics.dns),
              metric_2: Math.round(metrics.tcp),
              metric_3: Math.round(metrics.request),
              metric_4: Math.round(metrics.response),
              metric_5: Math.round(metrics.dom),
              metric_6: Math.round(metrics.total),
            })
          }
          
          // 开发环境输出
          if (process.env.NODE_ENV === 'development') {
            console.log('[Performance Metrics]', metrics)
          }
        }
      }
    })
    
    observer.observe({ entryTypes: ['navigation'] })
    
    return () => observer.disconnect()
  }, [])
}