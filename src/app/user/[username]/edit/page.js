"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { UserAvatar } from '@/components/user-avatar'
import { useToast } from '@/components/ui/use-toast'
import {
  Github,
  Linkedin,
  Twitter,
  Globe,
  MapPin,
  User,
  FileText,
  Camera,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Create schema for form validation
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).optional().nullable(),
  image: z.string().optional().nullable(),
  bio: z.string().max(500, {
    message: "Bio must not be longer than 500 characters.",
  }).optional().nullable(),
  location: z.string().max(100, {
    message: "Location must not be longer than 100 characters.",
  }).optional().nullable(),
  github: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
})

export default function EditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const { toast } = useToast()
  
  const { username } = params
  
  // Initialize form with schema
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      image: "",
      bio: "",
      location: "",
      github: "",
      linkedin: "",
      twitter: "",
      website: "",
    },
  })
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${username}`)
        
        if (!response.ok) {
          throw new Error(response.statusText || 'Failed to fetch profile')
        }
        
        const data = await response.json()
        setProfile(data)
        
        // Set form default values
        form.reset({
          name: data.name || "",
          image: data.image || "",
          bio: data.bio || "",
          location: data.location || "",
          github: data.socialLinks?.github || "",
          linkedin: data.socialLinks?.linkedin || "",
          twitter: data.socialLinks?.twitter || "",
          website: data.socialLinks?.website || "",
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    // Check authentication
    if (status === "authenticated") {
      fetchProfile()
    } else if (status === "unauthenticated") {
      router.push(`/user/${username}`)
    }
  }, [username, status, form, router, toast])
  
  // Handle form submission
  async function onSubmit(values) {
    // Make sure user is authenticated and is editing their own profile
    if (!session || session.user.id !== profile._id) {
      toast({
        title: "Error",
        description: "You are not authorized to edit this profile",
        variant: "destructive",
      })
      return
    }
    
    try {
      // Prepare data for API
      const socialLinks = {
        github: values.github,
        linkedin: values.linkedin,
        twitter: values.twitter,
        website: values.website,
      }
      
      const updateData = {
        name: values.name,
        image: values.image,
        bio: values.bio,
        location: values.location,
        socialLinks,
      }
      
      // Send update request
      const response = await fetch(`/api/users/${username}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to update profile')
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated",
      })
      
      // Redirect to profile page
      router.push(`/user/${username}`)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }
  
  // Check if user is authorized
  if (status === "authenticated" && profile && session.user.id !== profile._id) {
    router.push(`/user/${username}`)
    return null
  }
  
  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-64 bg-muted rounded"></div>
        <div className="h-12 bg-muted rounded"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/user/${username}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your profile information and social links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Preview */}
                <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <UserAvatar user={{
                      ...profile,
                      name: form.watch("name") || profile?.name,
                      image: form.watch("image") || profile?.image
                    }} size="xl" />
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    <p className="font-medium">{form.watch("name") || profile?.name}</p>
                    <p>@{profile?.username}</p>
                  </div>
                </div>
                
                {/* Form Fields */}
                <div className="w-full md:w-2/3 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>Username</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Input 
                          value={profile?.username || ""}
                          disabled
                          className="bg-muted"
                        />
                        <div className="text-xs text-muted-foreground">
                          Cannot be changed
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Username is set during account creation and cannot be changed
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture (Optional)</FormLabel>
                          <FormControl>
                            <div className="p-4 border border-dashed rounded-md bg-muted/50 flex flex-col items-center justify-center space-y-2 text-center">
                              <Camera className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Avatar customization coming soon!</p>
                                <p className="text-sm text-muted-foreground">
                                  We&apos;re working on adding avatar customization options.
                                </p>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Avatar customization will be available in a future update
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            A short bio about yourself (max 500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="City, Country" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Links</h3>
                    
                    <FormField
                      control={form.control}
                      name="github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                <Github className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="https://github.com/username" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                <Linkedin className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="https://linkedin.com/in/username" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                <Twitter className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="https://twitter.com/username" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personal Website (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                <Globe className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="https://yourwebsite.com" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => router.push(`/user/${username}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 