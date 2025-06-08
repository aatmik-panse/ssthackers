import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Comment from '@/models/Comment'
import Vote from '@/models/Vote'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

// Function to build a tree of comments
function buildCommentTree(comments, parentId = null) {
  const result = []
  const childrenMap = {}
  
  // First pass: categorize comments by parent ID
  comments.forEach(comment => {
    const id = comment._id.toString()
    
    if (!childrenMap[id]) {
      childrenMap[id] = []
    }
    
    if (comment.parent) {
      const parentIdStr = comment.parent.toString()
      if (!childrenMap[parentIdStr]) {
        childrenMap[parentIdStr] = []
      }
      childrenMap[parentIdStr].push(comment)
    }
  })
  
  // Second pass: find top-level comments and build tree recursively
  comments.forEach(comment => {
    if ((parentId === null && !comment.parent) || 
        (parentId !== null && comment.parent && comment.parent.toString() === parentId)) {
      const commentObj = comment.toJSON()
      
      // Add replies to this comment
      const childComments = childrenMap[comment._id.toString()] || []
      if (childComments.length > 0) {
        commentObj.replies = buildCommentTree(childComments, comment._id.toString())
      } else {
        commentObj.replies = []
      }
      
      result.push(commentObj)
    }
  })
  
  return result
}

export async function GET(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Get session for user votes
    const session = await getServerSession(authOptions)
    
    // Fetch all comments for the post
    const comments = await Comment.find({ 
      post: id,
      isDeleted: { $ne: true } // Exclude explicitly deleted comments 
    })
    .populate('author', 'username name email image')
    .sort({ createdAt: 1 })
    
    // Get user votes if session exists
    let userVotes = {}
    if (session?.user?.id) {
      const votes = await Vote.find({
        user: session.user.id,
        comment: { $in: comments.map(c => c._id) }
      })
      
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.comment.toString()] = vote.type
        return acc
      }, {})
    }
    
    // Add user vote information and prepare for tree building
    const commentsWithVotes = comments.map(comment => {
      const commentObj = comment.toJSON()
      commentObj.userVote = userVotes[comment._id.toString()] || null
      return commentObj
    })
    
    // Build comment tree
    const commentTree = buildCommentTree(comments)
    
    return NextResponse.json(commentTree)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession()
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
    
    const data = await request.json()
    const { body, parentId } = data
    
    if (!body?.trim()) {
      return NextResponse.json(
        { error: 'Comment body is required' },
        { status: 400 }
      )
    }
    
    // Create comment object
    const commentData = {
      body: body.trim(),
      author: session.user.id,
      post: id
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