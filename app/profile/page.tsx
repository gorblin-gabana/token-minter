"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Coins, 
  Gem, 
  ArrowLeft,
  ExternalLink, 
  Copy, 
  Calendar,
  Wallet,
  Trophy,
  TrendingUp,
  Activity,
  Settings,
  Edit,
  Save,
  X
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fetchUserTokens } from "@/lib/store/slices/tokenSlice"
import { fetchUserNFTs as fetchUserNFTsAction } from "@/lib/store/slices/nftSlice"
import { updateProfile, setUser } from "@/lib/store/slices/userSlice"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletBalance } from "@/hooks/use-wallet-balance"
import { useTokenBalances } from "@/hooks/use-token-balances"

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { currentUser, isAuthenticated } = useAppSelector((state: any) => state.user || { currentUser: null, isAuthenticated: false })
  const { userTokens } = useAppSelector((state: any) => state.tokens || { userTokens: [] })
  const { userNfts } = useAppSelector((state: any) => state.nfts || { userNfts: [] })
  const { balance } = useWalletBalance()
  const { tokenBalances } = useTokenBalances()
  const { publicKey } = useWallet()
  
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    username: "",
    bio: "",
    avatar: ""
  })

  // Initialize profile data from current user
  useEffect(() => {
    if (currentUser) {
      // console.log(`currentUser--->`, currentUser)
      setProfileData({
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || ""
      })
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser && isAuthenticated) {
      // Load user's tokens and NFTs
      dispatch(fetchUserTokens(currentUser._id!))
      dispatch(fetchUserNFTsAction(currentUser._id!))
    }
  }, [currentUser, isAuthenticated, dispatch])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Combine and sort recent activity (tokens and NFTs)
  const getRecentActivity = () => {
    const activities: Array<{
      id: string
      type: 'token' | 'nft'
      name: string
      symbol: string
      uri?: string
      createdAt: string
      mintAddress: string
    }> = []
    
    // Add tokens
    userTokens.forEach((token: any) => {
      activities.push({
        id: token._id,
        type: 'token',
        name: token.name,
        symbol: token.symbol,
        uri: token.uri,
        createdAt: token.createdAt,
        mintAddress: token.mintAddress
      })
    })
    
    // Add NFTs
    userNfts.forEach((nft: any) => {
      activities.push({
        id: nft._id,
        type: 'nft',
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        createdAt: nft.createdAt,
        mintAddress: nft.mintAddress
      })
    })
    
    // Sort by creation date (newest first)
    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return
    // console.log(`currentUser`, currentUser,profileData)

    try {
      const response = await fetch(`/api/users/${currentUser._id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      // Update the current user in Redux store
      dispatch(updateProfile({
        username: result.user.username,
        bio: result.user.bio,
        avatar: result.user.avatar,
      }))

      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-indigo-900/20 relative overflow-hidden">
        <Navigation />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
        
        <main className="container mx-auto px-4 py-20 relative z-10">
          <Card className="max-w-md mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Please Connect Your Wallet
              </h2>
              <p className="text-slate-300 mb-6">
                Connect your wallet to view your profile and assets
              </p>
              <Link href="/">
                <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                  <Wallet className="w-4 h-4" />
                  Go to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-indigo-900/20 relative overflow-hidden">
      <Navigation />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            {/* <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800/50">
                <ArrowLeft className="w-4 h-4" />
              
              </Button>
            </Link> */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  My Profile
                </h1>
                <p className="text-slate-300">
                  Manage your assets and profile information
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm sticky top-24 border border-slate-700/50">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      {profileData.avatar ? (
                        <Image
                          src={profileData.avatar}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                        onClick={() => {/* TODO: Implement avatar upload */}}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Username"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-700/50 text-white"
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-700/50 text-white resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveProfile} className="flex-1">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">
                        {profileData.username || "Anonymous User"}
                      </h2>
                      <p className="text-slate-300 text-sm mb-4">
                        {profileData.bio || "No bio yet"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Wallet Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">
                        {formatAddress(currentUser.walletAddress)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(currentUser.walletAddress)}
                        className="w-6 h-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">GOR Balance:</span>
                    <span className="font-mono text-white">
                      {balance.toFixed(4)} GOR
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Member Since:</span>
                    <span className="text-white">
                      {formatDate(currentUser.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="nfts">NFTs</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Coins className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {currentUser.totalTokensLaunched}
                      </div>
                      <div className="text-sm text-slate-300">Tokens Launched</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Gem className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {currentUser.totalNftsLaunched}
                      </div>
                      <div className="text-sm text-slate-300">NFTs Minted</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {currentUser.totalTokensLaunched + currentUser.totalNftsLaunched}
                      </div>
                      <div className="text-sm text-slate-300">Total Launches</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getRecentActivity().length > 0 ? (
                      <div className="space-y-4">
                        {getRecentActivity().map((activity: any) => (
                          <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {activity.uri ? (
                                <img 
                                  src={activity.uri} 
                                  alt={activity.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                />
                              ) : null}
                              {activity.type === 'token' ? (
                                <Coins className={`w-4 h-4 text-white ${activity.uri ? 'hidden' : ''}`} />
                              ) : (
                                <Gem className={`w-4 h-4 text-white ${activity.uri ? 'hidden' : ''}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white truncate">
                                  {activity.name}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {activity.type === 'token' ? 'Token' : 'NFT'}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-300 font-mono truncate">
                                {activity.symbol}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                {formatDateTime(activity.createdAt)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://gorbscan.com/token/${activity.mintAddress}`, '_blank')}
                              className="flex-shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-300">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity to show</p>
                        <p className="text-sm mt-2">Launch your first token or NFT to see activity here!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tokens Tab */}
              <TabsContent value="tokens" className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5" />
                      My Tokens ({userTokens.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userTokens.length > 0 ? (
                      <div className="space-y-4">
                        {userTokens.map((token: any) => (
                          <div key={token._id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center overflow-hidden">
                                {token.uri ? (
                                  <img 
                                    src={token.uri} 
                                    alt={token.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                ) : null}
                                <Coins className={`w-5 h-5 text-white ${token.uri ? 'hidden' : ''}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{token.name}</h4>
                                <p className="text-sm text-slate-300 font-mono">{token.symbol}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Token22</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`https://gorbscan.com/token/${token.mintAddress}`, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-300">
                        <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tokens launched yet</p>
                        <Link href="/">
                          <Button className="mt-4 gap-2">
                            <Coins className="w-4 h-4" />
                            Launch Your First Token
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* NFTs Tab */}
              <TabsContent value="nfts" className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gem className="w-5 h-5" />
                      My NFTs ({userNfts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userNfts.length > 0 ? (
                      <div className="space-y-4">
                        {userNfts.map((nft: any) => (
                          <div key={nft._id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-500 flex items-center justify-center overflow-hidden">
                                {nft.uri ? (
                                  <img 
                                    src={nft.uri} 
                                    alt={nft.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                ) : null}
                                <Gem className={`w-5 h-5 text-white ${nft.uri ? 'hidden' : ''}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{nft.name}</h4>
                                <p className="text-sm text-slate-300 font-mono">{nft.symbol}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">NFT</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`https://gorbscan.com/token/${nft.mintAddress}`, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-300">
                        <Gem className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No NFTs minted yet</p>
                        <Link href="/">
                          <Button className="mt-4 gap-2">
                            <Gem className="w-4 h-4" />
                            Mint Your First NFT
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assets Tab */}
              <TabsContent value="assets" className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Wallet Assets ({tokenBalances.length + 1})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Native GOR Balance */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">GOR</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">Gorbchain Native</h4>
                            <p className="text-sm text-slate-300">GOR</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-white">
                            {balance.toFixed(4)} GOR
                          </div>
                        </div>
                      </div>

                      {/* Token Balances */}
                      {tokenBalances.map((token) => (
                        <div onClick={() => window.open(`https://gorbscan.com/token/${token.mint}`, '_blank')} key={token.mint} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                              {token.logo ? (
                                <Image
                                  src={token.logo}
                                  alt={token.symbol || 'Token'}
                                  width={40}
                                  height={40}
                                  className="w-full h-full rounded-lg object-cover"
                                />
                              ) : (
                                <Coins className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">
                                {token.name || token.symbol || `Token-${token.mint.slice(0, 4)}`}
                              </h4>
                              <p className="text-sm text-slate-300 font-mono">
                                {token.symbol || formatAddress(token.mint)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-white">
                              {parseFloat(token.uiAmountString).toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-300">
                              {token.decimals} decimals
                            </div>
                          </div>
                        </div>
                      ))}

                      {tokenBalances.length === 0 && (
                        <div className="text-center py-8 text-slate-300">
                          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No additional tokens found in your wallet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
