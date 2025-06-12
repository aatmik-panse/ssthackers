"use client"

import { useEffect, useState } from 'react'
import { Crown, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from './user-avatar'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export function LeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalUsers: 0,
    totalPages: 0,
    hasNext: false
  })

  useEffect(() => {
    fetchLeaderboard(pagination.page, pagination.limit)
  }, [pagination.page, pagination.limit])

  const fetchLeaderboard = async (page, limit) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/leaderboard?page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data')
      }
      
      const data = await response.json()
      setLeaderboard(data.users)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Failed to load the leaderboard. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleNextPage = () => {
    if (pagination.hasNext) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const renderSkeletons = () => {
    return Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-5 border-b last:border-0">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    ))
  }

  const getPositionClass = (index) => {
    return index === 0 
      ? 'text-yellow-500 bg-yellow-500/10' 
      : index === 1 
      ? 'text-gray-400 bg-gray-400/10' 
      : index === 2 
      ? 'text-amber-600 bg-amber-600/10'
      : 'text-muted-foreground bg-muted/20'
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-2">
        <CardHeader className="pb-4 bg-yellow-500/10">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Crown className="h-6 w-6 text-yellow-500" />
            Top Community Contributors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div>{renderSkeletons()}</div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <p className="text-lg font-medium text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => fetchLeaderboard(pagination.page, pagination.limit)}
              >
                Try Again
              </Button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No users with Aura points found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {leaderboard.map((user, index) => {
                const actualRank = (pagination.page - 1) * pagination.limit + index + 1
                return (
                  <div key={user._id} className="flex items-center gap-4 p-5 hover:bg-primary/5 transition-colors">
                    <div className={`w-12 h-8 flex items-center justify-center rounded-lg font-mono font-bold ${getPositionClass(actualRank - 1)}`}>
                      {actualRank}
                    </div>
                    <UserAvatar user={user} size="md" />
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/user/${user.username}`}
                        className="font-medium hover:text-primary transition-colors block truncate"
                      >
                        {user.username}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="aura-points text-lg font-bold">
                      {user.auraPoints.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination controls */}
      {!loading && !error && leaderboard.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalUsers)}</span> of{' '}
            <span className="font-medium">{pagination.totalUsers}</span> users
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrevPage}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20 text-blue-800 dark:text-blue-300">
        <h3 className="text-lg font-semibold mb-2">How Aura Points Work</h3>
        <p className="mb-3">Aura points are earned through positive contributions to the SST Hackers community:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Post upvotes: +5 Aura to the author</li>
          <li>Posting gives the author +3 Aura points</li>
          <li>Comment upvotes: +1 Aura to the author</li>
          <li>Other contributions as determined by community guidelines</li>
        </ul>
      </div>
    </div>
  )
} 