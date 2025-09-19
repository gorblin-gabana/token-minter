"use client"

import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm">Made with</span>
            <Heart className="w-4 h-4 text-green-500 fill-current animate-pulse" />
            <span className="text-sm">from</span>
            <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Gorbchain
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>© 2024 GorbPad</span>
            <span>•</span>
            <span>Token & NFT Launchpad</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
