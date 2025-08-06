import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./types"

// 确保只有一个Supabase客户端实例
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  // 只在客户端创建实例
  if (typeof window === "undefined") {
    return createClientComponentClient<Database>()
  }

  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}

// 导出一个函数而不是直接导出实例，避免SSR问题
export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // 在服务器端，每次都创建新实例
    return createClientComponentClient<Database>()
  }
  return createClient()
}

// 为了向后兼容，保留原来的导出方式，但改为函数调用
export const supabase = getSupabaseClient()
