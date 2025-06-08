import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { isValidDomain } from '@/lib/utils'

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email domain
    if (!isValidDomain(email)) {
      return NextResponse.json(
        { error: 'Only @sst.scaler.com and @scaler.com email addresses are allowed' },
        { status: 400 }
      )
    }

    // Validate password length
    const minPasswordLength = parseInt(process.env.MIN_PASSWORD_LENGTH) || 8
    if (password.length < minPasswordLength) {
      return NextResponse.json(
        { error: `Password must be at least ${minPasswordLength} characters long` },
        { status: 400 }
      )
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name: name.trim(),
      auraPoints: 0,
      isEmailVerified: false // You can implement email verification later
    })

    await user.save()

    // Return success (don't return password)
    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          username: user.username
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
} 