import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
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
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Find user by ID
    const user = await User.findById(id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user is suspended
    if (!user.isSuspended) {
      return NextResponse.json(
        { error: 'User is not suspended' },
        { status: 400 }
      )
    }
    
    // Update user
    user.isSuspended = false
    user.suspendedUntil = null
    user.suspensionReason = null
    
    await user.save()
    
    return NextResponse.json({
      success: true,
      message: `User ${user.username} unsuspended successfully`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isSuspended: user.isSuspended
      }
    })
    
  } catch (error) {
    console.error('Error unsuspending user:', error)
    return NextResponse.json(
      { error: 'Failed to unsuspend user' },
      { status: 500 }
    )
  }
} 