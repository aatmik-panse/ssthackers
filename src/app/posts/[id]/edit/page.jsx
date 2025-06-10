"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [post, setPost] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    body: ''
  })
  
  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(`/posts/${params.id}/edit`))
    }
  }, [status, router, params.id])
  
  // Fetch post data
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
        
        // Check if user is authorized to edit
        if (session?.user?.id !== data.author._id && !session?.user?.isAdmin) {
          router.push(`/posts/${params.id}`)
          return
        }
        
        setPost(data)
        setFormData({
          title: data.title || '',
          url: data.url || '',
          body: data.body || ''
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(err.message || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id && session?.user?.id) {
      fetchPost()
    }
  }, [params.id, session?.user?.id, router])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    
    // URL and body validation - can't have both
    if (formData.url && formData.body) {
      setError('Post can have either URL or text body, not both')
      return
    }
    
    if (!formData.url && !formData.body) {
      setError('Post must have either URL or text body')
      return
    }
    
    try {
      setSaving(true)
      
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update post')
      }
      
      router.push(`/posts/${params.id}`)
    } catch (err) {
      setError(err.message || 'Failed to update post')
    } finally {
      setSaving(false)
    }
  }
  
  if (status === 'loading' || loading) {
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
          <p className="text-destructive">{error}</p>
          <Button 
            className="mt-4"
            onClick={() => router.push(`/posts/${params.id}`)}
          >
            Back to Post
          </Button>
        </div>
      </div>
    )
  }
  
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
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Post title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input 
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Add a URL or write text below, but not both
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Text</Label>
              <Textarea 
                id="body"
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Write your post here..."
                rows={5}
              />
            </div>
            
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/posts/${params.id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 