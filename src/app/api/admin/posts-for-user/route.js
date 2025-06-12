import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function POST(request) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const data = await request.json()
    const { title, url, body, userEmail } = data
    
    // Validate input
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (url && body) {
      return NextResponse.json(
        { error: 'Post can have either URL or text body, not both' },
        { status: 400 }
      )
    }

    if (!url && !body?.trim()) {
      return NextResponse.json(
        { error: 'Post must have either URL or text body' },
        { status: 400 }
      )
    }
    
    if (!userEmail?.trim()) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }
    
    // Find user by email
    const user = await User.findOne({ email: userEmail.toLowerCase() })
    
    // Create new post regardless of whether the user exists
    const post = new Post({
      title: title.trim(),
      url: url?.trim() || null,
      body: body?.trim() || null,
      // If user exists, use their ID; otherwise use a placeholder system ID
      author: user ? user._id : null,
      // Don't show that the post was created by admin
      createdByAdmin: false,
      // Don't store admin creator information
      adminCreator: null,
      // Store the target email if user doesn't exist yet
      targetUserEmail: user ? null : userEmail.toLowerCase()
    })
    
    await post.save()
    
    // If user exists, award them points
    if (user) {
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { auraPoints: 3 } }
      )
      
      // Return the created post with user info
      return NextResponse.json({
        success: true,
        post: await Post.findById(post._id).populate('author', 'username email auraPoints'),
        userExists: true,
        username: user.username
      }, { status: 201 })
    } else {
      // Return the post without admin info
      return NextResponse.json({
        success: true,
        post: {
          _id: post._id,
          title: post.title,
          url: post.url,
          body: post.body,
          targetUserEmail: post.targetUserEmail
        },
        userExists: false,
        message: "Post created and will be assigned when user signs up"
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating post for user:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
} 