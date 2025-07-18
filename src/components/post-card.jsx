"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VoteButtons } from './vote-buttons'
import { UserAvatar } from './user-avatar'
import { DeletePostDialog } from './delete-post-dialog'
import { formatTimeAgo, extractDomain } from '@/lib/utils'
import { 
  MessageCircle, 
  ExternalLink, 
  Flag, 
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Mail,
  Share2,
  ArrowRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import FlagContentDialog from './flag-content-dialog'

export function PostCard({ post, rank, showBody = false, onPostDeleted }) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [votes, setVotes] = useState(post.votes)
  const [userVote, setUserVote] = useState(post.userVote)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)

  const hasAuthor = post.author && post.author._id
  const isAuthor = hasAuthor && session?.user?.id === post.author._id
  const canEdit = isAuthor || session?.user?.isAdmin

  const handleVoteUpdate = (newVotes, newUserVote) => {
    console.log('Post card vote update:', newVotes, newUserVote);
    setVotes(newVotes);
    setUserVote(newUserVote);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }
  
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
  }
  
  const handleFlagSuccess = (data) => {
    toast({
      title: "Post reported",
      description: "The post has been flagged for review by moderators.",
    })
  }
  
  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/posts/${post.slug || post._id}`
      await navigator.clipboard.writeText(postUrl)
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard",
      })
    } catch (error) {
      // If clipboard fails, show the URL in a toast
      toast({
        title: "Share link",
        description: `${window.location.origin}/posts/${post.slug || post._id}`,
        duration: 5000,
      })
    }
  }
  
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete post')
      }
      
      if (onPostDeleted) {
        onPostDeleted(post._id)
      }
      
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      })
      
    } catch (error) {
      console.error('Error deleting post:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }
  
  const domain = post.url ? extractDomain(post.url) : null
  
  return (
    <>
      <Card className="post-card overflow-hidden border-2 hover:border-primary/20 transition-all">
        <CardContent className="p-0">
          <div className="flex">
            {/* Rank & Vote Buttons */}
            <div className="flex flex-col items-center space-y-1 p-4 bg-primary/5">
              {rank && (
                <span className="text-sm font-mono font-semibold mb-1">
                  {rank}
                </span>
              )}
              <VoteButtons
                type="post"
                itemId={post.slug || post._id}
                votes={votes}
                userVote={userVote}
                onVoteUpdate={handleVoteUpdate}
                disabled={!session}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 p-4">
              
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="text-lg font-semibold leading-tight mb-1">
                    {post.url ? (
                      <a 
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {post.title}
                        <ExternalLink className="inline ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      <Link 
                        href={`/posts/${post.slug || post._id}`}
                        className="hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {post.title}
                        <ArrowRight className="inline h-3 w-3 opacity-60" />
                      </Link>
                    )}
                  </h3>

                  {/* Domain */}
                  {domain && (
                    <a 
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 inline-flex items-center gap-1"
                    >
                      ({domain})
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}

                  {/* Body preview for text posts */}
                  {post.body && !showBody && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.body.substring(0, 200)}
                      {post.body.length > 200 && '...'}
                    </p>
                  )}

                  {/* Full body for post detail page */}
                  {post.body && showBody && (
                    <div className="prose prose-sm max-w-none mb-4">
                      <p className="whitespace-pre-wrap">{post.body}</p>
                    </div>
                  )}
                </div>

                {/* Actions menu */}
                <div className="flex items-center gap-3">
                  {canEdit && (
                    <>
                      {isAuthor && (
                        <Link href={`/posts/${post.slug || post._id}/edit`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-8 px-2"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-8 px-2 text-destructive"
                        onClick={handleDeleteClick}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                  
                  {session && !isAuthor && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-8 px-2"
                      onClick={() => setFlagDialogOpen(true)}
                    >
                      <Flag className="h-3.5 w-3.5 mr-1" />
                      Report
                    </Button>
                  )}
                </div>

              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground mt-3 pt-3 border-t">
                {hasAuthor ? (
                  <span className="flex items-center gap-1.5">
                    <UserAvatar user={post.author} size="xs" />
                    <Link 
                      href={`/user/${post.author.username}`}
                      className="hover:text-foreground transition-colors font-medium"
                    >
                      {post.author.username}
                    </Link>
                  </span>
                ) : post.targetUserEmail ? (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-600 font-medium">
                      {post.targetUserEmail} (waiting for signup)
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>Unknown user</span>
                  </span>
                )}
                <span>{formatTimeAgo(post.createdAt)}</span>
                <Link 
                  href={`/posts/${post.slug || post._id}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span className="font-medium">{post.commentCount} comments</span>
                </Link>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  title="Share post"
                >
                  <Share2 className="h-3 w-3" />
                  <span className="font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Post Dialog */}
      <DeletePostDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeletePost}
        postId={post._id}
        postTitle={post.title}
        isDeleting={isDeleting}
      />
      
      {/* Flag Post Dialog */}
      <FlagContentDialog
        open={flagDialogOpen}
        onOpenChange={setFlagDialogOpen}
        contentId={post._id}
        contentType="post"
        onSuccess={handleFlagSuccess}
      />
    </>
  )
} 
