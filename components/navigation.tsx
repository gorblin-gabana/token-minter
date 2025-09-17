"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Coins, 
  Gem, 
  User, 
  Trophy, 
  Menu, 
  X,
  Zap,
  Sparkles
} from "lucide-react"
import Image from "next/image"
import { WalletDropdown } from "@/components/wallet-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAppSelector } from "@/lib/store/hooks"

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { platformStats } = useAppSelector((state) => state.stats)

  const navigation = [
    { name: "Tokens", href: "/tokens", icon: Coins, count: platformStats?.totalTokens },
    { name: "NFTs", href: "/nfts", icon: Gem, count: platformStats?.totalNFTs },
    { name: "Top Users", href: "/top-users", icon: Trophy },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 p-1 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="https://www.gorbchain.xyz/images/logo.png"
                  alt="Gorb Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full rounded-lg"
                  onError={(e: any) => {
                    e.currentTarget.src = "/goblin-mascot.png"
                  }}
                />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                GorbPad
              </h1>
              <p className="text-xs text-muted-foreground">Token & NFT Launchpad</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`relative h-10 px-4 ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                        : "hover:bg-green-50 dark:hover:bg-green-950/20"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                    {item.count !== undefined && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 h-5 px-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      >
                        {item.count}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right side - Wallet & Theme */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <WalletDropdown />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start h-12 ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          : ""
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                      {item.count !== undefined && (
                        <Badge 
                          variant="secondary" 
                          className="ml-auto h-6 px-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        >
                          {item.count}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
