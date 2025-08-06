"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/auth-helpers-nextjs"
import { supabase } from "@/lib/supabase/client"

// 获取当前环境的回调地址
const getRedirectUrl = () => {
  if (typeof window !== "undefined") {
    // 在开发环境中，强制使用 localhost
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return "http://localhost:3000/auth/callback"
    }
    return `${window.location.origin}/auth/callback`
  }
  return "http://localhost:3000/auth/callback"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email, session?.user?.app_metadata?.provider)
      setUser(session?.user ?? null)
      setLoading(false)

      // 当用户登录或令牌刷新时，确保创建用户统计
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        console.log("Ensuring user stats for:", session.user.email, "Provider:", session.user.app_metadata?.provider)
        
        // 对于 Google OAuth 用户，给数据库更多时间
        const isGoogleUser = session.user.app_metadata?.provider === 'google'
        const delay = isGoogleUser ? 500 : 100
        
        setTimeout(async () => {
          await ensureUserStats(session.user.id, 0)
        }, delay)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const ensureUserStats = async (userId: string, retryCount = 0) => {
    const maxRetries = 3
    const retryDelay = (retryCount + 1) * 1000 // 1s, 2s, 3s
    
    try {
      console.log(`Ensuring user stats for user ID: ${userId} (attempt ${retryCount + 1}/${maxRetries + 1})`)
      
      // 先检查用户统计是否已存在
      const { data: existingStats, error: checkError } = await supabase
        .from("player_stats")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle() // 使用 maybeSingle 而不是 single 来避免 "No rows found" 错误

      if (checkError) {
        console.error("Error checking existing stats:", checkError)
        if (retryCount < maxRetries) {
          console.log(`Retrying check in ${retryDelay}ms...`)
          setTimeout(() => ensureUserStats(userId, retryCount + 1), retryDelay)
          return
        }
        throw checkError
      }

      if (existingStats) {
        console.log("User stats already exist")
        return
      }

      // 获取当前用户信息
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error("Error getting user:", userError)
        if (retryCount < maxRetries) {
          console.log(`Retrying user fetch in ${retryDelay}ms...`)
          setTimeout(() => ensureUserStats(userId, retryCount + 1), retryDelay)
          return
        }
        throw userError
      }

      if (!user || user.id !== userId) {
        console.error("User mismatch or not found:", { userId, currentUserId: user?.id })
        return
      }

      // 增强的用户名提取逻辑，支持多种Google OAuth数据结构
      const extractUsername = (user: any) => {
        // 尝试从 user_metadata 获取
        if (user.user_metadata?.full_name) return user.user_metadata.full_name
        if (user.user_metadata?.name) return user.user_metadata.name
        
        // 尝试从 identities 获取（Google OAuth）
        if (user.identities && user.identities.length > 0) {
          const identity = user.identities[0]
          if (identity.identity_data?.full_name) return identity.identity_data.full_name
          if (identity.identity_data?.name) return identity.identity_data.name
        }
        
        // 尝试从 raw_user_meta_data 获取（通过类型断言）
        const rawMetadata = (user as any).raw_user_meta_data
        if (rawMetadata?.full_name) return rawMetadata.full_name
        if (rawMetadata?.name) return rawMetadata.name
        
        // 最后使用邮箱前缀
        if (user.email) return user.email.split("@")[0]
        
        return "Player"
      }

      const username = extractUsername(user)
      console.log("Extracted username:", username, "from user:", {
        user_metadata: user.user_metadata,
        identities: user.identities,
        raw_user_meta_data: (user as any).raw_user_meta_data,
        email: user.email
      })

      // 使用 upsert 而不是 insert，避免重复插入错误
      const { error: insertError } = await supabase.from("player_stats").upsert({
        user_id: userId,
        username: username,
        email: user.email || "",
        best_score: 0,
        total_games: 0,
        games_won: 0,
        current_streak: 0,
        best_streak: 0,
        total_moves: 0,
        total_duration_seconds: 0,
        highest_tile_achieved: 0,
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })

      if (insertError) {
        console.error("Error creating user stats:", insertError)
        if (retryCount < maxRetries) {
          console.log(`Retrying insert in ${retryDelay}ms...`)
          setTimeout(() => ensureUserStats(userId, retryCount + 1), retryDelay)
          return
        }
        throw insertError
      } else {
        console.log("User stats created successfully for:", username)
      }
    } catch (error) {
      console.error(`Exception ensuring user stats (attempt ${retryCount + 1}):`, error)
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms due to exception...`)
        setTimeout(() => ensureUserStats(userId, retryCount + 1), retryDelay)
      } else {
        console.error("Failed to ensure user stats after all retries")
      }
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Sign in exception:", error)
      return { data: null, error: error as Error }
    }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: getRedirectUrl(),
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Sign up exception:", error)
      return { data: null, error: error as Error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log("Google OAuth redirect URL:", getRedirectUrl())

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Google sign in error:", error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Google sign in exception:", error)
      return { data: null, error: error as Error }
    }
  }

  const resendConfirmation = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      })

      if (error) {
        console.error("Resend confirmation error:", error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Resend confirmation exception:", error)
      return { data: null, error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      console.log("Starting sign out process...")
      
      // 清除本地状态
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // 调用 Supabase 登出
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      } else {
        console.log("Sign out successful")
      }
      
      // 强制设置用户状态为 null
      setUser(null)
      
      return { error }
    } catch (error) {
      console.error("Sign out exception:", error)
      // 即使出错也要清除本地状态
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      setUser(null)
      return { error: error as Error }
    }
  }

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resendConfirmation,
    signOut,
  }
}
