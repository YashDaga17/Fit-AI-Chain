"use client"

import * as React from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, UserPlus, Heart } from "lucide-react"

// Mock data for display since DB might not be connected
const mockFeed = [
  {
    id: 1,
    username: "fit_guru",
    activityType: "logged_food",
    content: { message: "Logged Avocado Toast for 350 kcal 🥑" },
    createdAt: "2026-05-16T10:00:00Z",
  },
  {
    id: 2,
    username: "runner_jane",
    activityType: "level_up",
    content: { message: "Reached Level 5! 🎉" },
    createdAt: "2026-05-16T09:00:00Z",
  },
]

const mockFriends = [
  { id: 1, username: "fit_guru", level: 12 },
  { id: 2, username: "runner_jane", level: 5 },
]

export default function SocialPage() {
  const { username } = useAuth()
  const [feed, setFeed] = React.useState(mockFeed)
  const [friends, setFriends] = React.useState(mockFriends)
  const [friendUsername, setFriendUsername] = React.useState("")

  React.useEffect(() => {
    if (username) {
      fetchFeed()
      fetchFriends()
    }
  }, [username])

  const fetchFeed = async () => {
    try {
      const res = await fetch(`/api/social/feed?username=${username}`)
      const data = await res.json()
      if (data.feed && data.feed.length > 0) {
        setFeed(data.feed)
      }
    } catch (e) {
      console.log("Using mock feed")
    }
  }

  const fetchFriends = async () => {
    try {
      const res = await fetch(`/api/social/friends?username=${username}`)
      const data = await res.json()
      if (data.friends && data.friends.length > 0) {
        setFriends(data.friends)
      }
    } catch (e) {
      console.log("Using mock friends")
    }
  }

  const sendFriendRequest = async () => {
    if (!friendUsername) return
    try {
      const res = await fetch("/api/social/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, friendUsername }),
      })
      const data = await res.json()
      if (res.ok) {
        alert("Friend request sent!")
        setFriendUsername("")
      } else {
        alert(data.error || "Failed to send request")
      }
    } catch (e) {
      alert("Failed to send request")
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6">Social Feed</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="md:col-span-2 space-y-4">
          {feed.map((item) => (
            <Card key={item.id} className="rounded-2xl">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-full flex items-center justify-center font-bold">
                  {item.username[0].toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">@{item.username}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.content.message}</p>
                <div className="flex gap-4 mt-4 text-muted-foreground">
                  <button className="flex items-center gap-1 text-xs hover:text-foreground">
                    <Heart className="w-4 h-4" /> Like
                  </button>
                  <button className="flex items-center gap-1 text-xs hover:text-foreground">
                    <MessageCircle className="w-4 h-4" /> Comment
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add Friend */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Add Friend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Username"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                className="rounded-xl"
              />
              <Button 
                onClick={sendFriendRequest} 
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </CardContent>
          </Card>

          {/* Friends List */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs">
                        {friend.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">@{friend.username}</span>
                    </div>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                      Lvl {friend.level}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
