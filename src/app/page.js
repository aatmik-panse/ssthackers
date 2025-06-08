import { Suspense } from 'react'
import { PostList } from '@/components/post-list'
import { Sidebar } from '@/components/sidebar'
import { PostListSkeleton } from '@/components/post-list-skeleton'

export default function HomePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Hot Posts</h1>
          <p className="text-muted-foreground">
            Latest trending discussions from the SST community
          </p>
        </div>
        
        <Suspense fallback={<PostListSkeleton />}>
          <PostList feed="hot" />
        </Suspense>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Sidebar />
      </div>
    </div>
  )
}
