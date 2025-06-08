"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PostCard } from '@/components/post-card'
import { CommentList } from '@/components/comment-list'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/posts/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found')
          }
          throw new Error('Failed to fetch post')
        }
        
        const data = await response.json()
        setPost(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(err.message || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchPost()
    }
  }, [params.id])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/')}
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }
  
  if (!post) return null
  
  return (
    <div className="space-y-8">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <PostCard post={post} showBody={true} />
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-6">Comments</h2>
        <CommentList postId={post._id} />
      </div>
    </div>
  )
} 