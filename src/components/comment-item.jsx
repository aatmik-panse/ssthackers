"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { VoteButtons } from './vote-buttons'
import { formatTimeAgo } from '@/lib/utils'
import {
  MessageCircle,
  Edit,
  Trash2,
  Flag,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Reply
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import FlagContentDialog from './flag-content-dialog'

export function CommentItem({ 
  comment, 
  depth = 0,
  postId,
  onReply,
  onEdit,
  onDelete
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(true)
  const [votes, setVotes] = useState(comment.votes)
  const [userVote, setUserVote] = useState(comment.userVote)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  
  const isAuthor = session?.user?.id === comment.author._id
  const isAdmin = session?.user?.isAdmin
  const canEdit = isAuthor && !comment.isDeleted
  const canDelete = (isAuthor || isAdmin) && !comment.isDeleted
  const canModerate = isAdmin && !comment.isDeleted
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }
  
  const handleVoteUpdate = (newVotes, newUserVote) => {
    console.log('Comment vote update:', newVotes, newUserVote);
    setVotes(newVotes);
    setUserVote(newUserVote);
  };
  
  const handleReply = () => {
    if (onReply) onReply(comment._id)
  }
  
  const handleEdit = () => {
    if (onEdit) onEdit(comment)
  }
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }
      
      if (onDelete) onDelete(comment._id)
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      })
    }
  }
  
  // This is now handled by our FlagContentDialog component
  const handleFlagSuccess = (data) => {
    toast({
      title: "Comment reported",
      description: "The comment has been flagged for review by moderators.",
    })
  }
  
  const handleReplySubmit = async (e) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (!replyContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: replyContent,
          parentId: comment._id,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add comment')
      }
      
      const newComment = await response.json()
      
      // Reset state
      setReplyContent('')
      setIsReplying(false)
      
      // Call parent handler if provided
      if (onReply) {
        onReply(comment._id, newComment)
      }
      
      toast({
        title: "Reply added",
        description: "Your reply has been added successfully",
      })
      
    } catch (error) {
      console.error('Error adding reply:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add reply",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleVote = async (type) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (onReply) {
      onReply(comment._id, type)
    }
  }
  
  // Determine indent based on depth - use a fixed indentation for better readability
  const indentClass = depth > 0 ? 'ml-4' : ''
  
  // Display deleted comment placeholder
  if (comment.isDeleted) {
    return (
      <div className={`py-2 ${indentClass}`}>
        <div className="text-sm text-muted-foreground italic">
          [deleted]
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                depth={depth + 1}
                postId={postId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className={`py-2 ${indentClass}`}>
      <div className="flex gap-2">
        {/* Collapse toggle button */}
        {(comment.replies?.length > 0 || depth > 0) && (
          <button 
            onClick={toggleExpanded}
            className="flex-none mt-1"
            aria-label={isExpanded ? "Collapse thread" : "Expand thread"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
        
        {/* Vote buttons */}
        <div className="flex-none">
          <VoteButtons
            type="comment"
            itemId={comment._id}
            votes={votes}
            userVote={userVote}
            onVoteUpdate={handleVoteUpdate}
            disabled={!session}
            vertical={false}
          />
        </div>
        
        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* Comment header */}
          <div className="flex items-center gap-1.5 mb-1">
            <UserAvatar user={comment.author} size="xs" />
            <Link 
              href={`/user/${comment.author.username}`}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {comment.author.name || comment.author.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          
          {/* Comment body */}
          {isExpanded && (
            <div className="prose prose-sm max-w-none mb-2">
              <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
            </div>
          )}
          
          {/* Comment actions */}
          {isExpanded && session && (
            <div className="flex items-center gap-3 mt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              
              {canEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={handleEdit}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
              
              {canDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
              
              {!isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setFlagDialogOpen(true)}>
                      <Flag className="mr-2 h-3 w-3" />
                      <span className="text-xs">Report</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Nested replies */}
      {isExpanded && comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2 border-l-2 border-muted pl-4">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              postId={postId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
      
      {isReplying && (
        <Card className="p-3 mt-2 ml-10">
          <form onSubmit={handleReplySubmit}>
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[100px] mb-2"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsReplying(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Reply'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      <FlagContentDialog
        open={flagDialogOpen}
        onOpenChange={setFlagDialogOpen}
        contentId={comment._id}
        contentType="comment"
        onSuccess={handleFlagSuccess}
      />
    </div>
  )
} 