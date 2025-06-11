"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { PostList } from '@/components/post-list'
import { AdminCreatedPosts } from '@/components/admin-created-posts'
import { formatTimeAgo } from '@/lib/utils'
import {
  Calendar,
  FileText,
  MessageSquare,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Edit,
  MapPin,
  UserPlus
} from 'lucide-react'

export default function UserProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { username } = params
  
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
        setError(null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }
    
    if (username) {
      fetchProfile()
    }
  }, [username])
  
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="rounded-full bg-muted h-24 w-24"></div>
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-16 bg-muted rounded w-full"></div>
          </div>
        </div>
        <div className="h-12 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    )
  }
  
  if (error || !profile) {
    return (
      <div className="text-center py-12 bg-destructive/10 rounded-lg border border-destructive/20">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The user profile you&apos;re looking for doesn&apos;t exist or isn&apos;t available.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
  }
  
  const isOwnProfile = session?.user?.id === profile._id
  
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="relative">
                <UserAvatar user={profile} size="xl" />
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              </div>
              
              {isOwnProfile && (
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href={`/user/${username}/edit`} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              
              {profile.bio && (
                <p className="text-foreground">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatTimeAgo(profile.joinedAt)}</span>
                </div>
                
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{profile.postCount} posts</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{profile.commentCount} comments</span>
                </div>
              </div>
              
              {/* Social Links */}
              {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
                <div className="flex gap-3 mt-2">
                  {profile.socialLinks.github && (
                    <a 
                      href={profile.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  
                  {profile.socialLinks.linkedin && (
                    <a 
                      href={profile.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  
                  {profile.socialLinks.twitter && (
                    <a 
                      href={profile.socialLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  
                  {profile.socialLinks.website && (
                    <a 
                      href={profile.socialLinks.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Aura Points Badge */}
      <div className="flex justify-center">
        <div className="bg-primary/10 px-6 py-3 rounded-full flex items-center gap-2">
          <span className="font-semibold">Aura Points:</span>
          <span className="text-xl font-bold aura-points">{profile.auraPoints}</span>
        </div>
      </div>
      
      {/* Activity Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="admin-posts" className="flex items-center gap-1.5">
              <UserPlus className="h-4 w-4" />
              <span>Admin-Created</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          <PostList userId={profile._id} />
        </TabsContent>
        
        <TabsContent value="comments" className="mt-6">
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Comment history will be implemented soon.</p>
          </div>
        </TabsContent>
        
        {isOwnProfile && (
          <TabsContent value="admin-posts" className="mt-6">
            <div className="mb-4 p-4 border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 rounded-lg">
              <h3 className="text-base font-medium mb-1 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-600" />
                <span>Posts Created For You</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                These posts were created on your behalf by administrators. You can edit them as needed.
              </p>
            </div>
            <AdminCreatedPosts />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
} 