"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserAvatar } from '@/components/user-avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  Users,
  Search,
  Ban,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Clock,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ManageUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [suspensionDuration, setSuspensionDuration] = useState('7d')
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 0,
    hasNext: false
  })
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/users')
    } else if (status === 'authenticated' && !session.user.isAdmin) {
      router.push('/')
    }
  }, [status, session, router])
  
  // Fetch users with search and pagination
  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchUsers(pagination.page, pagination.limit, searchQuery)
    }
  }, [session, pagination.page, pagination.limit])
  
  const fetchUsers = async (page, limit, query = '') => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(query ? { search: query } : {})
      }).toString()
      
      const response = await fetch(`/api/admin/users?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers(1, pagination.limit, searchQuery)
  }
  
  const handleResetSearch = () => {
    setSearchQuery('')
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers(1, pagination.limit, '')
  }
  
  const handleNextPage = () => {
    if (pagination.hasNext) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }
  
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }
  
  const handleSuspendUser = async () => {
    if (!selectedUser) return
    
    try {
      setLoading(true)
      
      // Calculate suspension end date based on duration
      let suspendedUntil = new Date()
      switch (suspensionDuration) {
        case '1d':
          suspendedUntil.setDate(suspendedUntil.getDate() + 1)
          break
        case '3d':
          suspendedUntil.setDate(suspendedUntil.getDate() + 3)
          break
        case '7d':
          suspendedUntil.setDate(suspendedUntil.getDate() + 7)
          break
        case '30d':
          suspendedUntil.setDate(suspendedUntil.getDate() + 30)
          break
        case 'permanent':
          // Set to a far future date for permanent suspension
          suspendedUntil.setFullYear(suspendedUntil.getFullYear() + 100)
          break
        default:
          suspendedUntil.setDate(suspendedUntil.getDate() + 7)
      }
      
      const response = await fetch(`/api/admin/users/${selectedUser._id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspendedUntil,
          suspensionReason: suspensionReason.trim() || 'Violation of community guidelines'
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to suspend user')
      }
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser._id
            ? { 
                ...user, 
                isSuspended: true, 
                suspendedUntil,
                suspensionReason: suspensionReason.trim() || 'Violation of community guidelines'
              }
            : user
        )
      )
      
      toast({
        title: "User suspended",
        description: `${selectedUser.username} has been suspended until ${suspendedUntil.toLocaleDateString()}.`,
      })
      
      // Reset state
      setSuspensionDialogOpen(false)
      setSuspensionReason('')
      setSuspensionDuration('7d')
      
    } catch (error) {
      console.error('Error suspending user:', error)
      toast({
        title: "Failed to suspend user",
        description: error.message || "An error occurred while suspending the user.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleUnsuspendUser = async () => {
    if (!selectedUser) return
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/admin/users/${selectedUser._id}/unsuspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to unsuspend user')
      }
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser._id
            ? { 
                ...user, 
                isSuspended: false, 
                suspendedUntil: null,
                suspensionReason: null
              }
            : user
        )
      )
      
      toast({
        title: "User unsuspended",
        description: `${selectedUser.username} has been unsuspended.`,
      })
      
      // Reset state
      setUnsuspendDialogOpen(false)
      
    } catch (error) {
      console.error('Error unsuspending user:', error)
      toast({
        title: "Failed to unsuspend user",
        description: error.message || "An error occurred while unsuspending the user.",
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
    <div className="container max-w-6xl py-10">
      <div className="flex items-center gap-2 mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/admin')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Manage Users</h1>
        </div>
      </div>
      
      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by username or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {searchQuery && (
              <Button type="button" variant="outline" onClick={handleResetSearch}>
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
      
      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-6 bg-destructive/10 rounded-lg">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchUsers(pagination.page, pagination.limit, searchQuery)}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No users found</p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetSearch}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Aura Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-medium">{user.username}</span>
                            <span className="text-xs text-muted-foreground">{user.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.auraPoints}</TableCell>
                      <TableCell>
                        {user.isSuspended ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Ban className="h-3 w-3" />
                            Suspended
                          </Badge>
                        ) : !user.isEmailVerified ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Unverified
                          </Badge>
                        ) : user.isAdmin ? (
                          <Badge variant="default" className="flex items-center gap-1 bg-primary">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/user/${user.username}`} target="_blank">
                                <User className="h-4 w-4 mr-2" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            
                            {user.isSuspended ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setUnsuspendDialogOpen(true)
                                }}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Unsuspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setSuspensionDialogOpen(true)
                                }}
                                className="text-destructive"
                                disabled={user.isAdmin}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {users.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {users.length} of {pagination.totalUsers} users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Suspend User Dialog */}
      <AlertDialog open={suspensionDialogOpen} onOpenChange={setSuspensionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Suspend User
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to suspend {selectedUser?.username}. This will prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="suspension-reason" className="text-sm font-medium">
                Suspension Reason
              </label>
              <Input
                id="suspension-reason"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Reason for suspension"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="suspension-duration" className="text-sm font-medium">
                Suspension Duration
              </label>
              <select
                id="suspension-duration"
                value={suspensionDuration}
                onChange={(e) => setSuspensionDuration(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1d">1 Day</option>
                <option value="3d">3 Days</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendUser}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suspending...
                </>
              ) : (
                "Suspend User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Unsuspend User Dialog */}
      <AlertDialog open={unsuspendDialogOpen} onOpenChange={setUnsuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Unsuspend User
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to unsuspend {selectedUser?.username}. This will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnsuspendUser}
              disabled={loading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unsuspending...
                </>
              ) : (
                "Unsuspend User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 