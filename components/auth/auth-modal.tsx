"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { Mail, Lock, User, Chrome, AlertCircle, CheckCircle, RefreshCw, Info } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  
  // Debug modal state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Auth modal state:", { isOpen, loading, email: email.length, password: password.length })
    }
  }, [isOpen, loading, email, password])
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false)
      setError("")
      setSuccess("")
      setNeedsConfirmation(false)
    }
  }, [isOpen])

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resendConfirmation } = useAuth()

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setFullName("")
    setError("")
    setSuccess("")
    setNeedsConfirmation(false)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Form submitted:", { email, password, isSignUp, loading })
    }
    
    if (loading) return
    
    setLoading(true)
    setError("")
    setSuccess("")
    setNeedsConfirmation(false)

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setError("Password must be at least 6 characters long")
          return
        }

        console.log("Attempting sign up...")
        const { data, error } = await signUpWithEmail(email, password, fullName)
        if (error) {
          console.error("Sign up error:", error)
          if (error.message.includes("already registered")) {
            setError("This email is already registered. Please sign in instead.")
          } else if (error.message.includes("Invalid email")) {
            setError("Please enter a valid email address")
          } else {
            setError(error.message || "Failed to create account")
          }
        } else {
          console.log("Sign up successful")
          setSuccess(
            "Account created! Please check your email and click the confirmation link to complete registration.",
          )
          resetForm()
        }
      } else {
        console.log("Attempting sign in...")
        const { data, error } = await signInWithEmail(email, password)
        if (error) {
          console.error("Sign in error:", error)
          if (error.message.includes("Email not confirmed")) {
            setError("Please confirm your email address before signing in.")
            setNeedsConfirmation(true)
          } else if (error.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please try again.")
          } else {
            setError(error.message || "Failed to sign in")
          }
        } else {
          console.log("Sign in successful")
          setSuccess("Successfully signed in!")
          setTimeout(() => {
            onClose()
            resetForm()
          }, 1000)
        }
      }
    } catch (error: any) {
      console.error("Auth exception:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { data, error } = await signInWithGoogle()
      if (error) {
        if (error.message.includes("popup_blocked")) {
          setError("Popup was blocked. Please allow popups and try again.")
        } else {
          setError("Failed to sign in with Google. Please try again.")
        }
        console.error("Google auth error:", error)
      }
      // OAuth redirect happens automatically
    } catch (error: any) {
      setError("An unexpected error occurred with Google sign in.")
      console.error("Google auth exception:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    setLoading(true)
    try {
      const { error } = await resendConfirmation(email)
      if (error) {
        setError("Failed to resend confirmation email. Please try again.")
      } else {
        setSuccess("Confirmation email sent! Please check your inbox and spam folder.")
        setNeedsConfirmation(false)
      }
    } catch (error) {
      setError("Failed to resend confirmation email")
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        data-auth-modal="true"
      >
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create Account" : "Sign In"}</DialogTitle>
          <DialogDescription>
            {isSignUp
              ? "Create a new account to track your progress and compete on the leaderboard"
              : "Sign in to your account to access your game statistics"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-transparent"
            variant="outline"
            type="button"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      if (process.env.NODE_ENV === 'development') {
                        console.log("Full name input changed:", e.target.value)
                      }
                      setFullName(e.target.value)
                    }}
                    className="pl-10"
                    required
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log("Email input changed:", e.target.value)
                    }
                    setEmail(e.target.value)
                  }}
                  className="pl-10"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                  value={password}
                  onChange={(e) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log("Password input changed:", e.target.value.length, "characters")
                    }
                    setPassword(e.target.value)
                  }}
                  className="pl-10"
                  required
                  disabled={loading}
                  minLength={isSignUp ? 6 : undefined}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>
            </div>

            {isSignUp && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>You'll receive a confirmation email after registration. Please check your inbox.</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {needsConfirmation && (
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Confirmation Email
                </Button>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={toggleMode} className="text-primary hover:underline" disabled={loading} type="button">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
