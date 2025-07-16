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
} from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWalletBalance } from "@/hooks/use-wallet-balance"
import { mintGorbToken, mintGorbNFT, mintGorbNFTToken22, mintGorbNFTToken22SingleTx, mintGorbTokenSingleTx, mintGorbNFTToken22TwoTx, mintGorbTokenTwoTx, simulateTransactionDetailed, checkTransactionStatus } from "@/lib/mint-functions"
import { WalletDropdown } from "@/components/wallet-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { GORB_CONNECTION } from "@/lib/utils"

export default function GorbaganaLaunchpad() {
  const { theme, setTheme } = useTheme()
  const { connected, publicKey, wallet } = useWallet()
  const connection = GORB_CONNECTION
  const { balance, loading: balanceLoading } = useWalletBalance()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

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
  }, [])

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
      const result = await mintGorbTokenTwoTx({
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-none px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 p-1">
                <Image
                  src="https://www.gorbchain.xyz/images/logo.png"
                  alt="Gorb Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full rounded-lg"
                  onError={(e:any) => {
                    e.currentTarget.src = "/goblin-mascot.png"
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">GorbPad</h1>
                <p className="text-sm text-muted-foreground">Token & NFT Launchpad</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {connected ? (
                <WalletDropdown />
              ) : (
                <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !rounded-2xl !border-2 !border-blue-200 dark:!border-blue-800 !px-6 !py-3 !text-sm !font-medium !text-white !shadow-lg hover:!shadow-xl !transition-all !duration-200 hover:!scale-[1.02]" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-none px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Tokens</p>
                  <p className="text-3xl font-bold text-blue-900">0</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total NFTs</p>
                  <p className="text-3xl font-bold text-purple-900">0</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Gem className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100  border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Network TVL</p>
                  <p className="text-3xl font-bold text-green-900">$0</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Active Users</p>
                  <p className="text-3xl font-bold text-orange-900">0</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Transaction Result */}
        <AnimatePresence>
          {lastTransaction && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50  border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">
                        {lastTransaction.type === "token" ? "🚀 Token Created Successfully!" : "🎨 NFT Minted Successfully!"}
                      </p>
                      <div className="flex flex-col gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-700">Transaction:</span>
                          <span className="text-sm text-green-600 font-mono">{lastTransaction.signature.slice(0, 12)}...</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(lastTransaction.signature)}
                            className="w-6 h-6 p-0 hover:bg-green-500/20 rounded"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://gorbscan.com/tx/${lastTransaction.signature}`, '_blank')}
                            className="w-6 h-6 p-0 hover:bg-green-500/20 rounded"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-700">{lastTransaction.type === "token" ? "Token Address:" : "NFT Address:"}:</span>
                          <span className="text-sm text-green-600 font-mono">{lastTransaction.address.slice(0, 12)}...</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(lastTransaction.address)}
                            className="w-6 h-6 p-0 hover:bg-green-500/20 rounded"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://gorbscan.com/token/${lastTransaction.address}`, '_blank')}
                            className="w-6 h-6 p-0 hover:bg-green-500/20 rounded"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Launchpad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Launch Panel */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-900">Token Launch</CardTitle>
                  <CardDescription className="text-blue-700">Create your own token on Gorbchain</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-name" className="text-sm font-medium text-gray-700">Token Name *</Label>
                  <Input
                    id="token-name"
                    placeholder="e.g., Gorb Token"
                    value={tokenForm.name}
                    onChange={(e) => setTokenForm({ ...tokenForm, name: e.target.value })}
                    className="rounded-xl border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-symbol" className="text-sm font-medium text-gray-700">Symbol *</Label>
                  <Input
                    id="token-symbol"
                    placeholder="e.g., GORB"
                    value={tokenForm.symbol}
                    onChange={(e) => setTokenForm({ ...tokenForm, symbol: e.target.value })}
                    className="rounded-xl border-0 bg-white/50  focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-image" className="text-sm font-medium text-gray-700">Image URL</Label>
                <Input
                  id="token-image"
                  placeholder="https://example.com/token-image.png"
                  value={tokenForm.uri}
                  onChange={(e) => setTokenForm({ ...tokenForm, uri: e.target.value })}
                  className="rounded-xl border-0 bg-white/50  focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-supply" className="text-sm font-medium text-gray-700">Initial Supply *</Label>
                  <Input
                    id="token-supply"
                    type="number"
                    placeholder="1000000"
                    value={tokenForm.supply}
                    onChange={(e) => setTokenForm({ ...tokenForm, supply: e.target.value })}
                    className="rounded-xl border-0 bg-white/50  focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-decimals" className="text-sm font-medium text-gray-700">Decimals</Label>
                  <Input
                    id="token-decimals"
                    type="number"
                    placeholder="9"
                    value={tokenForm.decimals}
                    onChange={(e) => setTokenForm({ ...tokenForm, decimals: e.target.value })}
                    className="rounded-xl border-0 bg-white/50  focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-freeze" className="text-sm font-medium text-gray-700">Freeze Authority (optional)</Label>
                <Input
                  id="token-freeze"
                  placeholder="Solana public key (optional)"
                  value={tokenForm.freezeAuthority}
                  onChange={(e) => {
                    setTokenForm({ ...tokenForm, freezeAuthority: e.target.value })
                    setTokenFreezeAuthorityError(null)
                  }}
                  className={`rounded-xl border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-500 text-gray-900 ${tokenFreezeAuthorityError ? 'ring-2 ring-red-500' : ''}`}
                />
                {tokenFreezeAuthorityError && (
                  <p className="text-xs text-red-600 mt-1">{tokenFreezeAuthorityError}</p>
                )}
                <p className="text-xs text-gray-500">If provided, must be a valid Solana public key. Leave blank to disable freeze authority.</p>
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
                <p className="text-center text-sm text-gray-600">Connect your wallet to launch tokens</p>
              )}
            </CardContent>
          </Card>

          {/* NFT Launch Panel */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-purple-900">NFT Launch</CardTitle>
                  <CardDescription className="text-purple-700">Mint unique NFTs on Gorbchain</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nft-name" className="text-sm font-medium text-gray-700">NFT Name *</Label>
                  <Input
                    id="nft-name"
                    placeholder="e.g., Gorb Genesis"
                    value={nftForm.name}
                    onChange={(e) => setNftForm({ ...nftForm, name: e.target.value })}
                    className="rounded-xl border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-gray-500 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-symbol" className="text-sm font-medium text-gray-700">Symbol *</Label>
                  <Input
                    id="nft-symbol"
                    placeholder="e.g., GGEN"
                    value={nftForm.symbol}
                    onChange={(e) => setNftForm({ ...nftForm, symbol: e.target.value })}
                    className="rounded-xl border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-gray-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nft-image" className="text-sm font-medium text-gray-700">Image/Metadata URL *</Label>
                <Input
                  id="nft-image"
                  placeholder="https://example.com/nft-metadata.json"
                  value={nftForm.uri}
                  onChange={(e) => setNftForm({ ...nftForm, uri: e.target.value })}
                  className="rounded-xl border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-gray-500 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nft-description" className="text-sm font-medium text-gray-700">Description *</Label>
                <Textarea
                  id="nft-description"
                  placeholder="Describe your NFT collection..."
                  value={nftForm.description}
                  onChange={(e) => setNftForm({ ...nftForm, description: e.target.value })}
                  className="rounded-xl border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-purple-500 min-h-[100px] resize-none placeholder:text-gray-500 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nft-freeze" className="text-sm font-medium text-gray-700">Freeze Authority (optional)</Label>
                <Input
                  id="nft-freeze"
                  placeholder="Solana public key (optional)"
                  value={nftForm.freezeAuthority}
                  onChange={(e) => {
                    setNftForm({ ...nftForm, freezeAuthority: e.target.value })
                    setFreezeAuthorityError(null)
                  }}
                  className={`rounded-xl border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-purple-500 placeholder:text-gray-500 text-gray-900 ${freezeAuthorityError ? 'ring-2 ring-red-500' : ''}`}
                />
                {freezeAuthorityError && (
                  <p className="text-xs text-red-600 mt-1">{freezeAuthorityError}</p>
                )}
                <p className="text-xs text-gray-500">If provided, must be a valid Solana public key. Leave blank to disable freeze authority.</p>
              </div>

              <div className="bg-white/30 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Royalty Fee</p>
                    <p className="text-xs text-gray-600">Fixed at 5% for all NFTs</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-700 border-0">5%</Badge>
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
                <p className="text-center text-sm text-gray-600">Connect your wallet to mint NFTs</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Secure</h3>
                  <p className="text-sm text-green-700">Enterprise-grade security</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">Fast</h3>
                  <p className="text-sm text-orange-700">Lightning-fast transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">24/7</h3>
                  <p className="text-sm text-blue-700">Always available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
