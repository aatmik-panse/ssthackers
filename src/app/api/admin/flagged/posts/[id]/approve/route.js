import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function POST(request, { params }) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Find post by ID
    const post = await Post.findById(id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Clear all flags from the post
    post.flags = []
    
    await post.save()
    
    return NextResponse.json({
      success: true,
      message: 'Post has been approved and flags have been cleared'
    })
    
  } catch (error) {
    console.error('Error approving post:', error)
    return NextResponse.json(
      { error: 'Failed to approve post' },
      { status: 500 }
    )
  }
} 