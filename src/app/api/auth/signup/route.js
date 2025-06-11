import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import PendingUserPost from '@/models/PendingUserPost'
import VerificationToken from '@/models/VerificationToken'
import { isValidDomain } from '@/lib/utils'
import { sendVerificationEmail } from '@/lib/email'

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
      isEmailVerified: false
    })

    await user.save()

    // Check for pending posts for this email
    const pendingPosts = await PendingUserPost.find({
      email: email.toLowerCase(),
      processed: false
    })
    
    // If there are pending posts, create them for the user and award points
    let createdPosts = 0
    let auraPointsAwarded = 0
    
    if (pendingPosts.length > 0) {
      for (const pendingPost of pendingPosts) {
        // Create the post
        const post = new Post({
          title: pendingPost.title,
          url: pendingPost.url,
          body: pendingPost.body,
          author: user._id,
          createdByAdmin: true,
          adminCreator: pendingPost.adminCreator,
          pendingPostId: pendingPost._id
        })
        
        await post.save()
        
        // Update the pending post to mark as processed
        pendingPost.processed = true
        pendingPost.processedAt = new Date()
        pendingPost.assignedPostId = post._id
        await pendingPost.save()
        
        createdPosts++
        auraPointsAwarded += 3
      }
      
      // Award aura points for all created posts
      if (auraPointsAwarded > 0) {
        user.auraPoints += auraPointsAwarded
        await user.save()
      }
    }

    // Create verification token
    const verificationToken = VerificationToken.generateToken(user._id, 'email_verification')
    await verificationToken.save()

    // Generate verification URL
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
    const verificationUrl = `${siteUrl}/auth/verify-email?token=${verificationToken.token}`

    // Send verification email
    let emailSent = false;
    try {
      await sendVerificationEmail(user.email, user.name, verificationUrl)
      emailSent = true;
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // We don't want to fail the signup if email sending fails
      // but we should log it for monitoring
    }

    // Return success (don't return password)
    return NextResponse.json(
      { 
        message: emailSent 
          ? 'Account created successfully. Please check your email to verify your account.'
          : 'Account created successfully, but we could not send the verification email. Please visit the verification page to request a new one.',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          username: user.username
        },
        emailSent,
        pendingPostsAssigned: createdPosts,
        auraPointsAwarded
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