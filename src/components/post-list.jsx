"use client"

import { useState, useEffect } from 'react'
import { PostCard } from './post-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function PostList({ feed = 'hot', limit = 20, userId = null }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        feed,
        limit: limit.toString(),
        page: pageNum.toString(),
        ...(userId && { userId })
      })

      const response = await fetch(`/api/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')
      
      const data = await response.json()
      
      if (reset) {
        setPosts(data.posts)
      } else {
        setPosts(prev => [...prev, ...data.posts])
      }
      
      setHasMore(data.hasMore)
      setPage(pageNum)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1, true)
  }, [feed, userId])

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1)
    }
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error loading posts: {error}</p>
        <Button onClick={() => fetchPosts(1, true)}>
          Try Again
        </Button>
      </div>
    )
  }

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No posts found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Be the first to share something with the community!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <PostCard 
          key={post._id} 
          post={post} 
          rank={index + 1} 
        />
      ))}
      
      {hasMore && (
        <div className="text-center py-6">
          <Button 
            onClick={loadMore}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
} 