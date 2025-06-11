"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { isValidDomain } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    if (!email) {
      setFormError('Email is required')
      return false
    }

    // Validate email domain
    if (!isValidDomain(email)) {
      setFormError('Only @sst.scaler.com and @scaler.com email addresses are allowed')
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              We'll email you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle2 className="h-8 w-8" />
                  <p className="text-center mt-2">
                    If an account exists with that email, we've sent you instructions to reset your password.
                  </p>
                </div>
                <div className="flex flex-col space-y-4">
                  <Button
                    type="button"
                    onClick={() => router.push('/auth/signin')}
                    className="w-full"
                  >
                    Return to Sign In
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@sst.scaler.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
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
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <div className="text-center text-sm">
                  <Link
                    href="/auth/signin"
                    className="text-primary hover:underline font-medium"
                  >
                    Back to sign in
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 