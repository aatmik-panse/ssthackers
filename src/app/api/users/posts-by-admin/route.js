import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function GET(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectDB()
    
    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit
    
    // Find all posts created by admin for this user
    const posts = await Post.find({
      author: session.user.id,
      createdByAdmin: true,
      isDeleted: false
    })
    .populate('adminCreator', 'username name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    
    // Get total count for pagination
    const totalPosts = await Post.countDocuments({
      author: session.user.id,
      createdByAdmin: true,
      isDeleted: false
    })
    
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: page * limit < totalPosts
      }
    })
    
  } catch (error) {
    console.error('Error fetching admin-created posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
} 
 