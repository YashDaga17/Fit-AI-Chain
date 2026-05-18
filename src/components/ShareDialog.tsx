"use client"

import * as React from "react"
import { Check, Copy, MessageCircle, Share2, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ShareDialogProps {
  streak: number
  level: number
  calories: number
}

export default function ShareDialog({ streak, level, calories }: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false)

  const message = `I'm on a ${streak} day streak on Fit-AI-Chain! I've reached Level ${level} and logged ${calories} calories today. 🔥 #FitAIChain`

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-2xl">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your progress</DialogTitle>
          <DialogDescription>
            Show off your achievements to your friends!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            {message}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full rounded-2xl bg-[#1DA1F2] text-white hover:bg-[#1a91da]"
              onClick={shareOnTwitter}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Share on X
            </Button>
            <Button
              className="w-full rounded-2xl bg-[#25D366] text-white hover:bg-[#20bd5a]"
              onClick={shareOnWhatsApp}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Share on WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-2xl"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text (for Instagram)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
