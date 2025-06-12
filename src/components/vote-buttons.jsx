"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

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
  const { toast } = useToast()
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to vote')
      }

      const data = await response.json()
      console.log('Vote API response:', data);
      onVoteUpdate(data.votes, data.userVote)
      console.log('Updated votes:', data.votes, 'userVote:', data.userVote);
      
      // Show success message if vote was recovered from duplicate error
      if (data.message === 'Vote already exists') {
        toast({
          title: "Vote restored",
          description: "Your existing vote has been restored.",
        })
      } else if (data.message === 'Vote updated') {
        console.log('Vote updated successfully:', data);
      }
    } catch (error) {
      console.error('Error voting:', error)
      
      // Show user-friendly error message
      toast({
        title: "Voting failed",
        description: error.message || "Please try again in a moment.",
        variant: "destructive",
      })
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
          userVote === 'upvote' && "voted text-orange-500 hover:text-orange-600",
          isVoting && "opacity-50 cursor-not-allowed"
        )}
        title={disabled ? "Sign in to vote" : isVoting ? "Voting..." : "Upvote"}
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
          userVote === 'downvote' && "voted text-blue-500 hover:text-blue-600",
          isVoting && "opacity-50 cursor-not-allowed"
        )}
        title={disabled ? "Sign in to vote" : isVoting ? "Voting..." : "Downvote"}
      >
        <ChevronDown size={iconSize} />
      </Button>
    </div>
  )
} 