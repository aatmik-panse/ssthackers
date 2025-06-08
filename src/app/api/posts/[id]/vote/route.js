import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Vote from '@/models/Vote'
import User from '@/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectDB()

    const { id: postId } = params
    const { type } = await request.json() // 'upvote', 'downvote', or 'remove'

    // Find the post
    const post = await Post.findById(postId).populate('author')
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Prevent self-voting
    if (post.author._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own post' },
        { status: 400 }
      )
    }

    // Find existing vote
    const existingVote = await Vote.findOne({
      user: session.user.id,
      post: postId
    })

    let voteChange = 0
    let auraChange = 0
    let newUserVote = null

    if (type === 'remove' && existingVote) {
      // Remove existing vote
      await Vote.findByIdAndDelete(existingVote._id)
      voteChange = existingVote.type === 'upvote' ? -1 : 1
      auraChange = existingVote.type === 'upvote' ? -5 : 0
    } else if (type === 'upvote' || type === 'downvote') {
      if (existingVote) {
        // Update existing vote
        if (existingVote.type !== type) {
          existingVote.type = type
          await existingVote.save()
          
          voteChange = type === 'upvote' ? 2 : -2 // From down to up or vice versa
          auraChange = type === 'upvote' ? 5 : -5
          newUserVote = type
        }
      } else {
        // Create new vote
        const newVote = new Vote({
          user: session.user.id,
          post: postId,
          type
        })
        await newVote.save()
        
        voteChange = type === 'upvote' ? 1 : -1
        auraChange = type === 'upvote' ? 5 : 0
        newUserVote = type
      }
    }

    // Update post vote count
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { votes: voteChange } },
      { new: true }
    )

    // Update author's aura points
    if (auraChange !== 0) {
      await User.findByIdAndUpdate(
        post.author._id,
        { $inc: { auraPoints: Math.max(-post.author.auraPoints, auraChange) } } // Prevent negative aura
      )
    }

    return NextResponse.json({
      votes: updatedPost.votes,
      userVote: newUserVote
    })

  } catch (error) {
    console.error('Error voting on post:', error)
    
    // Handle duplicate vote error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already voted on this post' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to vote on post' },
      { status: 500 }
    )
  }
} 