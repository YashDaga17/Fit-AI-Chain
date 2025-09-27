import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'

// Types for MiniKit operations
export interface VerificationResult {
  proof: string
  merkle_root: string
  nullifier_hash: string
  verification_level: string
  status: 'success' | 'error'
  error?: string
}

export interface PaymentResult {
  transaction_id: string
  status: 'success' | 'error'
  error?: string
}

export interface SignMessageResult {
  signature: string
  status: 'success' | 'error'
  error?: string
}

export interface WalletAuthResult {
  address: string
  signature: string
  status: 'success' | 'error'
  error?: string
}

// MiniKit Utilities Class
export class MiniKitUtils {
  private static instance: MiniKitUtils

  private constructor() {
    // Initialize without event listeners - using async commands instead
  }

  public static getInstance(): MiniKitUtils {
    if (!MiniKitUtils.instance) {
      MiniKitUtils.instance = new MiniKitUtils()
    }
    return MiniKitUtils.instance
  }

  // World ID Verification using async commands
  public async verify(action: string, signal?: string, verificationLevel?: VerificationLevel): Promise<ISuccessResult> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    const verifyPayload: VerifyCommandInput = {
      action,
      signal: signal || '',
      verification_level: verificationLevel || VerificationLevel.Device,
    }

    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

    if (finalPayload.status === 'error') {
      throw new Error('Verification failed')
    }

    return finalPayload as ISuccessResult
  }

  // Payment Request
  public async requestPayment(
    to: string,
    tokens: Array<{ symbol: string; token_amount: string }>,
    description?: string,
    reference?: string
  ): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    const response = MiniKit.commands.pay({
      to,
      tokens: tokens as any, // Type assertion for MiniKit compatibility
      description: description || '',
      reference: reference || `payment_${Date.now()}`,
    })

    if (!response) {
      throw new Error('Failed to initiate payment')
    }
  }

  // Wallet Authentication with Sign in with Ethereum
  public async authenticateWallet(
    siweMessage: string,
    expirationTime?: Date,
    notBefore?: Date
  ): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    const response = MiniKit.commands.walletAuth({
      nonce: Math.random().toString(36),
      requestId: Math.random().toString(36),
      expirationTime,
      notBefore,
    })

    if (!response) {
      throw new Error('Failed to initiate wallet authentication')
    }
  }

  // Send Transaction
  public async sendTransaction(
    to: string,
    value: string,
    data?: string
  ): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    const response = MiniKit.commands.sendTransaction({
      transaction: [
        {
          address: to,
          abi: [],
          functionName: '',
          args: [],
        },
      ],
    })

    if (!response) {
      throw new Error('Failed to initiate transaction')
    }
  }

  public async signMessage(message: string): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    const response = MiniKit.commands.signMessage({
      message,
    })

    if (!response) {
      throw new Error('Failed to initiate message signing')
    }
  }

  public async signTypedData(typedData: any): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    const response = MiniKit.commands.signTypedData(typedData)

    if (!response) {
      throw new Error('Failed to initiate typed data signing')
    }
  }

  // Share Contacts
  public async shareContacts(multiSelectEnabled: boolean = false): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    const response = MiniKit.commands.shareContacts({
      isMultiSelectEnabled: multiSelectEnabled,
    })

    if (!response) {
      throw new Error('Failed to initiate contact sharing')
    }
  }

  // Send Notification
  public async sendNotification(
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    // Note: Notifications might need to be handled differently based on MiniKit version
  }

  // Send Haptic Feedback
  public async sendHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    // Haptic feedback implementation
    try {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [50]
        }
        navigator.vibrate(patterns[type])
      }
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }

  // Share Content
  public async shareContent(
    title: string,
    text: string,
    url?: string
  ): Promise<void> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    const response = MiniKit.commands.share({
      title,
      text,
      url: url || '',
    })

    if (!response) {
      throw new Error('Failed to initiate content sharing')
    }
  }

  // Get User Permissions
  public async getUserPermissions(): Promise<string[]> {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed. Please open this app in World App.')
    }

    return ['verify', 'payment', 'walletAuth', 'signMessage', 'sendTransaction']
  }

  public isAvailable(): boolean {
    return MiniKit.isInstalled()
  }

  // Get user's World ID verification status
  public getVerificationStatus(): { verified: boolean; data?: any } {
    const verificationData = localStorage.getItem('worldid_verification')
    if (verificationData) {
      try {
        const data = JSON.parse(verificationData)
        return { verified: true, data }
      } catch {
        return { verified: false }
      }
    }
    return { verified: false }
  }

  // Clear verification data
  public clearVerification(): void {
    localStorage.removeItem('worldid_verification')
  }
}

// Export singleton instance
export const miniKitUtils = MiniKitUtils.getInstance()

// Export convenient hooks
export function useMiniKit() {
  const utils = MiniKitUtils.getInstance()
  
  return {
    verify: utils.verify.bind(utils),
    requestPayment: utils.requestPayment.bind(utils),
    authenticateWallet: utils.authenticateWallet.bind(utils),
    sendTransaction: utils.sendTransaction.bind(utils),
    signMessage: utils.signMessage.bind(utils),
    signTypedData: utils.signTypedData.bind(utils),
    shareContacts: utils.shareContacts.bind(utils),
    sendNotification: utils.sendNotification.bind(utils),
    sendHapticFeedback: utils.sendHapticFeedback.bind(utils),
    shareContent: utils.shareContent.bind(utils),
    getUserPermissions: utils.getUserPermissions.bind(utils),
    isAvailable: utils.isAvailable.bind(utils),
    getVerificationStatus: utils.getVerificationStatus.bind(utils),
    clearVerification: utils.clearVerification.bind(utils),
  }
}
