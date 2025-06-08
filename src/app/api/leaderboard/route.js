import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit

    // Get users sorted by aura points
    const users = await User.find({
      isSuspended: false,
      auraPoints: { $gt: 0 }
    })
    .sort({ auraPoints: -1, joinedAt: 1 })
    .skip(skip)
    .limit(limit)
    .select('username email auraPoints joinedAt')

    // Get total count for pagination
    const totalUsers = await User.countDocuments({
      isSuspended: false,
      auraPoints: { $gt: 0 }
    })

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
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
} 