"use client"

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl)
      }
    })
  }, [router, callbackUrl])

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setFormError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required')
      return false
    }

    if (mode === 'signup') {
      if (!formData.name) {
        setFormError('Name is required')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match')
        return false
      }
      if (formData.password.length < 8) {
        setFormError('Password must be at least 8 characters long')
        return false
      }
    }

    // Validate email domain
    const domain = formData.email.split('@')[1]
    if (!['sst.scaler.com', 'scaler.com'].includes(domain)) {
      setFormError('Only @sst.scaler.com and @scaler.com email addresses are allowed')
      return false
    }

    return true
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setFormError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setFormError(result.error)
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (error) {
      setFormError('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setFormError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error)
      } else {
        setSuccess('Account created successfully! Please sign in.')
        setMode('signin')
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '', name: '' }))
      }
    } catch (error) {
      setFormError('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (error) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password'
      case 'AccessDenied':
        return 'Access denied. Only SST and Scaler email addresses are allowed.'
      default:
        return formError || 'An error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl mb-4">
            S
          </div>
          <h2 className="text-3xl font-bold">Welcome to SST Hackers</h2>
          <p className="mt-2 text-muted-foreground">
            {mode === 'signin' 
              ? 'Sign in to your account' 
              : 'Create your account'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
            <CardDescription>
              Only @sst.scaler.com and @scaler.com email addresses are allowed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {(error || formError) && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{getErrorMessage(error)}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <span className="text-sm">{success}</span>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.name@sst.scaler.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                    value={formData.password}
                    onChange={handleInputChange}
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

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                  setFormError('')
                  setSuccess('')
                }}
                className="text-sm"
              >
                {mode === 'signin' 
                  ? "Don't have an account? Create one" 
                  : 'Already have an account? Sign in'
                }
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                By {mode === 'signin' ? 'signing in' : 'creating an account'}, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        {mode === 'signup' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have access? Contact your administrator for help.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 