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
    
    // Cannot suspend an admin
    if (user.isAdmin) {
      return NextResponse.json(
        { error: 'Cannot suspend an administrator' },
        { status: 400 }
      )
    }
    
    // Get suspension data from request body
    const data = await request.json()
    const { suspendedUntil, suspensionReason } = data
    
    if (!suspendedUntil) {
      return NextResponse.json(
        { error: 'Suspension end date is required' },
        { status: 400 }
      )
    }
    
    // Update user
    user.isSuspended = true
    user.suspendedUntil = new Date(suspendedUntil)
    user.suspensionReason = suspensionReason || 'Violation of community guidelines'
    
    await user.save()
    
    return NextResponse.json({
      success: true,
      message: `User ${user.username} suspended successfully`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isSuspended: user.isSuspended,
        suspendedUntil: user.suspendedUntil,
        suspensionReason: user.suspensionReason
      }
    })
    
  } catch (error) {
    console.error('Error suspending user:', error)
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    )
  }
} 