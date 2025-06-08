"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VoteButtons } from './vote-buttons'
import { formatTimeAgo, extractDomain } from '@/lib/utils'
import { 
  MessageCircle, 
  ExternalLink, 
  Flag, 
  MoreHorizontal,
  Edit,
  Trash2,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function PostCard({ post, rank, showBody = false }) {
  const { data: session } = useSession()
  const [votes, setVotes] = useState(post.votes)
  const [userVote, setUserVote] = useState(post.userVote)

  const isAuthor = session?.user?.id === post.author._id
  const canEdit = isAuthor || session?.user?.isAdmin

  const handleVoteUpdate = (newVotes, newUserVote) => {
    setVotes(newVotes)
    setUserVote(newUserVote)
  }

  const handleFlag = async () => {
    if (!session) return
    
    try {
      const response = await fetch(`/api/posts/${post._id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'inappropriate' })
      })
      
      if (response.ok) {
        // Show success toast
      }
    } catch (error) {
      console.error('Error flagging post:', error)
    }
  }

  const domain = post.url ? extractDomain(post.url) : null

  return (
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
              itemId={post._id}
              votes={votes}
              userVote={userVote}
              onVoteUpdate={handleVoteUpdate}
              disabled={!session}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 p-4">
            <div className="flex items-start justify-between gap-2">
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
                      href={`/post/${post._id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  )}
                </h3>

                {/* Domain */}
                {domain && (
                  <p className="text-xs text-muted-foreground mb-2">
                    ({domain})
                  </p>
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
              {session && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`/post/${post._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    {!isAuthor && (
                      <DropdownMenuItem onClick={handleFlag}>
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground mt-3 pt-3 border-t">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <Link 
                  href={`/user/${post.author.username}`}
                  className="hover:text-foreground transition-colors font-medium"
                >
                  {post.author.username}
                </Link>
              </span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              <Link 
                href={`/post/${post._id}`}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="font-medium">{post.commentCount} comments</span>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 