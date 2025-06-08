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
  ChevronRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function CommentItem({ 
  comment, 
  depth = 0,
  postId,
  onReply,
  onEdit,
  onDelete
}) {
  const { data: session } = useSession()
  const [isExpanded, setIsExpanded] = useState(true)
  const [votes, setVotes] = useState(comment.votes)
  const [userVote, setUserVote] = useState(comment.userVote)
  
  const isAuthor = session?.user?.id === comment.author._id
  const isAdmin = session?.user?.isAdmin
  const canEdit = isAuthor && !comment.isDeleted
  const canDelete = (isAuthor || isAdmin) && !comment.isDeleted
  const canModerate = isAdmin && !comment.isDeleted
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }
  
  const handleVoteUpdate = (newVotes, newUserVote) => {
    setVotes(newVotes)
    setUserVote(newUserVote)
  }
  
  const handleReply = () => {
    if (onReply) onReply(comment._id)
  }
  
  const handleEdit = () => {
    if (onEdit) onEdit(comment)
  }
  
  const handleDelete = async () => {
    if (onDelete) onDelete(comment._id)
  }
  
  const handleFlag = async () => {
    if (!session) return
    
    try {
      await fetch(`/api/comments/${comment._id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'inappropriate' })
      })
    } catch (error) {
      console.error('Error flagging comment:', error)
    }
  }
  
  // Determine indent based on depth
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : ''
  
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
                onClick={handleReply}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
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
                    <DropdownMenuItem onClick={handleFlag}>
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
      {isExpanded && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2 border-l-2 border-muted">
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