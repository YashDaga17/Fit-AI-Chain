"use client"

import * as React from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal } from "lucide-react"

const mockLeaderboard = [
  { rank: 1, username: "fit_guru", level: 12, totalXp: 12000 },
  { rank: 2, username: "runner_jane", level: 5, totalXp: 5000 },
  { rank: 3, username: "dev_user", level: 2, totalXp: 1500 },
]

export default function FriendLeaderboardPage() {
  const { username } = useAuth()
  const [leaderboard, setLeaderboard] = React.useState(mockLeaderboard)

  React.useEffect(() => {
    if (username) {
      fetchFriendLeaderboard()
    }
  }, [username])

  const fetchFriendLeaderboard = async () => {
    try {
      const res = await fetch(`/api/social/friends?username=${username}`)
      const data = await res.json()
      if (data.friends && data.friends.length > 0) {
        // Mocking enrichment with XP for display
        const enriched = data.friends.map((f: any, index: number) => ({
          rank: index + 1,
          username: f.username,
          level: f.level || 1,
          totalXp: (f.level || 1) * 1000,
        }))
        setLeaderboard(enriched)
      }
    } catch (e) {
      console.log("Using mock leaderboard")
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6">Friend Leaderboard</h1>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div key={entry.username} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 font-bold flex items-center justify-center rounded-full bg-white shadow-sm border">
                    {entry.rank === 1 ? (
                      <Medal className="w-5 h-5 text-yellow-500" />
                    ) : entry.rank === 2 ? (
                      <Medal className="w-5 h-5 text-slate-400" />
                    ) : entry.rank === 3 ? (
                      <Medal className="w-5 h-5 text-amber-600" />
                    ) : (
                      entry.rank
                    )}
                  </div>
                  <div>
                    <span className="font-medium">@{entry.username}</span>
                    <p className="text-xs text-muted-foreground">{entry.totalXp} XP</p>
                  </div>
                </div>
                <span className="text-sm font-semibold bg-white px-3 py-1 rounded-full border shadow-sm">
                  Lvl {entry.level}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
