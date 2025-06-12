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
import { Flame, Clock, TrendingUp, Plus, Menu } from 'lucide-react'

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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  
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
      
      <div className="space-y-6">
        {/* Hero Section - Improved mobile layout */}
        <div className="bg-primary/5 p-4 sm:p-6 rounded-lg border-2 border-primary/10">
          <div className="flex flex-col space-y-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">SST Hackers</h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Ignite your ideas with the brightest minds at SST
              </p>
            </div>
            
            {/* Mobile-optimized controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-col xs:flex-row gap-3 items-stretch xs:items-center">
                <Select value={feed} onValueChange={setFeed}>
                  <SelectTrigger className="w-full xs:w-[180px] border-2">
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
                
                {/* Mobile sidebar toggle */}
                <Button
                  variant="outline"
                  className="lg:hidden border-2"
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Community
                </Button>
              </div>
              
              {/* Submit button - Only show on mobile */}
              <Button 
                onClick={handleSubmitClick} 
                className="md:hidden bg-primary hover:bg-primary/90 transition-all duration-200 w-full xs:w-auto"
              >
                <Plus size={16} className="mr-2" />
                Share Your Idea
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar - Shows/hides based on toggle */}
        {showMobileSidebar && (
          <div className="lg:hidden">
            <Suspense fallback={<SidebarSkeleton />}>
              <Sidebar />
            </Suspense>
          </div>
        )}

        {/* Main Content Grid - Improved responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - Takes full width on mobile, 3/4 on desktop */}
          <div className="lg:col-span-3" data-beasties-container>
            <Suspense fallback={<PostListSkeleton />}>
              <PostList feed={feed} />
            </Suspense>
          </div>

          {/* Desktop Sidebar - Only visible on large screens */}
          <div className="hidden lg:block lg:col-span-1">
            <Suspense fallback={<SidebarSkeleton />}>
              <Sidebar />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
