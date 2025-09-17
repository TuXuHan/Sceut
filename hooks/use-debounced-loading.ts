import { useState, useCallback, useRef } from 'react'

interface UseDebouncedLoadingOptions {
  debounceMs?: number
  maxRetries?: number
}

export function useDebouncedLoading(options: UseDebouncedLoadingOptions = {}) {
  const { debounceMs = 1000, maxRetries = 1 } = options
  const [loading, setLoading] = useState(true)
  const [lastLoadTime, setLastLoadTime] = useState(0)
  const retryCount = useRef(0)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const shouldSkipLoad = useCallback((forceReload: boolean = false): boolean => {
    const now = Date.now()
    
    // 如果是强制重新加载，检查是否真的需要重新加载
    if (forceReload) {
      // 如果距离上次加载不到防抖时间，且重试次数未达到上限，则跳过
      if (lastLoadTime > 0 && now - lastLoadTime < debounceMs && retryCount.current < maxRetries) {
        console.log(`⏳ 防抖：跳過強制重新載入 (${retryCount.current + 1}/${maxRetries})`)
        retryCount.current += 1
        return true
      }
      // 重置重试计数
      retryCount.current = 0
    } else {
      // 普通加载的防抖逻辑 - 更宽松的条件
      if (lastLoadTime > 0 && now - lastLoadTime < debounceMs) {
        console.log("⏳ 防抖：跳過頻繁重新載入")
        return true
      }
    }
    
    return false
  }, [lastLoadTime, debounceMs, maxRetries])

  const startLoading = useCallback(() => {
    setLoading(true)
    setLastLoadTime(Date.now())
    
    // 设置超时保护，防止加载状态卡住
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      console.log("⚠️ 載入超時，自動重置載入狀態")
      setLoading(false)
    }, 3000) // 3秒超时
  }, [])

  const stopLoading = useCallback(() => {
    setLoading(false)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  const resetRetryCount = useCallback(() => {
    retryCount.current = 0
  }, [])

  const resetLoadingState = useCallback(() => {
    retryCount.current = 0
    setLastLoadTime(0)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    shouldSkipLoad,
    resetRetryCount,
    resetLoadingState,
    lastLoadTime,
    setLastLoadTime
  }
}
