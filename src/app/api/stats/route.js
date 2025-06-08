import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import Comment from '@/models/Comment'

export async function GET() {
  try {
    await connectDB()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get community statistics
    const [
      totalUsers,
      totalPosts,
      totalComments,
      postsToday,
      commentsToday,
      totalAuraPoints
    ] = await Promise.all([
      User.countDocuments({ isSuspended: false }),
      Post.countDocuments({ isDeleted: false }),
      Comment.countDocuments({ isDeleted: false }),
      Post.countDocuments({ 
        isDeleted: false,
        createdAt: { $gte: today }
      }),
      Comment.countDocuments({ 
        isDeleted: false,
        createdAt: { $gte: today }
      }),
      User.aggregate([
        { $match: { isSuspended: false } },
        { $group: { _id: null, total: { $sum: '$auraPoints' } } }
      ])
    ])

    const stats = {
      totalUsers,
      totalPosts,
      totalComments,
      postsToday,
      commentsToday,
      totalAuraPoints: totalAuraPoints[0]?.total || 0,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 