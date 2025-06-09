import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import VerificationToken from '@/models/VerificationToken'

export async function POST(request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the token
    const verificationToken = await VerificationToken.findOne({
      token,
      type: 'email_verification',
      expiresAt: { $gt: new Date() } // Token must not be expired
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await User.findById(verificationToken.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If the user is already verified, just return success
    if (user.isEmailVerified) {
      // Delete the token since it's no longer needed
      await VerificationToken.deleteOne({ _id: verificationToken._id })
      
      return NextResponse.json(
        { message: 'Email already verified' }
      )
    }

    // Update user to mark email as verified
    user.isEmailVerified = true
    await user.save()

    // Delete the token since it's no longer needed
    await VerificationToken.deleteOne({ _id: verificationToken._id })

    return NextResponse.json(
      { message: 'Email verified successfully' }
    )
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

// Handle GET requests to support verification via link clicks
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(`${process.env.SITE_URL || 'http://localhost:3000'}/auth/verify-email?error=missing_token`)
    }

    await connectDB()

    // Find the token
    const verificationToken = await VerificationToken.findOne({
      token,
      type: 'email_verification',
      expiresAt: { $gt: new Date() } // Token must not be expired
    })

    if (!verificationToken) {
      return NextResponse.redirect(`${process.env.SITE_URL || 'http://localhost:3000'}/auth/verify-email?error=invalid_token`)
    }

    // Find the user
    const user = await User.findById(verificationToken.userId)

    if (!user) {
      return NextResponse.redirect(`${process.env.SITE_URL || 'http://localhost:3000'}/auth/verify-email?error=user_not_found`)
    }

    // If the user is already verified, just return success
    if (user.isEmailVerified) {
      // Delete the token since it's no longer needed
      await VerificationToken.deleteOne({ _id: verificationToken._id })
      
      return NextResponse.redirect(`${process.env.SITE_URL || 'http://localhost:3000'}/auth/verify-email?status=already_verified`)
    }

    // Update user to mark email as verified
    user.isEmailVerified = true
    await user.save()

    // Delete the token since it's no longer needed
    await VerificationToken.deleteOne({ _id: verificationToken._id })

    return NextResponse.redirect(`${process.env.SITE_URL || 'http://localhost:3000'}/auth/verify-email?status=success`)
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.redirect(`${process.env.SITE_URL || 'http://localhost:3000'}/auth/verify-email?error=server_error`)
  }
} 