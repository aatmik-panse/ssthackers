"use client"

import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export function AdminCreatedPosts() {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-amber-600 dark:text-amber-400">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                Post Attribution Update
              </h3>
              <p className="mt-2 text-amber-700 dark:text-amber-400">
                Posts created by admins for users are now directly attributed to the users without any indication of admin creation. 
                This provides a more seamless experience for both the user and the community.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 