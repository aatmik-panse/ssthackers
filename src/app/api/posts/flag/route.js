import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function POST(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { postId, reason, additionalInfo } = data
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    if (!reason) {
      return NextResponse.json(
        { error: 'Reason for flagging is required' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Find post by ID
    const post = await Post.findById(postId)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Check if user has already flagged this post
    const hasAlreadyFlagged = post.flags.some(flag => 
      flag.flaggedBy && flag.flaggedBy.toString() === session.user.id
    )
    
    if (hasAlreadyFlagged) {
      return NextResponse.json(
        { error: 'You have already flagged this post' },
        { status: 400 }
      )
    }
    
    // Add flag to post
    post.flags.push({
      flaggedBy: session.user.id,
      reason,
      additionalInfo: additionalInfo || '',
      createdAt: new Date()
    })
    
    await post.save()
    
    return NextResponse.json({
      success: true,
      message: 'Post has been flagged and will be reviewed by moderators',
      flagCount: post.flags.length
    })
    
  } catch (error) {
    console.error('Error flagging post:', error)
    return NextResponse.json(
      { error: 'Failed to flag post' },
      { status: 500 }
    )
  }
} 