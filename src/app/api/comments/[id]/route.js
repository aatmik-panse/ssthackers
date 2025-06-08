import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Comment from '@/models/Comment'
import Post from '@/models/Post'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    const comment = await Comment.findById(id)
      .populate('author', 'username name email image')
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error fetching comment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Find the comment
    const comment = await Comment.findById(id)
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // Check if user is the author
    if (comment.author.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to edit this comment' },
        { status: 403 }
      )
    }
    
    // Check if comment is deleted
    if (comment.isDeleted) {
      return NextResponse.json(
        { error: 'Cannot edit a deleted comment' },
        { status: 400 }
      )
    }
    
    // Get data from request
    const data = await request.json()
    const { body } = data
    
    if (!body?.trim()) {
      return NextResponse.json(
        { error: 'Comment body is required' },
        { status: 400 }
      )
    }
    
    // Update the comment
    comment.body = body.trim()
    await comment.save()
    
    // Populate author data
    await comment.populate('author', 'username name email image')
    
    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Find the comment
    const comment = await Comment.findById(id)
      .populate('author', 'username name email image')
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // Check if user is the author or an admin
    if (comment.author._id.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      )
    }
    
    // Soft delete the comment (keep the structure for replies)
    comment.isDeleted = true
    comment.body = '[deleted]'
    await comment.save()
    
    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
} 