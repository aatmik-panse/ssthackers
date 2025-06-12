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
    
    // Return empty response as admin-created posts are no longer tracked separately
    return NextResponse.json({
      posts: [],
      pagination: {
        page: 1,
        limit: 10,
        totalPosts: 0,
        totalPages: 0,
        hasMore: false
      },
      message: "Admin-created posts are no longer tracked separately and appear as regular posts."
    })
    
  } catch (error) {
    console.error('Error fetching admin-created posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
} 
 