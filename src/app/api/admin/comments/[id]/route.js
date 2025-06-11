import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Comment from '@/models/Comment'
import User from '@/models/User'
import Post from '@/models/Post'
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
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Find comment by ID
    const comment = await Comment.findById(id)
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // If the comment has an author, deduct aura points
    if (comment.author) {
      const author = await User.findById(comment.author)
      if (author) {
        // Deduct 1 aura point for deleting a comment
        author.auraPoints = Math.max(0, (author.auraPoints || 0) - 1)
        await author.save()
      }
    }
    
    // Update the post comment count
    if (comment.post) {
      await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } })
    }
    
    // Delete the comment
    await Comment.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Comment has been deleted'
    })
    
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
} 