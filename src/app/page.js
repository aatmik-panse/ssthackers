"use client"

import { Suspense, useState } from 'react'
import { PostList } from '@/components/post-list'
import { Sidebar } from '@/components/sidebar'
import { PostListSkeleton } from '@/components/post-list-skeleton'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Flame, Clock, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const [feed, setFeed] = useState('hot')
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between bg-primary/5 p-6 rounded-lg border-2 border-primary/10">
          <div>
            <h1 className="text-3xl font-bold mb-2">SST Hackers</h1>
            <p className="text-muted-foreground text-lg">
              Discussions from the SST community
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Select value={feed} onValueChange={setFeed}>
              <SelectTrigger className="w-[180px] border-2">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot" className="flex items-center">
                  <div className="flex items-center">
                    <Flame className="mr-2 h-4 w-4 text-primary" />
                    <span>Hot</span>
                  </div>
                </SelectItem>
                <SelectItem value="new" className="flex items-center">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-primary" />
                    <span>New</span>
                  </div>
                </SelectItem>
                <SelectItem value="top" className="flex items-center">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                    <span>Top</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Suspense fallback={<PostListSkeleton />}>
          <PostList feed={feed} />
        </Suspense>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Sidebar />
      </div>
    </div>
  )
}
