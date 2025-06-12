"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="overflow-hidden border-2">
          <div className="flex">
            {/* Vote sidebar skeleton */}
            <div className="w-16 bg-muted/20 flex flex-col items-center py-4 gap-1">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            
            {/* Content skeleton with staggered animation */}
            <CardContent className="p-4 w-full space-y-2">
              <Skeleton 
                className="h-5 w-3/4 mb-1" 
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1.5s'
                }} 
              />
              <Skeleton 
                className="h-5 w-1/2" 
                style={{ 
                  animationDelay: `${i * 100 + 100}ms`,
                  animationDuration: '1.5s'
                }} 
              />
              
              <div className="flex items-center space-x-3 mt-4">
                <Skeleton 
                  className="h-5 w-5 rounded-full" 
                  style={{ 
                    animationDelay: `${i * 100 + 200}ms`,
                    animationDuration: '1.5s'
                  }} 
                />
                <Skeleton 
                  className="h-3 w-24" 
                  style={{ 
                    animationDelay: `${i * 100 + 300}ms`,
                    animationDuration: '1.5s'
                  }} 
                />
                <Skeleton 
                  className="h-3 w-16" 
                  style={{ 
                    animationDelay: `${i * 100 + 400}ms`,
                    animationDuration: '1.5s'
                  }} 
                />
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
} 