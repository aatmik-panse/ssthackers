import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Comment from '@/models/Comment'
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
    
    // Clear all flags from the comment
    comment.flags = []
    
    await comment.save()
    
    return NextResponse.json({
      success: true,
      message: 'Comment has been approved and flags have been cleared'
    })
    
  } catch (error) {
    console.error('Error approving comment:', error)
    return NextResponse.json(
      { error: 'Failed to approve comment' },
      { status: 500 }
    )
  }
} 