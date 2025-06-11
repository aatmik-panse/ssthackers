import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
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
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit
    
    // Build search query
    let query = {}
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      }
    }
    
    // Fetch users with pagination
    const users = await User.find(query)
      .select('username email name auraPoints isAdmin isSuspended suspendedUntil suspensionReason joinedAt isEmailVerified image')
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(limit)
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(query)
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNext: page * limit < totalUsers
      }
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
} 