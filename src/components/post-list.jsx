"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { VoteButtons } from '@/components/vote-buttons'
import { formatTimeAgo, extractDomain } from '@/lib/utils'
import { ArrowUpIcon, ArrowDownIcon, MessageSquareIcon, ExternalLinkIcon } from 'lucide-react'

export function PostList({ feed = 'hot', userId, limit = 10 }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({
          page,
          limit,
          sort: feed,
          ...(userId ? { author: userId } : {})
        })
        
        const response = await fetch(`/api/posts?${queryParams}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        
        const data = await response.json()
        
        if (page === 1) {
          setPosts(data.posts)
        } else {
          setPosts(prev => [...prev, ...data.posts])
        }
        
        setHasMore(data.hasMore)
        setError(null)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError('Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [userId, page, limit, feed])
  
  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }
  
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
  
  if (loading && page === 1) {
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
        <Button variant="outline" size="sm" onClick={() => setPage(1)} className="mt-4">
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
      
      {loading && page > 1 && (
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
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
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

function PostCard({ post, onVoteUpdate }) {
  const { data: session } = useSession()
  const router = useRouter()
  const domain = post.url ? extractDomain(post.url) : null
  const voteCount = post.votes?.upvotes - post.votes?.downvotes || 0
  
  const handleVoteClick = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/')
    }
  }
  
  return (
    <Card className="border-2 hover:border-primary/20 transition-all">
      <CardContent className="p-0">
        <div className="flex">
          {/* Vote Sidebar */}
          <div className="w-16 bg-muted/20 flex flex-col items-center py-4 gap-1">
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
          
          {/* Content */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link 
                    href={`/posts/${post._id}`} 
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                  
                  {domain && (
                    <Link 
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ({domain})
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground gap-4">
                <div className="flex items-center gap-1.5">
                  <UserAvatar user={post.author} size="xs" />
                  <Link 
                    href={`/user/${post.author?.username}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {post.author?.username || post.author?.name}
                  </Link>
                </div>
                
                <div>{formatTimeAgo(post.createdAt)}</div>
                
                <Link 
                  href={`/posts/${post._id}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <MessageSquareIcon className="h-3.5 w-3.5" />
                  <span>{post.commentCount || 0} comments</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 