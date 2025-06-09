import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { isValidDomain } from '@/lib/utils'

export async function POST(request) {
  try {
    const { email, password, name, username } = await request.json()

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

    // Check if user already exists with this email
    const existingUserWithEmail = await User.findOne({ email: email.toLowerCase() })
    if (existingUserWithEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Generate username from email if not provided
    let finalUsername = username ? username.trim() : email.split('@')[0]
    
    // Check if username meets requirements
    if (finalUsername.length < 3 || finalUsername.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters long' },
        { status: 400 }
      )
    }
    
    if (!finalUsername.match(/^[a-zA-Z0-9_]+$/)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      )
    }
    
    // Check if username is already taken
    const existingUserWithUsername = await User.findOne({ username: finalUsername })
    if (existingUserWithUsername) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 400 }
      )
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      username: finalUsername,
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
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
} 