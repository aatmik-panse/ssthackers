"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Users, MessageSquare, TrendingUp, ExternalLink, BookOpen, HelpCircle, UserPlus } from 'lucide-react'

export function Sidebar() {
  const { data: session } = useSession()
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [leaderboardRes, statsRes] = await Promise.all([
          fetch('/api/leaderboard?limit=10'),
          fetch('/api/stats')
        ])

        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json()
          setLeaderboard(leaderboardData.users)
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching sidebar data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSidebarData()
  }, [])

  return (
    <div className="space-y-6 lg:space-y-8 max-w-full">
      {/* Community Stats */}
      <Card className="overflow-hidden border-2">
        <CardHeader className="pb-4 bg-primary/5">
          <CardTitle className="text-xl flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 px-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted rounded h-6 animate-pulse"></div>
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors">
                <span className="text-md font-medium flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary/80" />
                  Total Members
                </span>
                <span className="font-semibold text-lg">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors">
                <span className="text-md font-medium flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary/80" />
                  Posts Today
                </span>
                <span className="font-semibold text-lg">{stats.postsToday}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors">
                <span className="text-md font-medium flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary/80" />
                  Comments Today
                </span>
                <span className="font-semibold text-lg">{stats.commentsToday}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load stats</p>
          )}
        </CardContent>
      </Card>

      {/* Aura Leaderboard */}
      <Card className="overflow-hidden border-2">
        <CardHeader className="pb-4 bg-yellow-500/10">
          <CardTitle className="text-xl flex items-center gap-3">
            <Crown className="h-6 w-6 text-yellow-500" />
            Aura Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 px-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-muted rounded w-10 h-6 animate-pulse"></div>
                  <div className="bg-muted rounded w-32 h-6 animate-pulse flex-1"></div>
                  <div className="bg-muted rounded w-16 h-6 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div key={user._id} className="flex items-center gap-4 p-3 rounded-md hover:bg-primary/5 transition-colors">
                  <span className={`text-base font-mono w-10 ${
                    index === 0 ? 'text-yellow-500 font-bold' :
                    index === 1 ? 'text-gray-400 font-bold' :
                    index === 2 ? 'text-amber-600 font-bold' :
                    'text-muted-foreground'
                  }`}>
                    {index + 1}.
                  </span>
                  <Link 
                    href={`/user/${user.username}`}
                    className="flex-1 text-base hover:text-primary transition-colors truncate"
                  >
                    {user.username}
                  </Link>
                  <span className="text-base aura-points font-semibold">
                    {user.auraPoints}
                  </span>
                </div>
              ))}
              <Button asChild variant="outline" size="default" className="w-full mt-6">
                <Link href="/leaderboard" className="flex items-center justify-center gap-2">
                  <span>View Full Leaderboard</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="overflow-hidden border-2">
        <CardHeader className="pb-4 bg-primary/5">
          <CardTitle className="text-xl flex items-center gap-3">
            <ExternalLink className="h-6 w-6 text-primary" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 px-4 space-y-3">
          <Button asChild variant="ghost" size="default" className="w-full justify-start h-auto py-3 px-4">
            <Link href="/guidelines" className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary/80" />
              <span className="font-medium">Community Guidelines</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="default" className="w-full justify-start h-auto py-3 px-4">
            <Link href="/about" className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary/80" />
              <span className="font-medium">About SST Hackers</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="default" className="w-full justify-start h-auto py-3 px-4">
            <Link href="/contact" className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-primary/80" />
              <span className="font-medium">Contact & Support</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Join CTA for non-authenticated users */}
      {!session && (
        <Card className="overflow-hidden border-2">
          <CardHeader className="pb-4 bg-primary/5">
            <CardTitle className="text-xl flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-primary" />
              Join the Community
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p>
              Unlock your potential with SST Hackers - where ideas thrive, connections form, and innovation happens daily.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/signin?mode=signup">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 