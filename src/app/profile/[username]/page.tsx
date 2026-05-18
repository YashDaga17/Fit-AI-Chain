"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, Flame } from "lucide-react"

// Mock data for fallback
const mockUser = {
  username: "user_unknown",
  level: 1,
  totalXp: 0,
  streak: 1,
  joinedAt: new Date().toISOString(),
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = React.useState(mockUser)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (username) {
      fetchUserProfile()
    }
  }, [username])

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`/api/user/sync?username=${username}`)
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
      } else {
        // Fallback to mock with requested username
        setUser({ ...mockUser, username })
      }
    } catch (e) {
      setUser({ ...mockUser, username })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-20">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-3xl shadow-lg mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-2xl">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">@{user.username}</h1>
            <p className="text-white/80">Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Level</CardTitle>
            <Trophy className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.level}</div>
            <p className="text-xs text-muted-foreground">{user.totalXp} Total XP</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
            <Flame className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.streak} Days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rank</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#1</div>
            <p className="text-xs text-muted-foreground">Top performer</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
