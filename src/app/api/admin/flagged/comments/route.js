import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Comment from '@/models/Comment'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function GET(request) {
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit
    
    // Find comments that have at least one flag
    const query = { 'flags.0': { $exists: true } }
    
    // Fetch flagged comments with pagination
    const comments = await Comment.find(query)
      .populate('author', 'username name image')
      .populate('post', 'title _id')
      .populate('flags.flaggedBy', 'username name image')
      .sort({ 'flags.0.createdAt': -1 })
      .skip(skip)
      .limit(limit)
    
    // Get total count for pagination
    const totalItems = await Comment.countDocuments(query)
    
    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNext: page * limit < totalItems
      }
    })
    
  } catch (error) {
    console.error('Error fetching flagged comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flagged comments' },
      { status: 500 }
    )
  }
} 