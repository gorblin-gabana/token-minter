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
import { SkeletonLoading } from "@/components/skeleton-loading"
import { Footer } from "@/components/footer"
import { MascotThoughtCloud } from "@/components/mascot-thought-cloud"

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

  // Active form state
  const [activeForm, setActiveForm] = useState<'token' | 'nft'>('token')

  // Image preview states
  const [tokenImagePreview, setTokenImagePreview] = useState<string | null>(null)
  const [nftImagePreview, setNftImagePreview] = useState<string | null>(null)

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

    // Validate supply - must be positive integer
    const supply = parseInt(tokenForm.supply)
    if (isNaN(supply) || supply <= 0 || !Number.isInteger(supply)) {
      toast({
        title: "Invalid Supply",
        description: "Supply must be a positive whole number",
        variant: "destructive",
      })
      return
    }

    // Validate decimals - must be between 0 and 9
    const decimals = parseInt(tokenForm.decimals)
    if (isNaN(decimals) || decimals < 0 || decimals > 9 || !Number.isInteger(decimals)) {
      toast({
        title: "Invalid Decimals",
        description: "Decimals must be a whole number between 0 and 9",
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
        supply: supply.toString(),
        decimals: decimals,
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
            supply: supply.toString(),
            decimals: decimals,
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
    return <SkeletonLoading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900/30 to-emerald-900/20 relative overflow-hidden">
      <Navigation />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Glowing waves */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-300/10 to-cyan-300/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative">
        <div className="container mx-auto px-4 lg:px-8 xl:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-400/30 backdrop-blur-sm"
              >
                <Flame className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  The #1 Token & NFT Launchpad on Gorbchain
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <span className="text-white">
                  Launch Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Crypto Dreams
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-slate-300 max-w-2xl leading-relaxed"
              >
                Official token launchpad on Gorbchain. Create tokens and NFTs with zero coding required. 
                <span className="font-semibold text-green-400"> Lightning fast</span>, 
                <span className="font-semibold text-cyan-400"> secure</span>, and 
                <span className="font-semibold text-emerald-400"> user-friendly</span>.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="pt-4"
              >
                {connected ? (
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 rounded-2xl border-2 border-green-400/30"
                    onClick={() => {
                      document.getElementById('launchpad')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <Rocket className="w-6 h-6 mr-3" />
                    Launch
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                ) : (
                  <WalletMultiButton className="!h-14 !px-8 !text-lg !bg-gradient-to-r !from-green-500 !to-cyan-500 hover:!from-green-600 hover:!to-cyan-600 !rounded-2xl !border-2 !border-green-400/30 !text-white !shadow-2xl hover:!shadow-green-500/25 !transition-all !duration-300 hover:!scale-105" />
                )}
              </motion.div>
            </motion.div>

            {/* Right Content - Mascot */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Thought Cloud */}
                <MascotThoughtCloud />
                
                {/* Mascot Container */}
                <div className="relative w-96 h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem]">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
                  
                  {/* Mascot */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="relative">
                      {/* Base platform */}
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full border-2 border-green-400/30"></div>
                      
                      {/* Mascot image */}
                      <div className="relative z-20">
                        <Image
                          src="gorb-mascot-standing.png"
                          alt="Gorb Mascot"
                          width={400}
                          height={400}
                          className="w-80 h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] object-contain drop-shadow-2xl"
                        />
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -left-4 w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-400/20 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                {platformStats?.totalTokens || 0}
              </div>
              <div className="text-sm text-slate-300">Tokens Launched</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-400/20 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                {platformStats?.totalNFTs || 0}
              </div>
              <div className="text-sm text-slate-300">NFTs Minted</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                {platformStats?.totalUsers || 0}
              </div>
              <div className="text-sm text-slate-300">Active Users</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 to-green-500/10 border border-teal-400/20 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-2">
                $0
              </div>
              <div className="text-sm text-slate-300">Total Volume</div>
            </div>
          </motion.div>
        </div>

        {/* Features Section - COMMENTED OUT */}
        {/* <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
            >
              Why Choose <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">GorbPad</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-slate-300 max-w-3xl mx-auto"
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
                color: "from-purple-400 to-purple-500"
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
                <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:from-slate-800/80 hover:to-slate-900/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-700/50">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div> */}

        {/* Launchpad Forms Section */}
        <div className="container mx-auto px-4 py-20" id="launchpad">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-400/30 backdrop-blur-sm mb-6">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                🚀 Ready to Launch? Choose Your Asset Type
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Create & Launch
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Choose between creating a token or minting an NFT. Both are just a few clicks away!
            </p>
          </motion.div>

          {/* Toggle Switch */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 shadow-inner border border-slate-700/50">
              <div className="flex relative">
                <button
                  onClick={() => setActiveForm('token')}
                  className={`relative z-10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeForm === 'token'
                      ? 'text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    <span>Token Launch</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveForm('nft')}
                  className={`relative z-10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeForm === 'nft'
                      ? 'text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Gem className="w-5 h-5" />
                    <span>NFT Mint</span>
                  </div>
                </button>
              </div>
              <motion.div
                className="absolute top-2 bottom-2 w-1/2 rounded-xl bg-gradient-to-r"
                animate={{
                  x: activeForm === 'token' ? 0 : '100%',
                  background: activeForm === 'token' 
                    ? 'linear-gradient(to right, #10b981, #06b6d4)' 
                    : 'linear-gradient(to right, #8b5cf6, #8b5cf6)'
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              />
            </div>
          </motion.div>

          <motion.div
            key={activeForm}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="max-w-2xl mx-auto"
          >
            {activeForm === 'token' ? (
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-2xl border border-green-400/20">
                <CardHeader className="pb-6 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">🚀 Token Launch</CardTitle>
                      <CardDescription className="text-green-300 text-lg">Create your own token on Gorbchain</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-name" className="text-sm font-medium text-slate-300">Token Name *</Label>
                      <Input
                        id="token-name"
                        placeholder="e.g., Gorb Token"
                        value={tokenForm.name}
                        onChange={(e) => setTokenForm({ ...tokenForm, name: e.target.value })}
                        className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-green-500 placeholder:text-slate-400 text-white border border-slate-600/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token-symbol" className="text-sm font-medium text-slate-300">Symbol *</Label>
                      <Input
                        id="token-symbol"
                        placeholder="e.g., GORB"
                        value={tokenForm.symbol}
                        onChange={(e) => setTokenForm({ ...tokenForm, symbol: e.target.value })}
                        className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-green-500 placeholder:text-slate-400 text-white border border-slate-600/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token-image" className="text-sm font-medium text-slate-300">Image URL</Label>
                    <div className="relative">
                      <Input
                        id="token-image"
                        placeholder="https://example.com/token-image.png"
                        value={tokenForm.uri}
                        onChange={(e) => {
                          setTokenForm({ ...tokenForm, uri: e.target.value })
                          if (e.target.value) {
                            setTokenImagePreview(e.target.value)
                          } else {
                            setTokenImagePreview(null)
                          }
                        }}
                        className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-green-500 placeholder:text-slate-400 text-white pr-12 border border-slate-600/50"
                      />
                      {tokenImagePreview && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border-2 border-green-400/50">
                          <img
                            src={tokenImagePreview}
                            alt="Token preview"
                            className="w-full h-full object-cover"
                            onError={() => setTokenImagePreview(null)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-supply" className="text-sm font-medium text-slate-300">Initial Supply *</Label>
                      <Input
                        id="token-supply"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1000000"
                        value={tokenForm.supply}
                        onChange={(e) => {
                          const value = e.target.value
                          // Only allow positive integers
                          if (value === '' || (Number.isInteger(Number(value)) && Number(value) > 0)) {
                            setTokenForm({ ...tokenForm, supply: value })
                          }
                        }}
                        className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-green-500 placeholder:text-slate-400 text-white border border-slate-600/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token-decimals" className="text-sm font-medium text-slate-300">Decimals</Label>
                      <Input
                        id="token-decimals"
                        type="number"
                        min="0"
                        max="9"
                        step="1"
                        placeholder="9"
                        value={tokenForm.decimals}
                        onChange={(e) => {
                          const value = e.target.value
                          // Only allow integers between 0 and 9
                          if (value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 9)) {
                            setTokenForm({ ...tokenForm, decimals: value })
                          }
                        }}
                        className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-green-500 placeholder:text-slate-400 text-white border border-slate-600/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token-freeze" className="text-sm font-medium text-slate-300">Freeze Authority (optional)</Label>
                    <Input
                      id="token-freeze"
                      placeholder="Solana public key (optional)"
                      value={tokenForm.freezeAuthority}
                      onChange={(e) => {
                        setTokenForm({ ...tokenForm, freezeAuthority: e.target.value })
                        setTokenFreezeAuthorityError(null)
                      }}
                      className={`rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-green-500 placeholder:text-slate-400 text-white border border-slate-600/50 ${tokenFreezeAuthorityError ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {tokenFreezeAuthorityError && (
                      <p className="text-xs text-red-400 mt-1">{tokenFreezeAuthorityError}</p>
                    )}
                    <p className="text-xs text-slate-400">If provided, must be a valid Solana public key. Leave blank to disable freeze authority.</p>
                  </div>

                  <Button
                    onClick={handleTokenLaunch}
                    disabled={!connected || isLoading}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold text-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
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
                    <p className="text-center text-sm text-slate-400">Connect your wallet to launch tokens</p>
                  )}
            </CardContent>
          </Card>
            ) : (
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-2xl border border-purple-400/20">
                <CardHeader className="pb-6 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Gem className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">💎 NFT Mint</CardTitle>
                      <CardDescription className="text-purple-300 text-lg">Mint unique NFTs on Gorbchain</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nft-name" className="text-sm font-medium text-slate-300">NFT Name *</Label>
                      <Input
                        id="nft-name"
                        placeholder="e.g., Gorb Genesis"
                        value={nftForm.name}
                        onChange={(e) => setNftForm({ ...nftForm, name: e.target.value })}
                        className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-slate-400 text-white border border-slate-600/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nft-symbol" className="text-sm font-medium text-slate-300">Symbol *</Label>
                      <Input
                        id="nft-symbol"
                        placeholder="e.g., GGEN"
                        value={nftForm.symbol}
                        onChange={(e) => setNftForm({ ...nftForm, symbol: e.target.value })}
                        className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-slate-400 text-white border border-slate-600/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nft-image" className="text-sm font-medium text-slate-300">Image/Metadata URL *</Label>
                    <div className="relative">
                      <Input
                        id="nft-image"
                        placeholder="https://example.com/nft-metadata.json"
                        value={nftForm.uri}
                        onChange={(e) => {
                          setNftForm({ ...nftForm, uri: e.target.value })
                          if (e.target.value) {
                            setNftImagePreview(e.target.value)
                          } else {
                            setNftImagePreview(null)
                          }
                        }}
                        className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-slate-400 text-white pr-12 border border-slate-600/50"
                      />
                      {nftImagePreview && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border-2 border-purple-400/50">
                          <img
                            src={nftImagePreview}
                            alt="NFT preview"
                            className="w-full h-full object-cover"
                            onError={() => setNftImagePreview(null)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nft-description" className="text-sm font-medium text-slate-300">Description *</Label>
                    <Textarea
                      id="nft-description"
                      placeholder="Describe your NFT collection..."
                      value={nftForm.description}
                      onChange={(e) => setNftForm({ ...nftForm, description: e.target.value })}
                      className="rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-purple-500 min-h-[100px] resize-none placeholder:text-slate-400 text-white border border-slate-600/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nft-freeze" className="text-sm font-medium text-slate-300">Freeze Authority (optional)</Label>
                    <Input
                      id="nft-freeze"
                      placeholder="Solana public key (optional)"
                      value={nftForm.freezeAuthority}
                      onChange={(e) => {
                        setNftForm({ ...nftForm, freezeAuthority: e.target.value })
                        setFreezeAuthorityError(null)
                      }}
                      className={`rounded-xl bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-slate-400 text-white border border-slate-600/50 ${freezeAuthorityError ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {freezeAuthorityError && (
                      <p className="text-xs text-red-400 mt-1">{freezeAuthorityError}</p>
                    )}
                    <p className="text-xs text-slate-400">If provided, must be a valid Solana public key. Leave blank to disable freeze authority.</p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-300">Royalty Fee</p>
                        <p className="text-xs text-slate-400">Fixed at 5% for all NFTs</p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-300 border-0">5%</Badge>
                    </div>
                  </div>

                  <Button
                    onClick={handleNFTLaunch}
                    disabled={!connected || isLoading}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-600 hover:to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
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
                    <p className="text-center text-sm text-slate-400">Connect your wallet to mint NFTs</p>
                  )}
            </CardContent>
          </Card>
            )}
          </motion.div>
        </div>

        {/* CTA Section - COMMENTED OUT */}
        {/* <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden border border-green-400/30 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-cyan-500/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Launch?
              </h2>
              <p className="text-xl mb-8 text-slate-300 max-w-2xl mx-auto">
                Join thousands of creators who have already launched their tokens and NFTs on Gorbchain
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="h-14 px-8 text-lg bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    document.getElementById('launchpad')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Creating
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link href="/top-users">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-green-400/50 text-white hover:bg-green-500/10 transition-all duration-300 hover:scale-105">
                    <Crown className="w-5 h-5 mr-2" />
                    View Leaders
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div> */}

      </main>
      
      <Footer />
    </div>
  )
}
