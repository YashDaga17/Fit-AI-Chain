/**
 * Share Utilities for World App
 * Enable users to share achievements, food logs, and invite friends
 */

import { MiniKit } from '@worldcoin/minikit-js'

interface ShareOptions {
  title?: string
  text?: string
  url?: string
  imageUrl?: string
}

/**
 * Share content via World App's native share drawer
 */
export const share = async (options: ShareOptions) => {
  if (!MiniKit.isInstalled()) {
    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        })
        return { success: true }
      } catch (error) {
        console.error('Share failed:', error)
        return { success: false, error }
      }
    }
    return { success: false, error: 'Share not supported' }
  }

  const payload = {
    ...(options.title && { title: options.title }),
    ...(options.text && { description: options.text }),
    ...(options.url && { url: options.url }),
    ...(options.imageUrl && { imageUrl: options.imageUrl }),
  }

  MiniKit.commands.share(payload)
  return { success: true }
}

// Convenience functions for common share scenarios
export const shareUtils = {
  /**
   * Share leaderboard rank
   */
  shareRank: async (rank: number, xp: number, level: number) => {
    return share({
      title: `🏆 Fit AI Chain Leaderboard`,
      text: `I'm ranked #${rank} with ${xp.toLocaleString()} XP (Level ${level})! 💪\n\nTrack your fitness with AI and compete with friends!`,
      url: window.location.origin,
    })
  },

  /**
   * Share food analysis result
   */
  shareFoodLog: async (foodName: string, calories: number, xpEarned: number, imageUrl?: string) => {
    return share({
      title: `🍽️ My ${foodName}`,
      text: `Just tracked ${foodName} - ${calories} cal, earned ${xpEarned} XP! 🎯\n\nJoin me on Fit AI Chain!`,
      url: window.location.origin,
      imageUrl,
    })
  },

  /**
   * Share level-up achievement
   */
  shareLevelUp: async (level: number, xp: number) => {
    return share({
      title: `🎉 Level Up!`,
      text: `Just hit Level ${level} with ${xp.toLocaleString()} total XP on Fit AI Chain! 🚀\n\nTrack your nutrition with AI!`,
      url: window.location.origin,
    })
  },

  /**
   * Share achievement
   */
  shareAchievement: async (achievementName: string, description: string) => {
    return share({
      title: `🏅 Achievement Unlocked!`,
      text: `${achievementName}\n${description}\n\nJoin me on Fit AI Chain!`,
      url: window.location.origin,
    })
  },

  /**
   * Invite friends
   */
  inviteFriends: async () => {
    return share({
      title: `Join me on Fit AI Chain! 🥗`,
      text: `Track your nutrition with AI, earn XP, and compete on the leaderboard!\n\nGet started now:`,
      url: window.location.origin,
    })
  },
}
