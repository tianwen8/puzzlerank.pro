// 统一错误处理工具
// 提供更好的用户反馈和错误日志记录

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  requestId?: string
}

export interface ErrorResponse {
  error: ApiError
  success: false
}

export interface SuccessResponse<T = any> {
  data: T
  success: true
  cached?: boolean
  timestamp: string
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

// 错误类型枚举
export enum ErrorCodes {
  // 数据库相关错误
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED = 'DATABASE_QUERY_FAILED',
  DATABASE_TIMEOUT = 'DATABASE_TIMEOUT',
  
  // API相关错误
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_PARAMETERS = 'MISSING_PARAMETERS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Wordle相关错误
  NO_PREDICTION_AVAILABLE = 'NO_PREDICTION_AVAILABLE',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  PREDICTION_EXPIRED = 'PREDICTION_EXPIRED',
  
  // 系统错误
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CACHE_ERROR = 'CACHE_ERROR',
  
  // 外部服务错误
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// 错误消息映射
const ERROR_MESSAGES: Record<ErrorCodes, string> = {
  [ErrorCodes.DATABASE_CONNECTION_FAILED]: '数据库连接失败，请稍后重试',
  [ErrorCodes.DATABASE_QUERY_FAILED]: '数据查询失败，请检查请求参数',
  [ErrorCodes.DATABASE_TIMEOUT]: '数据库查询超时，请稍后重试',
  
  [ErrorCodes.INVALID_REQUEST]: '请求格式无效，请检查参数',
  [ErrorCodes.MISSING_PARAMETERS]: '缺少必要参数，请检查请求',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后重试',
  
  [ErrorCodes.NO_PREDICTION_AVAILABLE]: '暂无可用的Wordle预测数据',
  [ErrorCodes.VERIFICATION_FAILED]: 'Wordle答案验证失败',
  [ErrorCodes.PREDICTION_EXPIRED]: 'Wordle预测数据已过期',
  
  [ErrorCodes.INTERNAL_SERVER_ERROR]: '服务器内部错误，请稍后重试',
  [ErrorCodes.SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后重试',
  [ErrorCodes.CACHE_ERROR]: '缓存服务异常，数据可能不是最新',
  
  [ErrorCodes.EXTERNAL_API_ERROR]: '外部服务异常，请稍后重试',
  [ErrorCodes.NETWORK_ERROR]: '网络连接异常，请检查网络状态'
}

// HTTP状态码映射
const HTTP_STATUS_MAP: Record<ErrorCodes, number> = {
  [ErrorCodes.DATABASE_CONNECTION_FAILED]: 503,
  [ErrorCodes.DATABASE_QUERY_FAILED]: 500,
  [ErrorCodes.DATABASE_TIMEOUT]: 504,
  
  [ErrorCodes.INVALID_REQUEST]: 400,
  [ErrorCodes.MISSING_PARAMETERS]: 400,
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  
  [ErrorCodes.NO_PREDICTION_AVAILABLE]: 404,
  [ErrorCodes.VERIFICATION_FAILED]: 422,
  [ErrorCodes.PREDICTION_EXPIRED]: 410,
  
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.CACHE_ERROR]: 500,
  
  [ErrorCodes.EXTERNAL_API_ERROR]: 502,
  [ErrorCodes.NETWORK_ERROR]: 503
}

export class WordleErrorHandler {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 创建标准化的错误响应
   */
  static createError(
    code: ErrorCodes,
    customMessage?: string,
    details?: any,
    requestId?: string
  ): ApiError {
    return {
      code,
      message: customMessage || ERROR_MESSAGES[code],
      details,
      timestamp: new Date().toISOString(),
      requestId: requestId || this.generateRequestId()
    }
  }

  /**
   * 创建成功响应
   */
  static createSuccess<T>(
    data: T,
    cached: boolean = false
  ): SuccessResponse<T> {
    return {
      data,
      success: true,
      cached,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 获取HTTP状态码
   */
  static getHttpStatus(code: ErrorCodes): number {
    return HTTP_STATUS_MAP[code] || 500
  }

  /**
   * 记录错误日志
   */
  static logError(
    error: ApiError,
    context?: string,
    originalError?: Error
  ): void {
    const logData = {
      ...error,
      context,
      originalError: originalError?.message,
      stack: originalError?.stack
    }
    
    console.error(`[WordleAPI Error] ${context || 'Unknown'}:`, logData)
  }

  /**
   * 包装异步操作，自动处理错误
   */
  static async wrapAsync<T>(
    operation: () => Promise<T>,
    context: string,
    fallbackErrorCode: ErrorCodes = ErrorCodes.INTERNAL_SERVER_ERROR
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const apiError = this.createError(
        fallbackErrorCode,
        `${context}: ${error instanceof Error ? error.message : '未知错误'}`,
        error
      )
      
      this.logError(apiError, context, error instanceof Error ? error : undefined)
      throw apiError
    }
  }

  /**
   * 检查并转换常见错误类型
   */
  static mapCommonErrors(error: any): ErrorCodes {
    if (error?.code === 'PGRST116') {
      return ErrorCodes.NO_PREDICTION_AVAILABLE
    }
    
    if (error?.message?.includes('timeout')) {
      return ErrorCodes.DATABASE_TIMEOUT
    }
    
    if (error?.message?.includes('connection')) {
      return ErrorCodes.DATABASE_CONNECTION_FAILED
    }
    
    if (error?.message?.includes('network')) {
      return ErrorCodes.NETWORK_ERROR
    }
    
    return ErrorCodes.INTERNAL_SERVER_ERROR
  }
}

// 便捷函数
export const createError = WordleErrorHandler.createError
export const createSuccess = WordleErrorHandler.createSuccess
export const logError = WordleErrorHandler.logError
export const wrapAsync = WordleErrorHandler.wrapAsync