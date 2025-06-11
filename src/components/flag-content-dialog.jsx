"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Flag, AlertTriangle, Loader2 } from 'lucide-react'

const FlagContentDialog = ({ 
  open, 
  onOpenChange, 
  contentId, 
  contentType = 'post', // 'post' or 'comment'
  onSuccess 
}) => {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [reason, setReason] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for flagging this content",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      
      const endpoint = contentType === 'post' 
        ? '/api/posts/flag' 
        : '/api/comments/flag'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [contentType === 'post' ? 'postId' : 'commentId']: contentId,
          reason,
          additionalInfo
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to flag ${contentType}`)
      }
      
      toast({
        title: "Content Flagged",
        description: data.message || `The ${contentType} has been flagged for review.`,
      })
      
      // Reset form and close dialog
      setReason('')
      setAdditionalInfo('')
      onOpenChange(false)
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data)
      }
      
    } catch (error) {
      console.error(`Error flagging ${contentType}:`, error)
      toast({
        title: "Error",
        description: error.message || `An error occurred while flagging this ${contentType}.`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report {contentType === 'post' ? 'Post' : 'Comment'}
          </DialogTitle>
          <DialogDescription>
            Report this {contentType} for violating our community guidelines.
            Flagged content will be reviewed by moderators.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="flag-reason">
              Reason for Reporting <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={reason} 
              onValueChange={setReason}
              required
            >
              <SelectTrigger id="flag-reason" className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="offensive">Offensive Content</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="illegal">Illegal Content</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additional-info">
              Additional Information
            </Label>
            <Textarea
              id="additional-info"
              placeholder="Please provide any additional details that might help our moderators understand the issue."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
            <div className="flex gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                Misuse of the reporting system may result in actions against your account.
                Please only report content that violates our guidelines.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default FlagContentDialog 