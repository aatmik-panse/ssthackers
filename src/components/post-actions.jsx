"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Share2, 
  Flag
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import FlagContentDialog from './flag-content-dialog'

export default function PostActions({ post, onVote, showCommentButton = true }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  
  const handleVote = async (type) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (onVote) {
      onVote(type)
    }
  }
  
  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/posts/${post._id}`
      await navigator.clipboard.writeText(postUrl)
      
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleVote('upvote')}
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium w-8 text-center">{post.votes}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleVote('downvote')}
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      </div>
      
      {showCommentButton && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/posts/${post._id}`)}
          className="text-muted-foreground hover:text-primary"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{post.commentCount}</span>
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleShare}
        className="text-muted-foreground hover:text-primary"
      >
        <Share2 className="h-4 w-4 mr-1" />
        <span>Share</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setFlagDialogOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Flag className="h-4 w-4 mr-1" />
        <span>Report</span>
      </Button>
      
      <FlagContentDialog
        open={flagDialogOpen}
        onOpenChange={setFlagDialogOpen}
        contentId={post._id}
        contentType="post"
      />
    </div>
  )
} 