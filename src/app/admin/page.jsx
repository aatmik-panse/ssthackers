"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Shield, FileText, Users, Flag, AlertTriangle, UserPlus } from 'lucide-react'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin')
    } else if (status === 'authenticated' && !session.user.isAdmin) {
      router.push('/')
    }
  }, [status, session, router])
  
  if (status === 'loading' || status === 'unauthenticated' || !session?.user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
          <div className="space-y-4">
            <div className="h-4 w-48 bg-primary/20 rounded"></div>
            <div className="h-4 w-64 bg-primary/10 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container max-w-5xl py-10">
      <div className="flex items-center gap-4 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Admin Access</AlertTitle>
        <AlertDescription>
          You have administrative privileges. Please use these powers responsibly and respect user privacy.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Content Management
            </CardTitle>
            <CardDescription>
              Manage posts, comments, and other content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Link href="/admin/posts-for-user">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Posts for Users
                </Button>
              </Link>
              <Link href="/admin/flagged-content">
                <Button variant="outline" className="w-full justify-start">
                  <Flag className="mr-2 h-4 w-4" />
                  Review Flagged Content
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 