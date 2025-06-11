"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Flag,
  Eye,
  Trash2,
  Check,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function FlaggedContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('posts')
  const [flaggedPosts, setFlaggedPosts] = useState([])
  const [flaggedComments, setFlaggedComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showContentDialog, setShowContentDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    posts: { page: 1, limit: 10, totalItems: 0, totalPages: 0, hasNext: false },
    comments: { page: 1, limit: 10, totalItems: 0, totalPages: 0, hasNext: false }
  })
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/flagged-content')
    } else if (status === 'authenticated' && !session.user.isAdmin) {
      router.push('/')
    }
  }, [status, session, router])
  
  // Fetch flagged content
  useEffect(() => {
    if (session?.user?.isAdmin) {
      if (activeTab === 'posts') {
        fetchFlaggedPosts(pagination.posts.page, pagination.posts.limit)
      } else {
        fetchFlaggedComments(pagination.comments.page, pagination.comments.limit)
      }
    }
  }, [session, activeTab, pagination.posts.page, pagination.comments.page])
  
  const fetchFlaggedPosts = async (page, limit) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/flagged/posts?page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch flagged posts')
      }
      
      const data = await response.json()
      setFlaggedPosts(data.posts)
      setPagination(prev => ({
        ...prev,
        posts: data.pagination
      }))
      setError(null)
    } catch (err) {
      console.error('Error fetching flagged posts:', err)
      setError('Failed to load flagged posts')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchFlaggedComments = async (page, limit) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/flagged/comments?page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch flagged comments')
      }
      
      const data = await response.json()
      setFlaggedComments(data.comments)
      setPagination(prev => ({
        ...prev,
        comments: data.pagination
      }))
      setError(null)
    } catch (err) {
      console.error('Error fetching flagged comments:', err)
      setError('Failed to load flagged comments')
    } finally {
      setLoading(false)
    }
  }
  
  const handleNextPage = () => {
    const currentPagination = activeTab === 'posts' ? pagination.posts : pagination.comments
    
    if (currentPagination.hasNext) {
      if (activeTab === 'posts') {
        setPagination(prev => ({
          ...prev,
          posts: { ...prev.posts, page: prev.posts.page + 1 }
        }))
      } else {
        setPagination(prev => ({
          ...prev,
          comments: { ...prev.comments, page: prev.comments.page + 1 }
        }))
      }
    }
  }
  
  const handlePrevPage = () => {
    const currentPagination = activeTab === 'posts' ? pagination.posts : pagination.comments
    
    if (currentPagination.page > 1) {
      if (activeTab === 'posts') {
        setPagination(prev => ({
          ...prev,
          posts: { ...prev.posts, page: prev.posts.page - 1 }
        }))
      } else {
        setPagination(prev => ({
          ...prev,
          comments: { ...prev.comments, page: prev.comments.page - 1 }
        }))
      }
    }
  }
  
  const handleApproveContent = async (itemId) => {
    try {
      setLoading(true)
      
      const endpoint = activeTab === 'posts' 
        ? `/api/admin/flagged/posts/${itemId}/approve` 
        : `/api/admin/flagged/comments/${itemId}/approve`
      
      const response = await fetch(endpoint, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to approve ${activeTab === 'posts' ? 'post' : 'comment'}`)
      }
      
      if (activeTab === 'posts') {
        setFlaggedPosts(posts => posts.filter(post => post._id !== itemId))
      } else {
        setFlaggedComments(comments => comments.filter(comment => comment._id !== itemId))
      }
      
      toast({
        title: "Content approved",
        description: `The ${activeTab === 'posts' ? 'post' : 'comment'} has been approved and unflagged.`,
      })
      
    } catch (error) {
      console.error('Error approving content:', error)
      toast({
        title: "Error",
        description: error.message || `Failed to approve ${activeTab === 'posts' ? 'post' : 'comment'}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteContent = async () => {
    if (!selectedItem) return
    
    try {
      setLoading(true)
      
      const endpoint = activeTab === 'posts' 
        ? `/api/admin/posts/${selectedItem._id}` 
        : `/api/admin/comments/${selectedItem._id}`
      
      const response = await fetch(endpoint, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${activeTab === 'posts' ? 'post' : 'comment'}`)
      }
      
      if (activeTab === 'posts') {
        setFlaggedPosts(posts => posts.filter(post => post._id !== selectedItem._id))
      } else {
        setFlaggedComments(comments => comments.filter(comment => comment._id !== selectedItem._id))
      }
      
      toast({
        title: "Content deleted",
        description: `The ${activeTab === 'posts' ? 'post' : 'comment'} has been deleted.`,
      })
      
      setDeleteDialogOpen(false)
      
    } catch (error) {
      console.error('Error deleting content:', error)
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${activeTab === 'posts' ? 'post' : 'comment'}`,
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
          <Flag className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Review Flagged Content</h1>
        </div>
      </div>
      
      <Tabs 
        defaultValue="posts" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts" disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Flagged Posts
          </TabsTrigger>
          <TabsTrigger value="comments" disabled={loading}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Flagged Comments
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Flagged Posts Tab */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'posts' ? 'Flagged Posts' : 'Flagged Comments'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'posts' 
              ? 'Review posts that have been flagged by users'
              : 'Review comments that have been flagged by users'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (activeTab === 'posts' ? flaggedPosts.length === 0 : flaggedComments.length === 0) ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-6 bg-destructive/10 rounded-lg">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => activeTab === 'posts' 
                  ? fetchFlaggedPosts(pagination.posts.page, pagination.posts.limit)
                  : fetchFlaggedComments(pagination.comments.page, pagination.comments.limit)
                }
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (activeTab === 'posts' ? flaggedPosts.length === 0 : flaggedComments.length === 0) ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                No flagged {activeTab === 'posts' ? 'posts' : 'comments'} found
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Flag Reason</TableHead>
                    <TableHead>Flagged By</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === 'posts' ? flaggedPosts : flaggedComments).map(item => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar user={item.author} size="sm" />
                          <span className="font-medium">{item.author?.username || 'Deleted User'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {activeTab === 'posts' ? item.title : item.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.flags && item.flags.length > 0 ? (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                            {item.flags[0].reason}
                          </Badge>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {item.flags && item.flags.length > 0 && item.flags[0].flaggedBy ? (
                          <div className="flex items-center gap-2">
                            <UserAvatar user={item.flags[0].flaggedBy} size="xs" />
                            <span>{item.flags[0].flaggedBy.username}</span>
                          </div>
                        ) : (
                          'Anonymous'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge>
                          {item.flags?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.flags && item.flags.length > 0 ? (
                          format(new Date(item.flags[0].createdAt), 'MMM d, yyyy')
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item)
                              setShowContentDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                            onClick={() => handleApproveContent(item._id)}
                            disabled={loading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              setSelectedItem(item)
                              setDeleteDialogOpen(true)
                            }}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {(activeTab === 'posts' ? flaggedPosts.length > 0 : flaggedComments.length > 0) && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {activeTab === 'posts' ? flaggedPosts.length : flaggedComments.length} of {
                  activeTab === 'posts' 
                    ? pagination.posts.totalItems 
                    : pagination.comments.totalItems
                } {activeTab === 'posts' ? 'posts' : 'comments'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={
                    (activeTab === 'posts' 
                      ? pagination.posts.page === 1 
                      : pagination.comments.page === 1
                    ) || loading
                  }
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={
                    (activeTab === 'posts' 
                      ? !pagination.posts.hasNext 
                      : !pagination.comments.hasNext
                    ) || loading
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'posts' ? 'Post Details' : 'Comment Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {activeTab === 'posts' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedItem.title}</h3>
                    <p className="whitespace-pre-wrap">{selectedItem.content}</p>
                  </div>
                  
                  {selectedItem.url && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">URL:</span>
                      <a 
                        href={selectedItem.url} 
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {selectedItem.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'comments' && (
                <div>
                  <p className="whitespace-pre-wrap">{selectedItem.content}</p>
                  
                  <div className="mt-4 pt-4 border-t">
                    <span className="font-medium">On post:</span>
                    {selectedItem.post ? (
                      <Link 
                        href={`/posts/${selectedItem.post._id}`}
                        className="ml-2 text-primary hover:underline"
                      >
                        {selectedItem.post.title}
                      </Link>
                    ) : (
                      <span className="ml-2 text-muted-foreground">Post not found</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Flag Details</h4>
                
                {selectedItem.flags && selectedItem.flags.length > 0 ? (
                  <div className="space-y-4">
                    {selectedItem.flags.map((flag, index) => (
                      <div key={index} className="bg-muted/30 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <UserAvatar user={flag.flaggedBy} size="sm" />
                            <div>
                              <p className="font-medium">{flag.flaggedBy?.username || 'Anonymous'}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(flag.createdAt), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {flag.reason}
                          </Badge>
                        </div>
                        
                        {flag.additionalInfo && (
                          <div className="mt-2 pl-10">
                            <p className="text-sm whitespace-pre-wrap">{flag.additionalInfo}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No flag details available</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <div className="flex gap-2 justify-end w-full">
              <Button variant="outline" onClick={() => setShowContentDialog(false)}>
                Close
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setShowContentDialog(false)
                  handleApproveContent(selectedItem._id)
                }}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve Content
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowContentDialog(false)
                  setDeleteDialogOpen(true)
                }}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Content
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete {activeTab === 'posts' ? 'Post' : 'Comment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {activeTab === 'posts' ? 'post' : 'comment'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContent}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 