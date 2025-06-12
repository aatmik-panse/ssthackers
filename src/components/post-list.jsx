"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { VoteButtons } from '@/components/vote-buttons'
import { formatTimeAgo, extractDomain } from '@/lib/utils'
import { ArrowUpIcon, ArrowDownIcon, MessageSquareIcon, ExternalLinkIcon, User, Mail } from 'lucide-react'

export function PostList({ feed = 'hot', userId, limit = 20 }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(null)
  const prevFeed = useRef(feed)
  
  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: pageNum,
        limit,
        sort: feed,
        ...(userId ? { author: userId } : {})
      })
      
      const response = await fetch(`/api/posts?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const data = await response.json()
      
      if (reset || pageNum === 1) {
        setPosts(data.posts)
      } else {
        setPosts(prev => [...prev, ...data.posts])
      }
      
      setHasMore(data.hasMore)
      setError(null)
      setInitialLoad(false)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts')
      setInitialLoad(false)
    } finally {
      setLoading(false)
    }
  }, [feed, userId, limit])
  
  // Handle initial load and feed changes
  useEffect(() => {
    // Reset everything when feed changes
    if (prevFeed.current !== feed) {
      setPage(1)
      fetchPosts(1, true)
      prevFeed.current = feed
    } else if (page === 1) {
      fetchPosts(1)
    }
  }, [fetchPosts, feed, page])
  
  // Handle pagination with intersection observer
  useEffect(() => {
    if (!loadingRef.current || loading || !hasMore || initialLoad) return
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1)
          fetchPosts(page + 1)
        }
      },
      { threshold: 0.5 }
    )
    
    observer.observe(loadingRef.current)
    
    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current)
      }
    }
  }, [loading, hasMore, fetchPosts, page, initialLoad])
  
  // Handle vote update
  const handleVoteUpdate = (postId, newVotes, newUserVote) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId 
          ? { ...post, votes: newVotes, userVote: newUserVote } 
          : post
      )
    )
  }
  
  if (initialLoad) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-12 flex flex-col items-center gap-1">
                  <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchPosts(1, true)} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard 
          key={post._id} 
          post={post} 
          onVoteUpdate={(newVotes, newUserVote) => 
            handleVoteUpdate(post._id, newVotes, newUserVote)
          }
        />
      ))}
      
      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={loadingRef} className="h-20 flex items-center justify-center">
          {loading && (
            <div className="animate-pulse space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 flex flex-col items-center gap-1">
                      <div className="h-8 w-8 bg-muted rounded"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PostCard({ post, onVoteUpdate }) {
  const { data: session } = useSession()
  const router = useRouter()
  const domain = post.url ? extractDomain(post.url) : null
  const voteCount = post.votes || 0
  
  const hasAuthor = post.author && post.author._id
  
  const handleVoteClick = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/')
    }
  }
  
  return (
    <Card className="border-2 hover:border-primary/20 transition-all overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Vote Sidebar - Better mobile sizing */}
          <div className="w-14 sm:w-16 bg-muted/20 flex flex-col items-center justify-center py-4 gap-1">
            <VoteButtons
              type="post"
              itemId={post._id}
              votes={voteCount}
              userVote={post.userVote}
              onVoteUpdate={onVoteUpdate}
              disabled={!session}
              redirectToSignIn={true}
            />
          </div>
          
          {/* Content - Better mobile layout */}
          <div className="flex-1 p-4 min-w-0">
            <div className="space-y-3">
              {/* Title and domain */}
              <div>
                <h3 className="font-semibold text-sm sm:text-base leading-snug mb-1">
                  <Link 
                    href={`/posts/${post._id}`} 
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>
                
                {domain && (
                  <Link 
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ({domain})
                  </Link>
                )}
              </div>
              
              {/* Metadata - Stacked on mobile for better readability */}
              <div className="space-y-2 sm:space-y-1">
                                  {/* Author info */}
                  {hasAuthor ? (
                    <div className="flex items-center gap-2">
                      <UserAvatar user={post.author} size="xs" />
                      <Link 
                        href={`/user/${post.author.username}`}
                        className="text-xs font-medium hover:text-foreground transition-colors leading-none flex items-center"
                      >
                        {post.author.username || post.author.name}
                      </Link>
                    </div>
                ) : post.targetUserEmail ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-amber-600 font-medium">
                      {post.targetUserEmail} (waiting for signup)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span className="text-xs">Unknown user</span>
                  </div>
                )}
                
                {/* Time and comments */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatTimeAgo(post.createdAt)}</span>
                  
                  <Link 
                    href={`/posts/${post._id}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <MessageSquareIcon className="h-3 w-3" />
                    <span>{post.commentCount || 0} comments</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Default export for lazy loading
export default PostList; 