"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink, FileText, User, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatTimeAgo, extractDomain } from '@/lib/utils'

export function AdminCreatedPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPosts: 0,
    totalPages: 0,
    hasMore: false
  })

  useEffect(() => {
    fetchPosts(pagination.page, pagination.limit)
  }, [pagination.page, pagination.limit])

  const fetchPosts = async (page, limit) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/posts-by-admin?page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const data = await response.json()
      setPosts(data.posts)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      console.error('Error fetching admin-created posts:', err)
      setError('Failed to load posts created for you by admins')
    } finally {
      setLoading(false)
    }
  }

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6 bg-destructive/10 rounded-lg">
        <p className="text-destructive">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchPosts(pagination.page, pagination.limit)}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No posts have been created for you by admins.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post._id} className="overflow-hidden border-2">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary">Admin Created</Badge>
                </div>
                <div className="flex-1 space-y-2">
                  <Link href={`/posts/${post._id}`} className="group">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Created by admin: {post.adminCreator?.username || 'Unknown'}
                    </span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  
                  {post.url ? (
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {extractDomain(post.url)}
                    </a>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Text post
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!pagination.hasMore}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
} 