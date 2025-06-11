import { Metadata } from 'next'
import { Crown } from 'lucide-react'
import { LeaderboardClient } from '@/components/leaderboard-client'

export const metadata = {
  title: 'Aura Leaderboard | SST Hackers',
  description: 'See the top contributors in the SST Hackers community ranked by Aura points.',
}

export default function LeaderboardPage() {
  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Crown className="h-8 w-8 text-yellow-500" />
        Aura Leaderboard
      </h1>
      
      <LeaderboardClient />
    </div>
  )
} 