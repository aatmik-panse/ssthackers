"use client"

import { Suspense, useState, lazy, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PostListSkeleton } from '@/components/post-list-skeleton'
import { LoadingScreen } from '@/components/loading-screen'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Flame, Clock, TrendingUp, Plus } from 'lucide-react'

// Lazy load components
const PostList = lazy(() => import('@/components/post-list').then(mod => ({ default: mod.PostList })))
const Sidebar = lazy(() => import('@/components/sidebar').then(mod => ({ default: mod.Sidebar })))

// Sidebar skeleton
const SidebarSkeleton = () => (
  <div className="space-y-4">
    <div className="h-64 bg-muted/40 rounded-lg animate-pulse"></div>
    <div className="h-48 bg-muted/40 rounded-lg animate-pulse"></div>
  </div>
)

export default function HomePage() {
  const [feed, setFeed] = useState('hot')
  const { data: session } = useSession()
  const router = useRouter()
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  
  useEffect(() => {
    // Set a flag in sessionStorage to track if this is the first load
    const hasLoaded = sessionStorage.getItem('hasLoadedBefore')
    if (hasLoaded) {
      setIsFirstLoad(false)
    } else {
      sessionStorage.setItem('hasLoadedBefore', 'true')
      // Allow some time for the loading screen on first visit
      setTimeout(() => setIsFirstLoad(false), 2000)
    }
  }, [])
  
  const handleSubmitClick = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/submit')
    } else {
      router.push('/submit')
    }
  }
  
  return (
    <>
      {isFirstLoad && <LoadingScreen />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Mark as Beasties container for critical CSS */}
        <div className="lg:col-span-2" data-beasties-container>
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between bg-primary/5 p-6 rounded-lg border-2 border-primary/10">
            <div>
              <h1 className="text-3xl font-bold mb-2">SST Hackers</h1>
              <p className="text-muted-foreground text-lg">
                Ignite your ideas with the brightest minds at SST
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center mt-4 md:mt-0">
              {/* <Button 
                onClick={handleSubmitClick} 
                className="bg-primary hover:bg-primary/90 transition-all duration-200 w-full md:w-auto"
              >
                <Plus size={16} className="mr-1" />
                Share Your Idea
              </Button> */}
              
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
          <Suspense fallback={<SidebarSkeleton />}>
            <Sidebar />
          </Suspense>
        </div>
      </div>
    </>
  )
}
