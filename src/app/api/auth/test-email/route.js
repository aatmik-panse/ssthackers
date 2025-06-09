import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request) {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Generate a test verification URL
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
    const testToken = 'test-token-' + Date.now()
    const verificationUrl = `${siteUrl}/auth/verify-email?token=${testToken}`

    // Send test email
    await sendVerificationEmail(email, name, verificationUrl)

    return NextResponse.json({
      message: 'Test email sent successfully',
      details: {
        to: email,
        name: name,
        verificationUrl: verificationUrl,
        emailConfig: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          secure: process.env.EMAIL_SERVER_SECURE === 'true',
          user: process.env.EMAIL_SERVER_USER ? '(configured)' : '(not configured)',
          from: process.env.EMAIL_FROM
        }
      }
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 