import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Comment from '@/models/Comment'
import User from '@/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function DELETE(request, { params }) {
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
    
    // If the post has an author, deduct aura points
    if (post.author) {
      const author = await User.findById(post.author)
      if (author) {
        // Deduct 3 aura points for deleting a post
        author.auraPoints = Math.max(0, (author.auraPoints || 0) - 3)
        await author.save()
      }
    }
    
    // Delete all comments associated with this post
    await Comment.deleteMany({ post: id })
    
    // Delete the post
    await Post.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Post and associated comments have been deleted'
    })
    
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
} 