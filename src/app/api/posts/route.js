import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Vote from '@/models/Vote'
import { calculateHotScore } from '@/lib/utils'

export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const feed = searchParams.get('feed') || 'hot'
    const limit = parseInt(searchParams.get('limit')) || 20
    const page = parseInt(searchParams.get('page')) || 1
    const userId = searchParams.get('userId')
    const authorId = searchParams.get('author')
    const timeFilter = searchParams.get('time') // for top posts: day, week, month, all
    
    const skip = (page - 1) * limit
    const session = await getServerSession()

    let query = { isDeleted: false }
    let sort = {}

    // Add user/author filter if specified
    if (userId) {
      query.author = userId
    } else if (authorId) {
      query.author = authorId
    }

    // Handle different feed types
    switch (feed) {
      case 'hot':
        // Calculate and update hot scores for recent posts
        const recentPosts = await Post.find({
          ...query,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        })

        for (const post of recentPosts) {
          const newHotScore = calculateHotScore(post.votes, post.createdAt, post.commentCount)
          if (Math.abs(post.hotScore - newHotScore) > 0.1) {
            await Post.findByIdAndUpdate(post._id, { hotScore: newHotScore })
          }
        }

        sort = { hotScore: -1, createdAt: -1 }
        break

      case 'new':
        sort = { createdAt: -1 }
        break

      case 'top':
        // Add time filter for top posts
        if (timeFilter && timeFilter !== 'all') {
          const timeMap = {
            day: 1,
            week: 7,
            month: 30
          }
          const days = timeMap[timeFilter] || 1
          query.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
        sort = { votes: -1, createdAt: -1 }
        break

      default:
        sort = { createdAt: -1 }
    }

    // Fetch posts with pagination
    const posts = await Post.find(query)
      .populate('author', 'username email auraPoints')
      .sort(sort)
      .skip(skip)
      .limit(limit + 1) // Get one extra to check if there are more

    const hasMore = posts.length > limit
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts

    // Get user votes if session exists
    let userVotes = {}
    if (session?.user?.id) {
      const votes = await Vote.find({
        user: session.user.id,
        post: { $in: postsToReturn.map(p => p._id) }
      })
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.post.toString()] = vote.type
        return acc
      }, {})
    }

    // Add user vote information to posts
    const postsWithVotes = postsToReturn.map(post => ({
      ...post.toJSON(),
      userVote: userVotes[post._id.toString()] || null
    }))

    return NextResponse.json({
      posts: postsWithVotes,
      hasMore,
      page,
      totalPages: Math.ceil(await Post.countDocuments(query) / limit)
    })

  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectDB()

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

    // Create new post
    const post = new Post({
      title: title.trim(),
      url: url?.trim() || null,
      body: body?.trim() || null,
      author: session.user.id
    })

    await post.save()
    await post.populate('author', 'username email auraPoints')

    return NextResponse.json(post, { status: 201 })

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
} 