/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for better UX in World App
 */

import { MiniKit } from '@worldcoin/minikit-js'

export enum HapticType {
  // Impact haptics
  LIGHT = 'impact.light',
  MEDIUM = 'impact.medium', 
  HEAVY = 'impact.heavy',
  
  // Notification haptics
  SUCCESS = 'notification.success',
  WARNING = 'notification.warning',
  ERROR = 'notification.error',
  
  // Selection haptics
  SELECTION = 'selectionChanged'
}

/**
 * Send haptic feedback to the user's device
 * Only works in World App - gracefully fails in browser
 */
export const sendHaptic = (type: HapticType) => {
  if (!MiniKit.isInstalled()) return

  const [hapticType, style] = type.split('.') as [string, string | undefined]
  
  // Map to correct API types
  const typeMap: Record<string, 'impact' | 'notification' | 'selection-changed'> = {
    'impact': 'impact',
    'notification': 'notification',
    'selectionChanged': 'selection-changed'
  }

  MiniKit.commands.sendHapticFeedback({
    hapticsType: typeMap[hapticType] || 'impact',
    ...(style && { style: style as any })
  })
}

// Convenience functions for common haptics
export const haptics = {
  // UI Interactions
  buttonClick: () => sendHaptic(HapticType.LIGHT),
  toggle: () => sendHaptic(HapticType.SELECTION),
  
  // Food Tracking
  photoCapture: () => sendHaptic(HapticType.HEAVY),
  foodAnalyzed: () => sendHaptic(HapticType.SUCCESS),
  
  // Gamification
  xpEarned: () => sendHaptic(HapticType.SUCCESS),
  levelUp: () => sendHaptic(HapticType.HEAVY),
  achievementUnlocked: () => sendHaptic(HapticType.SUCCESS),
  streakMaintained: () => sendHaptic(HapticType.SUCCESS),
  
  // Errors & Warnings
  error: () => sendHaptic(HapticType.ERROR),
  warning: () => sendHaptic(HapticType.WARNING),
  
  // Navigation
  tabChange: () => sendHaptic(HapticType.LIGHT),
  modalOpen: () => sendHaptic(HapticType.MEDIUM),
  modalClose: () => sendHaptic(HapticType.LIGHT),
}
