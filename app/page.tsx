"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import {
  Coins,
  ImageIcon,
  Sparkles,
  Rocket,
  Zap,
  Star,
  Gem,
  ExternalLink,
  Copy,
  CheckCircle,
  Wallet,
  TrendingUp,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Play,
  Flame,
  Crown,
  Target,
  Layers,
  Globe,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWalletBalance } from "@/hooks/use-wallet-balance"
import { mintGorbNFTToken22SingleTx} from "@/lib/mint-functions"
import { createTokenWithWallet } from "@/lib/createTokenWithWallet"
import { WalletDropdown } from "@/components/wallet-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { GORB_CONNECTION } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { createToken } from "@/lib/store/slices/tokenSlice"
import { createNFT } from "@/lib/store/slices/nftSlice"
import { fetchPlatformStats } from "@/lib/store/slices/statsSlice"
import { Navigation } from "@/components/navigation"

export default function GorbaganaLaunchpad() {
  const { theme, setTheme } = useTheme()
  const { connected, publicKey, wallet } = useWallet()
  const connection = GORB_CONNECTION
  const { balance, loading: balanceLoading } = useWalletBalance()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Redux hooks
  const dispatch = useAppDispatch()
  const { currentUser, isAuthenticated } = useUser()
  const { platformStats } = useAppSelector((state: any) => state.stats || { platformStats: null })

  // Token form state
  const [tokenForm, setTokenForm] = useState({
    name: "",
    symbol: "",
    supply: "",
    decimals: "9",
    uri: "",
    freezeAuthority: "",
  })
  const [tokenFreezeAuthorityError, setTokenFreezeAuthorityError] = useState<string | null>(null)

  // NFT form state
  const [nftForm, setNftForm] = useState({
    name: "",
    symbol: "",
    uri: "",
    description: "",
    freezeAuthority: "",
  })
  const [freezeAuthorityError, setFreezeAuthorityError] = useState<string | null>(null)

  // Transaction results
  const [lastTransaction, setLastTransaction] = useState<{
    type: "token" | "nft"
    signature: string
    address: string
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    // Fetch platform stats on component mount
    dispatch(fetchPlatformStats())
  }, [dispatch])

  const handleTokenLaunch = async () => {
    setTokenFreezeAuthorityError(null)
    if (!tokenForm.name || !tokenForm.symbol || !tokenForm.supply) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate freeze authority if provided
    let freezeAuthorityPubkey: import("@solana/web3.js").PublicKey | null = null
    if (tokenForm.freezeAuthority) {
      try {
        freezeAuthorityPubkey = new (await import("@solana/web3.js")).PublicKey(tokenForm.freezeAuthority)
      } catch (e) {
        setTokenFreezeAuthorityError("Invalid Solana public key format")
        toast({
          title: "Invalid Freeze Authority",
          description: "Freeze authority must be a valid Solana public key.",
          variant: "destructive",
        })
        return
      }
    }

    if (!connected || !wallet) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await createTokenWithWallet({
        connection,
        wallet: wallet.adapter,
        name: tokenForm.name,
        symbol: tokenForm.symbol,
        supply: tokenForm.supply,
        decimals: Number.parseInt(tokenForm.decimals),
        uri: tokenForm.uri,
        freezeAuth: freezeAuthorityPubkey ? freezeAuthorityPubkey : null,
      })

      setLastTransaction({
        type: "token",
        signature: result.signature,
        address: result.tokenAddress,
      })

      // Save token to database
      if (currentUser) {
        try {
          await dispatch(createToken({
            mintAddress: result.tokenAddress,
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            supply: tokenForm.supply,
            decimals: Number.parseInt(tokenForm.decimals),
            uri: tokenForm.uri || undefined,
            freezeAuthority: freezeAuthorityPubkey?.toBase58() || undefined,
            mintAuthority: publicKey?.toBase58() || '',
            updateAuthority: publicKey?.toBase58() || '',
            isFrozen: false,
            isInitialized: true,
            programId: "G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6",
            creator: currentUser._id!,
            transactionSignature: result.signature,
            metadata: {
              name: tokenForm.name,
              symbol: tokenForm.symbol,
              uri: tokenForm.uri || undefined,
              updateAuthority: publicKey?.toBase58() || '',
              additionalMetadata: []
            }
          })).unwrap()

          // Refresh platform stats
          dispatch(fetchPlatformStats())
        } catch (error) {
          console.error('Error saving token to database:', error)
        }
      }

      toast({
        title: "🚀 Token Launched Successfully!",
        description: `${tokenForm.name} (${tokenForm.symbol}) has been created on Gorbchain!`,
      })

      setTokenForm({ name: "", symbol: "", supply: "", decimals: "9", uri: "", freezeAuthority: "" })
    } catch (error) {
      console.error("Token launch error:", error)
      
      // Make error messages more user-friendly
      let errorTitle = "Launch Failed"
      let errorDescription = "Failed to create token. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes("InvalidAccountData")) {
          errorTitle = "Account Setup Issue"
          errorDescription = "There's a temporary issue with account setup. Try again in a moment."
        } else if (error.message.includes("Insufficient")) {
          errorTitle = "Insufficient Balance"
          errorDescription = "You don't have enough SOL to complete this transaction."
        } else if (error.message.includes("Wallet not connected")) {
          errorTitle = "Wallet Not Connected"
          errorDescription = "Please connect your wallet and try again."
        } else if (error.message.includes("simulation failed")) {
          errorTitle = "Transaction Issues"
          errorDescription = "Transaction couldn't be processed. Please check your inputs and try again."
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNFTLaunch = async () => {
    setFreezeAuthorityError(null)
    if (!nftForm.name || !nftForm.symbol || !nftForm.uri || !nftForm.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate freeze authority if provided
    let freezeAuthorityPubkey: import("@solana/web3.js").PublicKey | null = null
    if (nftForm.freezeAuthority) {
      try {
        freezeAuthorityPubkey = new (await import("@solana/web3.js")).PublicKey(nftForm.freezeAuthority)
      } catch (e) {
        setFreezeAuthorityError("Invalid Solana public key format")
        toast({
          title: "Invalid Freeze Authority",
          description: "Freeze authority must be a valid Solana public key.",
          variant: "destructive",
        })
        return
      }
    }

    if (!connected || !wallet) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await mintGorbNFTToken22SingleTx({
        connection,
        wallet: wallet.adapter,
        name: nftForm.name,
        symbol: nftForm.symbol,
        uri: nftForm.uri,
        description: nftForm.description,
        // freezeAuth: freezeAuthorityPubkey ? freezeAuthorityPubkey : null,
      })

      setLastTransaction({
        type: "nft",
        signature: result.signature,
        address: result.nftAddress,
      })

      // Save NFT to database
      if (currentUser) {
        try {
          await dispatch(createNFT({
            mintAddress: result.nftAddress,
            name: nftForm.name,
            symbol: nftForm.symbol,
            uri: nftForm.uri,
            description: nftForm.description,
            freezeAuthority: freezeAuthorityPubkey?.toBase58() || undefined,
            mintAuthority: publicKey?.toBase58() || '',
            updateAuthority: publicKey?.toBase58() || '',
            isFrozen: false,
            isInitialized: true,
            programId: "G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6",
            creator: currentUser._id!,
            transactionSignature: result.signature,
            royaltyFee: 5.0,
            metadata: {
              name: nftForm.name,
              symbol: nftForm.symbol,
              uri: nftForm.uri,
              description: nftForm.description,
              updateAuthority: publicKey?.toBase58() || '',
              additionalMetadata: []
            }
          })).unwrap()

          // Refresh platform stats
          dispatch(fetchPlatformStats())
        } catch (error) {
          console.error('Error saving NFT to database:', error)
        }
      }

      toast({
        title: "🎨 NFT Minted Successfully!",
        description: `${nftForm.name} NFT has been created on Gorbchain!`,
      })

      setNftForm({ name: "", symbol: "", uri: "", description: "", freezeAuthority: "" })
    } catch (error) {
      console.error("NFT mint error:", error)
      
      // Make error messages more user-friendly
      let errorTitle = "Mint Failed"
      let errorDescription = "Failed to mint NFT. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes("InvalidAccountData")) {
          errorTitle = "Account Setup Issue"
          errorDescription = "There's a temporary issue with account setup. Try again in a moment."
        } else if (error.message.includes("Insufficient")) {
          errorTitle = "Insufficient Balance"
          errorDescription = "You don't have enough SOL to complete this transaction."
        } else if (error.message.includes("Wallet not connected")) {
          errorTitle = "Wallet Not Connected"
          errorDescription = "Please connect your wallet and try again."
        } else if (error.message.includes("simulation failed")) {
          errorTitle = "Transaction Issues"
          errorDescription = "Transaction couldn't be processed. Please check your inputs and try again."
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 dark:from-slate-900 dark:via-green-950/20 dark:to-emerald-950/30">
      <Navigation />

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-200/10 to-emerald-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-6xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 mb-8"
            >
              <Flame className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                The #1 Token & NFT Launchpad on Gorbchain
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Launch Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Crypto Dreams
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Create tokens and NFTs on Gorbchain with zero coding required. 
              <span className="font-semibold text-green-600 dark:text-green-400"> Lightning fast</span>, 
              <span className="font-semibold text-emerald-600 dark:text-emerald-400"> secure</span>, and 
              <span className="font-semibold text-teal-600 dark:text-teal-400"> user-friendly</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              {connected ? (
                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      document.getElementById('launchpad')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Launch Token
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-8 text-lg border-2 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      document.getElementById('launchpad')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Mint NFT
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <WalletMultiButton className="!h-14 !px-8 !text-lg !bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!from-green-700 hover:!to-emerald-700 !rounded-2xl !border-0 !text-white !shadow-2xl hover:!shadow-green-500/25 !transition-all !duration-300 hover:!scale-105" />
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {platformStats?.totalTokens || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Tokens Launched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  {platformStats?.totalNFTs || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">NFTs Minted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                  {platformStats?.totalUsers || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                  $0
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Volume</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Why Choose <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">GorbPad</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
            >
              Built for the next generation of creators, developers, and crypto enthusiasts
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Deploy tokens and NFTs in seconds with our optimized smart contracts",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Built on Gorbchain with military-grade security and audit-ready code",
                color: "from-green-400 to-emerald-500"
              },
              {
                icon: Globe,
                title: "Zero Coding",
                description: "No technical knowledge required. Launch with just a few clicks",
                color: "from-blue-400 to-cyan-500"
              },
              {
                icon: Crown,
                title: "Premium Features",
                description: "Advanced metadata, royalty settings, and custom configurations",
                color: "from-purple-400 to-pink-500"
              },
              {
                icon: Target,
                title: "User Friendly",
                description: "Intuitive interface designed for both beginners and experts",
                color: "from-indigo-400 to-purple-500"
              },
              {
                icon: Layers,
                title: "Full Control",
                description: "Complete ownership of your tokens and NFTs with full metadata",
                color: "from-teal-400 to-green-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Launchpad Forms Section */}
        <div className="container mx-auto px-4 py-20" id="launchpad">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Launch Your Assets
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Create tokens and NFTs directly on this page. No need to navigate elsewhere!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Token Launch Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Token Launch</CardTitle>
                      <CardDescription className="text-blue-700 dark:text-blue-300">Create your own token on Gorbchain</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Token Name *</Label>
                      <Input
                        id="token-name"
                        placeholder="e.g., Gorb Token"
                        value={tokenForm.name}
                        onChange={(e) => setTokenForm({ ...tokenForm, name: e.target.value })}
                        className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token-symbol" className="text-sm font-medium text-gray-700 dark:text-gray-300">Symbol *</Label>
                      <Input
                        id="token-symbol"
                        placeholder="e.g., GORB"
                        value={tokenForm.symbol}
                        onChange={(e) => setTokenForm({ ...tokenForm, symbol: e.target.value })}
                        className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token-image" className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</Label>
                    <Input
                      id="token-image"
                      placeholder="https://example.com/token-image.png"
                      value={tokenForm.uri}
                      onChange={(e) => setTokenForm({ ...tokenForm, uri: e.target.value })}
                      className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-supply" className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial Supply *</Label>
                      <Input
                        id="token-supply"
                        type="number"
                        placeholder="1000000"
                        value={tokenForm.supply}
                        onChange={(e) => setTokenForm({ ...tokenForm, supply: e.target.value })}
                        className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token-decimals" className="text-sm font-medium text-gray-700 dark:text-gray-300">Decimals</Label>
                      <Input
                        id="token-decimals"
                        type="number"
                        placeholder="9"
                        value={tokenForm.decimals}
                        onChange={(e) => setTokenForm({ ...tokenForm, decimals: e.target.value })}
                        className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token-freeze" className="text-sm font-medium text-gray-700 dark:text-gray-300">Freeze Authority (optional)</Label>
                    <Input
                      id="token-freeze"
                      placeholder="Solana public key (optional)"
                      value={tokenForm.freezeAuthority}
                      onChange={(e) => {
                        setTokenForm({ ...tokenForm, freezeAuthority: e.target.value })
                        setTokenFreezeAuthorityError(null)
                      }}
                      className={`rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900 dark:text-white ${tokenFreezeAuthorityError ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {tokenFreezeAuthorityError && (
                      <p className="text-xs text-red-600 mt-1">{tokenFreezeAuthorityError}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">If provided, must be a valid Solana public key. Leave blank to disable freeze authority.</p>
                  </div>

                  <Button
                    onClick={handleTokenLaunch}
                    disabled={!connected || isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Launch Token
                      </>
                    )}
                  </Button>

                  {!connected && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">Connect your wallet to launch tokens</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* NFT Launch Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-purple-900 dark:text-purple-100">NFT Launch</CardTitle>
                      <CardDescription className="text-purple-700 dark:text-purple-300">Mint unique NFTs on Gorbchain</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nft-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">NFT Name *</Label>
                      <Input
                        id="nft-name"
                        placeholder="e.g., Gorb Genesis"
                        value={nftForm.name}
                        onChange={(e) => setNftForm({ ...nftForm, name: e.target.value })}
                        className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nft-symbol" className="text-sm font-medium text-gray-700 dark:text-gray-300">Symbol *</Label>
                      <Input
                        id="nft-symbol"
                        placeholder="e.g., GGEN"
                        value={nftForm.symbol}
                        onChange={(e) => setNftForm({ ...nftForm, symbol: e.target.value })}
                        className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nft-image" className="text-sm font-medium text-gray-700 dark:text-gray-300">Image/Metadata URL *</Label>
                    <Input
                      id="nft-image"
                      placeholder="https://example.com/nft-metadata.json"
                      value={nftForm.uri}
                      onChange={(e) => setNftForm({ ...nftForm, uri: e.target.value })}
                      className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-gray-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nft-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</Label>
                    <Textarea
                      id="nft-description"
                      placeholder="Describe your NFT collection..."
                      value={nftForm.description}
                      onChange={(e) => setNftForm({ ...nftForm, description: e.target.value })}
                      className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-purple-500 min-h-[100px] resize-none placeholder:text-gray-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nft-freeze" className="text-sm font-medium text-gray-700 dark:text-gray-300">Freeze Authority (optional)</Label>
                    <Input
                      id="nft-freeze"
                      placeholder="Solana public key (optional)"
                      value={nftForm.freezeAuthority}
                      onChange={(e) => {
                        setNftForm({ ...nftForm, freezeAuthority: e.target.value })
                        setFreezeAuthorityError(null)
                      }}
                      className={`rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-gray-500 text-gray-900 dark:text-white ${freezeAuthorityError ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {freezeAuthorityError && (
                      <p className="text-xs text-red-600 mt-1">{freezeAuthorityError}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">If provided, must be a valid Solana public key. Leave blank to disable freeze authority.</p>
                  </div>

                  <div className="bg-white/30 dark:bg-slate-800/30 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Royalty Fee</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Fixed at 5% for all NFTs</p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-700 dark:bg-purple-300 border-0">5%</Badge>
                    </div>
                  </div>

                  <Button
                    onClick={handleNFTLaunch}
                    disabled={!connected || isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Minting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Mint NFT
                      </>
                    )}
                  </Button>

                  {!connected && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">Connect your wallet to mint NFTs</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-emerald-600/90"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Launch?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of creators who have already launched their tokens and NFTs on Gorbchain
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="h-14 px-8 text-lg bg-white text-green-600 hover:bg-green-50 shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    document.getElementById('launchpad')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Creating
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link href="/top-users">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <Crown className="w-5 h-5 mr-2" />
                    View Leaders
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>



      </main>
    </div>
  )
}
