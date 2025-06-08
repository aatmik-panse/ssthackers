import { Card, CardContent } from '@/components/ui/card'

export function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-3 animate-pulse">
              {/* Vote buttons skeleton */}
              <div className="flex flex-col items-center space-y-1 pt-1">
                <div className="bg-muted rounded w-4 h-3"></div>
                <div className="bg-muted rounded w-6 h-6"></div>
                <div className="bg-muted rounded w-4 h-3"></div>
                <div className="bg-muted rounded w-6 h-6"></div>
              </div>

              {/* Content skeleton */}
              <div className="flex-1 space-y-2">
                {/* Title */}
                <div className="bg-muted rounded h-5 w-3/4"></div>
                
                {/* Body preview */}
                <div className="space-y-1">
                  <div className="bg-muted rounded h-4 w-full"></div>
                  <div className="bg-muted rounded h-4 w-2/3"></div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="bg-muted rounded h-3 w-16"></div>
                  <div className="bg-muted rounded h-3 w-12"></div>
                  <div className="bg-muted rounded h-3 w-20"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 