"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Link2, FileText, Loader2, AlertCircle } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function SubmitPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('link')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    body: ''
  })
  
  // Redirect to sign in if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/submit')
    return null
  }
  
  // Still loading session
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Validate form
      if (!formData.title.trim()) {
        toast({
          title: "Title required",
          description: "Please provide a title for your post",
          variant: "destructive"
        })
        return
      }
      
      if (activeTab === 'link' && !formData.url.trim()) {
        toast({
          title: "URL required",
          description: "Please provide a URL for your link post",
          variant: "destructive"
        })
        return
      }
      
      if (activeTab === 'text' && !formData.body.trim()) {
        toast({
          title: "Text required",
          description: "Please provide text content for your post",
          variant: "destructive"
        })
        return
      }
      
      // Submit post
      const response = await fetch('/api/posts', {
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
        title: "Post submitted!",
        description: "Your post has been created successfully."
      })
      
      // Redirect to the new post
      router.push(`/posts/${post._id}`)
      
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
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Share Your Brilliance</CardTitle>
          <p className="text-muted-foreground">
            Inspire, educate, and connect with the SST community
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
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
                    placeholder="Share your thoughts, ideas, or questions..."
                    className="min-h-[200px] border-2"
                  />
                </TabsContent>
              </Tabs>
              
              {/* Community Guidelines Reminder */}
              <div className="bg-primary/5 p-4 rounded-lg flex items-start gap-3 text-sm">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Spark meaningful conversations</p>
                  <p className="text-muted-foreground mt-1">
                    Share content that inspires, educates, or challenges the SST community.
                    <Link href="/guidelines" className="text-primary font-medium ml-1 hover:underline">
                      Check our community guidelines
                    </Link>
                  </p>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="min-w-32">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Post"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 