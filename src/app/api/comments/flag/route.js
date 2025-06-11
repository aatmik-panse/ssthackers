import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Comment from '@/models/Comment'
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
    const { commentId, reason, additionalInfo } = data
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
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
    
    // Find comment by ID
    const comment = await Comment.findById(commentId)
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // Check if user has already flagged this comment
    const hasAlreadyFlagged = comment.flags.some(flag => 
      flag.flaggedBy && flag.flaggedBy.toString() === session.user.id
    )
    
    if (hasAlreadyFlagged) {
      return NextResponse.json(
        { error: 'You have already flagged this comment' },
        { status: 400 }
      )
    }
    
    // Add flag to comment
    comment.flags.push({
      flaggedBy: session.user.id,
      reason,
      additionalInfo: additionalInfo || '',
      createdAt: new Date()
    })
    
    await comment.save()
    
    return NextResponse.json({
      success: true,
      message: 'Comment has been flagged and will be reviewed by moderators',
      flagCount: comment.flags.length
    })
    
  } catch (error) {
    console.error('Error flagging comment:', error)
    return NextResponse.json(
      { error: 'Failed to flag comment' },
      { status: 500 }
    )
  }
} 