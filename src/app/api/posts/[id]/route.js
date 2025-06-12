import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Vote from '@/models/Vote'
import User from '@/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function GET(request, { params }) {
  try {
    // Properly await params
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Get session for user vote
    const session = await getServerSession(authOptions)
    
    // Find post by ID and populate author
    const post = await Post.findById(id)
      .populate('author', 'username email auraPoints')
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // If post is deleted, only return minimal info
    if (post.isDeleted) {
      const isAdmin = session?.user?.isAdmin
      const isAuthor = post.author && session?.user?.id === post.author._id.toString()
      
      if (!isAdmin && !isAuthor) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
    }
    
    // Get user vote if session exists
    let userVote = null
    if (session?.user?.id) {
      const vote = await Vote.findOne({
        user: session.user.id,
        post: id
      })
      
      userVote = vote ? vote.type : null
    }
    
    // Add user vote to post
    const postObj = post.toJSON()
    postObj.userVote = userVote
    
    return NextResponse.json(postObj)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Find post by ID
    const post = await Post.findById(id).populate('author', '_id')
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Check if user is author or admin
    const isAuthor = post.author && session.user.id === post.author._id.toString()
    const isAdmin = session.user.isAdmin
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to edit this post' },
        { status: 403 }
      )
    }
    
    // Get update data
    const data = await request.json()
    const { title, url, body } = data
    
    // Validate input
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    if (url && body) {
      return NextResponse.json(
        { error: 'Post can have either URL or text body, not both' },
        { status: 400 }
      )
    }
    
    if (!url && !body?.trim()) {
      return NextResponse.json(
        { error: 'Post must have either URL or text body' },
        { status: 400 }
      )
    }
    
    // Update post
    post.title = title.trim()
    post.url = url?.trim() || null
    post.body = body?.trim() || null
    
    await post.save()
    
    return NextResponse.json({
      success: true,
      post: await Post.findById(id).populate('author', 'username email auraPoints')
    })
    
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Find post by ID
    const post = await Post.findById(id).populate('author', '_id')
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Check if user is author or admin
    const isAuthor = post.author && session.user.id === post.author._id.toString()
    const isAdmin = session.user.isAdmin
    
    // Only admins can delete posts with null authors
    if ((!post.author && !isAdmin) || (!isAuthor && !isAdmin)) {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      )
    }
    
    // Check if post is already deleted
    const wasAlreadyDeleted = post.isDeleted;
    
    // Soft delete by setting isDeleted flag
    post.isDeleted = true;
    await post.save();
    
    // Deduct 3 aura points from the author if post is deleted
    // Only deduct points if the post wasn't already deleted and has an author
    if (!wasAlreadyDeleted && post.author) {
      await User.findByIdAndUpdate(
        post.author._id,
        { $inc: { auraPoints: -3 } }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Post deleted successfully' 
    })
    
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
} 