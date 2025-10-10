/**
 * Push Notifications for World App
 * Send targeted notifications to re-engage users
 */

interface NotificationPayload {
  title: string
  body: string
  deepLink?: string
  imageUrl?: string
}

/**
 * Send notification to a user
 * Must be called from server-side only
 */
export const sendNotification = async (
  walletAddress: string,
  notification: NotificationPayload
) => {
  const response = await fetch('https://developer.worldcoin.org/api/v2/minikit/send-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WORLD_APP_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.APP_ID,
      recipients: [walletAddress],
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.deepLink && { deep_link: notification.deepLink }),
        ...(notification.imageUrl && { image_url: notification.imageUrl }),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send notification: ${response.statusText}`)
  }

  return response.json()
}

// Pre-built notification templates
export const notificationTemplates = {
  /**
   * Daily streak reminder
   */
  streakReminder: (username: string, streakDays: number): NotificationPayload => ({
    title: `🔥 Don't break your ${streakDays}-day streak!`,
    body: `${username}, log your food today to keep it going!`,
    deepLink: '/tracker',
  }),

  /**
   * Weekly leaderboard update
   */
  leaderboardUpdate: (username: string, rank: number, change: number): NotificationPayload => ({
    title: rank <= 3 ? '🏆 Top 3 Alert!' : '📊 Weekly Update',
    body: `${username}, you're ranked #${rank} ${change > 0 ? `(↑${change})` : change < 0 ? `(↓${Math.abs(change)})` : ''}`,
    deepLink: '/leaderboard',
  }),

  /**
   * Achievement unlocked
   */
  achievementUnlocked: (achievementName: string, description: string): NotificationPayload => ({
    title: `🏅 Achievement Unlocked!`,
    body: `${achievementName}: ${description}`,
    deepLink: '/tracker',
  }),

  /**
   * Level up notification
   */
  levelUp: (username: string, newLevel: number): NotificationPayload => ({
    title: `🎉 Level ${newLevel}!`,
    body: `Congrats ${username}! You've reached Level ${newLevel}!`,
    deepLink: '/tracker',
  }),

  /**
   * Challenge invitation
   */
  challengeInvite: (fromUsername: string, challengeName: string): NotificationPayload => ({
    title: `⚔️ Challenge from ${fromUsername}`,
    body: `Join the ${challengeName} challenge!`,
    deepLink: '/challenges',
  }),

  /**
   * Friend joined
   */
  friendJoined: (friendUsername: string): NotificationPayload => ({
    title: `👋 ${friendUsername} joined!`,
    body: `Your friend is now on Fit AI Chain. Say hi!`,
    deepLink: '/leaderboard',
  }),
}
