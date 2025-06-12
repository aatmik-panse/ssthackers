"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VoteButtons({ 
  type, // 'post' or 'comment'
  itemId, 
  votes, 
  userVote, 
  onVoteUpdate,
  disabled = false,
  size = 'default', // 'default' or 'sm'
  redirectToSignIn = false,
  vertical = true // 'true' for vertical layout, 'false' for horizontal
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (voteType) => {
    if (disabled && redirectToSignIn) {
      router.push('/auth/signin?callbackUrl=/')
      return
    }
    
    if (!session || disabled || isVoting) return

    setIsVoting(true)
    
    try {
      const endpoint = type === 'post' 
        ? `/api/posts/${itemId}/vote`
        : `/api/comments/${itemId}/vote`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: userVote === voteType ? 'remove' : voteType 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      const data = await response.json()
      onVoteUpdate(data.votes, data.userVote)
    } catch (error) {
      console.error('Error voting:', error)
      // Show error toast
    } finally {
      setIsVoting(false)
    }
  }

  const iconSize = size === 'sm' ? 14 : 16
  const buttonSize = size === 'sm' ? 'icon' : 'icon'

  return (
    <div className={cn(
      "flex items-center",
      vertical ? "flex-col space-y-1" : "flex-row space-x-1"
    )}>
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => handleVote('upvote')}
        disabled={disabled && !redirectToSignIn || isVoting}
        className={cn(
          "vote-button h-6 w-6 p-0",
          userVote === 'upvote' && "voted text-orange-500 hover:text-orange-600"
        )}
        title={disabled ? "Sign in to vote" : "Upvote"}
      >
        <ChevronUp size={iconSize} />
      </Button>

      <span className={cn(
        "text-xs font-medium text-center",
        vertical ? "min-w-[20px]" : "min-w-[16px] px-1",
        votes > 0 && "text-orange-600",
        votes < 0 && "text-blue-600"
      )}>
        {votes}
      </span>

      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => handleVote('downvote')}
        disabled={disabled && !redirectToSignIn || isVoting}
        className={cn(
          "vote-button h-6 w-6 p-0",
          userVote === 'downvote' && "voted text-blue-500 hover:text-blue-600"
        )}
        title={disabled ? "Sign in to vote" : "Downvote"}
      >
        <ChevronDown size={iconSize} />
      </Button>
    </div>
  )
} 