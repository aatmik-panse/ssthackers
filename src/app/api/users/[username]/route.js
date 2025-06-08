import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import Comment from '@/models/Comment'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function GET(request, { params }) {
  try {
    // Properly await params
    const { username } = await params
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user by username
    const user = await User.findOne({
      email: new RegExp(`^${username}@`, 'i')
    }).select('-password -__v')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get post and comment counts
    const [postCount, commentCount] = await Promise.all([
      Post.countDocuments({ author: user._id, isDeleted: false }),
      Comment.countDocuments({ author: user._id, isDeleted: false })
    ])

    // Get the user's latest posts
    const recentPosts = await Post.find({ 
      author: user._id,
      isDeleted: false 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title url createdAt votes commentCount')

    // Convert the user to a JSON object to include virtual fields
    const userObj = user.toJSON()

    // Add the post and comment counts
    const responseData = {
      ...userObj,
      postCount,
      commentCount,
      recentPosts
    }

    // Check if the requesting user can see sensitive information
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.id !== user._id.toString() && !session.user.isAdmin)) {
      // Remove sensitive information for non-owners
      delete responseData.email
      delete responseData.isEmailVerified
      delete responseData.suspendedUntil
      delete responseData.suspensionReason
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Properly await params
    const { username } = await params
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user by username
    const user = await User.findOne({
      email: new RegExp(`^${username}@`, 'i')
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only allow users to update their own profile (or admins)
    if (session.user.id !== user._id.toString() && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to update this profile' },
        { status: 403 }
      )
    }

    // Get update data from request
    const updateData = await request.json()
    
    // Fields that are allowed to be updated
    const allowedFields = ['name', 'image', 'bio', 'location', 'socialLinks', 'username']
    
    // Create object with only allowed fields
    const sanitizedData = {}
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field]
      }
    }
    
    // Handle username change by updating the email
    if (sanitizedData.username) {
      // Extract domain from current email
      const domain = user.email.split('@')[1]
      
      // Create new email with new username and same domain
      sanitizedData.email = `${sanitizedData.username}@${domain}`
      
      // Check if the new email is already taken
      const existingUser = await User.findOne({ 
        email: sanitizedData.email,
        _id: { $ne: user._id } // Exclude current user
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 400 }
        )
      }
      
      // Remove username from sanitized data as it's a virtual property
      delete sanitizedData.username
    }

    // Validate social links
    if (sanitizedData.socialLinks) {
      const validSocialLinks = {}
      const allowedSocialPlatforms = ['github', 'linkedin', 'twitter', 'website']
      
      for (const platform of allowedSocialPlatforms) {
        if (sanitizedData.socialLinks[platform] !== undefined) {
          // Simple URL validation
          let url = sanitizedData.socialLinks[platform]
          if (url && typeof url === 'string' && url.trim()) {
            // Add https:// if missing and not empty
            if (!url.match(/^https?:\/\//)) {
              url = `https://${url}`
            }
            validSocialLinks[platform] = url
          } else {
            validSocialLinks[platform] = null
          }
        }
      }
      
      sanitizedData.socialLinks = validSocialLinks
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    ).select('-password -__v')

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
} 