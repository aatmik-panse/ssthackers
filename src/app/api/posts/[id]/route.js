import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Vote from '@/models/Vote'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function GET(request, { params }) {
  try {
    const { id } = params
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
      const isAuthor = session?.user?.id === post.author._id.toString()
      
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