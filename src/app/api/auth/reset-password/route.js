import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import VerificationToken from '@/models/VerificationToken'

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the token
    const verificationToken = await VerificationToken.findOne({
      token,
      type: 'password_reset',
      expiresAt: { $gt: new Date() } // Token must not be expired
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
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

    // Check if user is suspended
    if (user.isSuspended && user.suspendedUntil && new Date() < user.suspendedUntil) {
      return NextResponse.json(
        { error: 'This account is suspended' },
        { status: 403 }
      )
    }

    // Update user's password
    // No need to hash manually as the User model's pre-save hook will handle this
    user.password = password
    await user.save()

    // Delete the token since it's no longer needed
    await VerificationToken.deleteOne({ _id: verificationToken._id })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

// For validating tokens without requiring a password
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the token
    const verificationToken = await VerificationToken.findOne({
      token,
      type: 'password_reset',
      expiresAt: { $gt: new Date() } // Token must not be expired
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
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

    // Token is valid
    return NextResponse.json({
      success: true,
      message: 'Token is valid'
    })
  } catch (error) {
    console.error('Error validating reset token:', error)
    return NextResponse.json(
      { error: 'Failed to validate reset token' },
      { status: 500 }
    )
  }
} 