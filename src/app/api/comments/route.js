import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Comment from '@/models/Comment'
import Post from '@/models/Post'
import User from '@/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const data = await request.json()
    const { body, postId, parentId } = data
    
    if (!body?.trim()) {
      return NextResponse.json(
        { error: 'Comment body is required' },
        { status: 400 }
      )
    }
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    // Verify the post exists
    const post = await Post.findById(postId)
    if (!post || post.isDeleted) {
      return NextResponse.json(
        { error: 'Post not found or deleted' },
        { status: 404 }
      )
    }
    
    // Create comment object
    const commentData = {
      body: body.trim(),
      author: session.user.id,
      post: postId
    }
    
    // If this is a reply, set parent and fetch its depth
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
      
      commentData.parent = parentId
      commentData.depth = parentComment.depth + 1
    } else {
      commentData.depth = 0
    }
    
    // Create and save the comment
    const comment = new Comment(commentData)
    await comment.save()
    
    // Increment comment count on the post
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })
    
    // Award 1 aura point to the user for commenting
    await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { auraPoints: 1 } }
    )
    
    // Populate author data
    await comment.populate('author', 'username name email image')
    
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 