"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, FileText, Link2, Loader2, Shield, AlertTriangle, UserPlus, Mail } from 'lucide-react'

export default function CreatePostForUser() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('link')
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(false)
  const [userStatus, setUserStatus] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    body: '',
    userEmail: '',
  })
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/posts-for-user')
    } else if (status === 'authenticated' && !session.user.isAdmin) {
      router.push('/')
    }
  }, [status, session, router])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleTabChange = (value) => {
    setActiveTab(value)
    // Clear the field from the inactive tab
    if (value === 'link') {
      setFormData(prev => ({ ...prev, body: '' }))
    } else {
      setFormData(prev => ({ ...prev, url: '' }))
    }
  }
  
  const checkUserExists = async () => {
    if (!formData.userEmail.trim()) return
    
    try {
      setUserLoading(true)
      setUserStatus(null)
      
      const response = await fetch(`/api/admin/check-user?email=${encodeURIComponent(formData.userEmail)}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserStatus({
          exists: data.exists,
          username: data.username,
          message: data.exists 
            ? `User found: ${data.username}` 
            : "User not found. Post will be assigned when they sign up."
        })
      } else {
        throw new Error(data.error || "Failed to check user")
      }
    } catch (error) {
      console.error("Error checking user:", error)
      setUserStatus({
        error: true,
        message: error.message || "Error checking user status"
      })
    } finally {
      setUserLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Validate form
      if (!formData.title.trim()) {
        toast({
          title: "Title required",
          description: "Please provide a title for the post",
          variant: "destructive"
        })
        return
      }
      
      if (activeTab === 'link' && !formData.url.trim()) {
        toast({
          title: "URL required",
          description: "Please provide a URL for the link post",
          variant: "destructive"
        })
        return
      }
      
      if (activeTab === 'text' && !formData.body.trim()) {
        toast({
          title: "Text required",
          description: "Please provide text content for the post",
          variant: "destructive"
        })
        return
      }
      
      if (!formData.userEmail.trim()) {
        toast({
          title: "User email required",
          description: "Please provide the email of the user for whom this post is being created",
          variant: "destructive"
        })
        return
      }
      
      // Submit post
      const response = await fetch('/api/admin/posts-for-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }
      
      const post = await response.json()
      
      // Show success toast
      toast({
        title: "Post created successfully",
        description: userStatus?.exists 
          ? `Post created for ${userStatus.username} and 3 aura points awarded.`
          : "Post created and will be assigned to the user when they sign up."
      })
      
      // Reset form
      setFormData({
        title: '',
        url: '',
        body: '',
        userEmail: '',
      })
      setUserStatus(null)
      
    } catch (error) {
      console.error('Error submitting post:', error)
      toast({
        title: "Submission failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  if (status === 'loading' || status === 'unauthenticated' || !session?.user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center gap-2 mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/admin')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Create Post for User</h1>
        </div>
      </div>
      
      <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Admin Action</AlertTitle>
        <AlertDescription>
          You are creating a post on behalf of another user. The post will be attributed to them,
          and they will receive the 3 aura points for the post. If the user doesn't exist yet,
          the post will be associated with their email and assigned to them when they sign up.
        </AlertDescription>
      </Alert>
      
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Create Post for User</CardTitle>
          <CardDescription>
            Fill out the form below to create a post on behalf of a user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Email Field */}
            <div className="space-y-2">
              <Label htmlFor="userEmail" className="text-base font-medium">
                User Email <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="userEmail"
                  name="userEmail"
                  type="email"
                  value={formData.userEmail}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="border-2 flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={checkUserExists}
                  disabled={userLoading || !formData.userEmail.trim()}
                >
                  {userLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>
              
              {/* User status message */}
              {userStatus && (
                <div className={`text-sm mt-2 ${userStatus.error ? 'text-destructive' : userStatus.exists ? 'text-green-600' : 'text-amber-600'}`}>
                  {userStatus.message}
                </div>
              )}
            </div>
            
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a concise, descriptive title"
                className="border-2"
                maxLength={300}
              />
              <div className="text-xs text-muted-foreground flex justify-end">
                {formData.title.length}/300
              </div>
            </div>
            
            {/* Post Type Selector */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Link
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="space-y-2">
                <Label htmlFor="url" className="text-base font-medium">
                  URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  type="url"
                  className="border-2"
                />
              </TabsContent>
              
              <TabsContent value="text" className="space-y-2">
                <Label htmlFor="body" className="text-base font-medium">
                  Text <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="body"
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Post content..."
                  className="min-h-[200px] border-2"
                />
              </TabsContent>
            </Tabs>
            
            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.userEmail.trim()} 
                className="min-w-32"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Post"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 