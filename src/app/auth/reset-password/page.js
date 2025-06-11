"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [formError, setFormError] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [success, setSuccess] = useState(false)

  // Validate token on page load
  useEffect(() => {
    if (!token) {
      setTokenError('Reset token is missing')
      setValidatingToken(false)
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          setTokenError(data.error || 'Invalid or expired reset token')
        }
      } catch (error) {
        setTokenError('Failed to validate reset token')
      } finally {
        setValidatingToken(false)
      }
    }

    validateToken()
  }, [token])

  const validateForm = () => {
    if (!password) {
      setFormError('Password is required')
      return false
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long')
      return false
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setFormError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-md w-full p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Validating reset token...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground">
            Create a new password for your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Your password must be at least 8 characters long
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokenError ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{tokenError}</span>
                  </div>
                  <p className="text-sm">
                    This reset link may have expired or already been used.
                  </p>
                </div>
                <div className="flex flex-col space-y-4">
                  <Button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="w-full"
                  >
                    Request New Reset Link
                  </Button>
                  <div className="text-center text-sm">
                    <Link
                      href="/auth/signin"
                      className="text-primary hover:underline font-medium"
                    >
                      Back to sign in
                    </Link>
                  </div>
                </div>
              </div>
            ) : success ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle2 className="h-8 w-8" />
                  <p className="text-center mt-2">
                    Your password has been reset successfully.
                  </p>
                </div>
                <div className="flex flex-col space-y-4">
                  <Button
                    type="button"
                    onClick={() => router.push('/auth/signin')}
                    className="w-full"
                  >
                    Sign In with New Password
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{formError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFormError('')
                      }}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setFormError('')
                    }}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 