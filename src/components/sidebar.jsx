"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Users, MessageSquare, TrendingUp } from 'lucide-react'

export function Sidebar() {
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
    <div className="space-y-6">
      {/* Community Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted rounded h-4 animate-pulse"></div>
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Members
                </span>
                <span className="font-medium">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Posts Today
                </span>
                <span className="font-medium">{stats.postsToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments Today
                </span>
                <span className="font-medium">{stats.commentsToday}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load stats</p>
          )}
        </CardContent>
      </Card>

      {/* Aura Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Aura Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-muted rounded w-6 h-4 animate-pulse"></div>
                  <div className="bg-muted rounded w-20 h-4 animate-pulse flex-1"></div>
                  <div className="bg-muted rounded w-12 h-4 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div key={user._id} className="flex items-center gap-3">
                  <span className={`text-sm font-mono w-6 ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-muted-foreground'
                  }`}>
                    {index + 1}.
                  </span>
                  <Link 
                    href={`/user/${user.username}`}
                    className="flex-1 text-sm hover:text-primary transition-colors truncate"
                  >
                    {user.username}
                  </Link>
                  <span className="text-xs aura-points">
                    {user.auraPoints}
                  </span>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full mt-4">
                <Link href="/leaderboard">
                  View Full Leaderboard
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/guidelines">Community Guidelines</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/about">About SST Hackers</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/contact">Contact & Support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 