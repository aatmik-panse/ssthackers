import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import PendingUserPost from '@/models/PendingUserPost'
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
    
    // If user exists, create post directly for them and award points
    if (user) {
      // Create new post
      const post = new Post({
        title: title.trim(),
        url: url?.trim() || null,
        body: body?.trim() || null,
        author: user._id,
        createdByAdmin: true,
        adminCreator: session.user.id
      })
      
      await post.save()
      
      // Award 3 aura points to the user
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { auraPoints: 3 } }
      )
      
      // Return the created post
      return NextResponse.json({
        success: true,
        post: await Post.findById(post._id).populate('author', 'username email auraPoints'),
        userExists: true,
        username: user.username
      }, { status: 201 })
    } 
    // If user doesn't exist, create a pending post
    else {
      // Create pending user post
      const pendingPost = new PendingUserPost({
        email: userEmail.toLowerCase(),
        title: title.trim(),
        url: url?.trim() || null,
        body: body?.trim() || null,
        adminCreator: session.user.id
      })
      
      await pendingPost.save()
      
      // Return the pending post
      return NextResponse.json({
        success: true,
        pendingPost,
        userExists: false,
        message: "Post will be assigned when user signs up"
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