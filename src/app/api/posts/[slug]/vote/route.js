import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Vote from '@/models/Vote'
import User from '@/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

export async function POST(request, { params }) {
  // Define variables that need to be accessible in both try and catch blocks
  let session;
  let slug;
  let type;
  let post;
  
  try {
    session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Properly await params
    const { slug: paramSlug } = await params
    slug = paramSlug
    if (!slug) {
      return NextResponse.json(
        { error: 'Post slug is required' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Get vote type from request body
    const data = await request.json()
    type = data.type
    
    if (!['upvote', 'downvote', 'remove'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }
    
    // Try to find post by slug first, then fallback to ID
    post = await Post.findOne({ slug }).populate('author', 'auraPoints')
    
    if (!post && slug.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(slug).populate('author', 'auraPoints')
    }
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Check for existing vote
    const existingVote = await Vote.findOne({
      user: session.user.id,
      post: post._id
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
        } else {
          // Same vote type - this means user is trying to vote again with same type
          // This should be treated as removing the vote
          await Vote.findByIdAndDelete(existingVote._id)
          voteChange = existingVote.type === 'upvote' ? -1 : 1
          auraChange = existingVote.type === 'upvote' ? -5 : 0
          newUserVote = null
        }
      } else {
        // Create new vote
        const newVote = new Vote({
          user: session.user.id,
          post: post._id,
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
      post._id,
      { $inc: { votes: voteChange } },
      { new: true }
    )

    // Update author's aura points (only if post has a registered author)
    if (auraChange !== 0 && post.author && post.author._id) {
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
      // Try to find and return the existing vote
      try {
        const existingVote = await Vote.findOne({
          user: session.user.id,
          post: post._id
        })
        
        if (existingVote) {
          // Calculate what the vote change should be
          let voteChange = 0;
          if (existingVote.type === 'upvote' && type === 'downvote') {
            voteChange = -2; // From upvote to downvote
            console.log('Changing from upvote to downvote, vote change:', voteChange);
          } else if (existingVote.type === 'downvote' && type === 'upvote') {
            voteChange = 2; // From downvote to upvote
            console.log('Changing from downvote to upvote, vote change:', voteChange);
          } else {
            console.log('No vote type change needed:', existingVote.type, type);
          }
          
          // Update post vote count if needed
          if (voteChange !== 0) {
            await Post.findByIdAndUpdate(
              post._id,
              { $inc: { votes: voteChange } },
              { new: true }
            );
            
            // Update the vote type
            existingVote.type = type;
            await existingVote.save();
          }
          
          // Get the updated post
          const updatedPost = await Post.findById(post._id);
          
          return NextResponse.json({
            votes: updatedPost.votes,
            userVote: existingVote.type,
            message: 'Vote updated'
          });
        }
      } catch (findError) {
        console.error('Error finding existing vote:', findError)
      }
      
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