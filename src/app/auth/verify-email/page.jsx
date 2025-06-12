'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [isVerifying, setIsVerifying] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('loading') // loading, success, error, already_verified
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const token = searchParams.get('token')
  const error = searchParams.get('error')
  const statusParam = searchParams.get('status')

  useEffect(() => {
    if (!token && !error && !statusParam) {
      // No token or status - user is just visiting the page
      setStatus('no_token')
      return
    }

    if (error) {
      setStatus('error')
      switch (error) {
        case 'missing_token':
          setMessage('Verification token is missing.')
          break
        case 'invalid_token':
          setMessage('Verification token is invalid or has expired.')
          break
        case 'user_not_found':
          setMessage('User not found.')
          break
        case 'server_error':
          setMessage('Server error occurred during verification.')
          break
        default:
          setMessage('An error occurred during verification.')
      }
      return
    }

    if (statusParam) {
      switch (statusParam) {
        case 'success':
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          break
        case 'already_verified':
          setStatus('already_verified')
          setMessage('Your email is already verified.')
          break
        default:
          setStatus('error')
          setMessage('Unknown status.')
      }
      return
    }

    if (token) {
      setIsVerifying(true)
      setStatus('loading')
      
      // Verify the token via API
      fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setStatus('error')
            setMessage(data.error)
          } else {
            setStatus('success')
            setMessage(data.message || 'Email verified successfully!')
          }
        })
        .catch((error) => {
          setStatus('error')
          setMessage('An error occurred during verification.')
          console.error('Verification error:', error)
        })
        .finally(() => {
          setIsVerifying(false)
        })
    }
  }, [token, error, statusParam])

  const handleResendVerification = async () => {
    if (!session?.user?.email) {
      setResendMessage('You must be logged in to resend verification email.')
      return
    }

    setIsResending(true)
    setResendMessage('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.error) {
        setResendMessage(data.error)
      } else {
        setResendMessage('Verification email sent! Please check your inbox.')
      }
    } catch (error) {
      setResendMessage('Failed to resend verification email.')
      console.error('Resend verification error:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-150px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            Verify your email address to access all features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p>Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

          {status === 'already_verified' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-center font-medium">{message}</p>
              {session?.user && (
                <div className="w-full pt-4">
                  <Button 
                    onClick={handleResendVerification} 
                    disabled={isResending} 
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>
                  {resendMessage && (
                    <p className={`mt-2 text-sm text-center ${resendMessage.includes('sent') ? 'text-green-500' : 'text-red-500'}`}>
                      {resendMessage}
                      {resendMessage.includes('sent') && (
                        <span className="block mt-1 text-muted-foreground">
                          If you don't see it in your inbox, please check your spam or junk folder.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {status === 'no_token' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-center">
                {session?.user?.isEmailVerified 
                  ? 'Your email is already verified.'
                  : 'Please check your email for a verification link. If you don\'t see it in your inbox, please check your spam or junk folder, or request a new verification email below.'}
              </p>
              
              {!session?.user?.isEmailVerified && session?.user && (
                <div className="w-full pt-4">
                  <Button 
                    onClick={handleResendVerification} 
                    disabled={isResending} 
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>
                  {resendMessage && (
                    <p className={`mt-2 text-sm text-center ${resendMessage.includes('sent') ? 'text-green-500' : 'text-red-500'}`}>
                      {resendMessage}
                      {resendMessage.includes('sent') && (
                        <span className="block mt-1 text-muted-foreground">
                          If you don't see it in your inbox, please check your spam or junk folder.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
              
              {!session?.user && (
                <p className="text-sm text-center text-muted-foreground">
                  Please sign in to request a verification email.
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {(status === 'success' || status === 'already_verified') ? (
            <Button asChild>
              <Link href="/auth/signin">Go to Sign In</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Back to Sign In</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 