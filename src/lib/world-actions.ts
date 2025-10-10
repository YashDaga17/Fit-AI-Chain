/**
 * World ID Incognito Actions Configuration
 * Define all actions that require proof-of-personhood verification
 */

export enum WorldAction {
  // Authentication (already implemented)
  VERIFY_HUMAN = 'verify-human',
  
  // Food Tracking Actions (prevent spam/bots)
  DAILY_FOOD_LOG = 'daily-food-log', // Limit: 3 per day
  CLAIM_DAILY_REWARD = 'claim-daily-reward', // Limit: 1 per day
  
  // Community Actions
  VOTE_BEST_FOOD = 'vote-best-food', // Limit: 1 per food item
  JOIN_CHALLENGE = 'join-challenge', // Limit: 1 per challenge
  REPORT_CONTENT = 'report-content', // Limit: 5 per day
  
  // Premium Actions (if you add premium features)
  CLAIM_REFERRAL_BONUS = 'claim-referral-bonus', // Limit: 1 per referral
}

/**
 * Action configurations for creating in World Developer Portal
 * Go to: https://developer.worldcoin.org/ → Your App → Actions
 */
export const ACTION_CONFIGS = {
  [WorldAction.VERIFY_HUMAN]: {
    name: 'verify-human',
    description: 'Verify user is a unique human',
    max_verifications: 1,
  },
  [WorldAction.DAILY_FOOD_LOG]: {
    name: 'daily-food-log',
    description: 'Log food entry (max 3 per day)',
    max_verifications: 3,
  },
  [WorldAction.CLAIM_DAILY_REWARD]: {
    name: 'claim-daily-reward',
    description: 'Claim daily XP bonus (once per day)',
    max_verifications: 1,
  },
  [WorldAction.VOTE_BEST_FOOD]: {
    name: 'vote-best-food',
    description: 'Vote on community food entries',
    max_verifications: 1,
  },
  [WorldAction.JOIN_CHALLENGE]: {
    name: 'join-challenge',
    description: 'Join a fitness challenge',
    max_verifications: 1,
  },
  [WorldAction.REPORT_CONTENT]: {
    name: 'report-content',
    description: 'Report inappropriate content (max 5 per day)',
    max_verifications: 5,
  },
  [WorldAction.CLAIM_REFERRAL_BONUS]: {
    name: 'claim-referral-bonus',
    description: 'Claim bonus for referring friends',
    max_verifications: 1,
  },
}

/**
 * Instructions for setting up actions in Developer Portal:
 * 
 * 1. Go to https://developer.worldcoin.org/
 * 2. Select your app
 * 3. Navigate to "Actions" tab
 * 4. Click "Create Action"
 * 5. For each action above:
 *    - Name: Use the 'name' from ACTION_CONFIGS
 *    - Description: Use the 'description'
 *    - Action Type: Select "Cloud" (not "On-chain")
 *    - Max Verifications: Set according to max_verifications
 * 
 * Example for daily-food-log:
 * - Name: daily-food-log
 * - Description: Log food entry (max 3 per day)
 * - Type: Cloud
 * - Max Verifications: 3
 */
