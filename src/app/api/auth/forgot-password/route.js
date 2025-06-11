import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import VerificationToken from '@/models/VerificationToken'
import { sendPasswordResetEmail } from '@/lib/email'
import { isValidDomain } from '@/lib/utils'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate domain
    if (!isValidDomain(email)) {
      return NextResponse.json(
        { error: 'Only @sst.scaler.com and @scaler.com email addresses are allowed' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() })

    // Don't reveal if a user exists for security reasons
    // Always return success, even if no user is found
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      })
    }

    // Check if user is suspended
    if (user.isSuspended && user.suspendedUntil && new Date() < user.suspendedUntil) {
      return NextResponse.json(
        { error: 'This account is suspended' },
        { status: 403 }
      )
    }

    // Delete any existing password reset tokens for this user
    await VerificationToken.deleteMany({
      userId: user._id,
      type: 'password_reset'
    })

    // Create a new reset token
    const verificationToken = await VerificationToken.generateToken(
      user._id,
      'password_reset'
    )
    await verificationToken.save()

    // Create reset URL
    const resetUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${verificationToken.token}`

    // Send reset email
    await sendPasswordResetEmail(
      user.email,
      user.name || user.username,
      resetUrl
    )

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
} 