"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { Mail, MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    
    try {
      // In a real app, you would send this data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Message sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      })
      
      // Reset form (except name and email if logged in)
      setFormData(prev => ({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        subject: '',
        message: ''
      }))
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="text-xl text-muted-foreground">
          Get in touch with the SST Hackers team
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="border-2">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Send us a message
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      disabled={!!session?.user?.name}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled={!!session?.user?.email}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is your message about?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="min-w-32">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="border-2">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg">Email</h3>
                  <p className="text-muted-foreground mt-1">
                    <a href="mailto:dev.aatmik@gmail.com" className="text-primary hover:underline">
                      dev.aatmik@gmail.com
                    </a>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">Response Time</h3>
                  <p className="text-muted-foreground mt-1">
                    We typically respond to inquiries within 24-48 hours during weekdays.
                  </p>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg flex items-start gap-3 text-sm">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Report issues or violations</p>
                    <p className="text-muted-foreground mt-1">
                      For reporting content that violates our community guidelines, please include links and details in your message.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 mt-6">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                FAQs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">How do I reset my password?</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You can reset your password from the sign-in page by clicking on "Forgot password".
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">How are Aura points calculated?</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You earn Aura points when your posts and comments receive upvotes from other users.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Can I delete my account?</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Yes, you can request account deletion by contacting our support team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 