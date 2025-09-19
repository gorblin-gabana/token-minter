"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star,
  ArrowLeft,
  RefreshCw,
  Coins,
  Gem,
  Users,
  TrendingUp,
  Award,
  Zap,
  Flame
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fetchTopUsers } from "@/lib/store/slices/userSlice"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function TopUsersPage() {
  const dispatch = useAppDispatch()
  const { topUsers = [], isLoading } = useAppSelector((state: any) => state.user || {})
  
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchTopUsersData()
  }, [])

  const fetchTopUsersData = async () => {
    setIsRefreshing(true)
    try {
      await dispatch(fetchTopUsers()).unwrap()
    } catch (error) {
      console.error('Error fetching top users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch top users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
          {rank}
        </span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
        case 1:
          return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">#1 Champion</Badge>
        case 2:
          return <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">#2 Runner-up</Badge>
        case 3:
          return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">#3 Third Place</Badge>
      default:
        return <Badge variant="secondary">#{rank}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900/30 to-orange-900/20 relative overflow-hidden">
      <Navigation />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            {/* Back Arrow - COMMENTED OUT */}
            {/* <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800/50">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link> */}
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                 <Trophy className="w-6 h-6 text-white" />
               </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Top Users
                </h1>
                <p className="text-slate-300">
                  The most active creators on Gorbchain
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={fetchTopUsersData}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Users</p>
                  <p className="text-2xl font-bold text-white">{topUsers.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Launches</p>
                    <p className="text-2xl font-bold text-white">
                      {topUsers.reduce((sum: number, user: any) => sum + user.totalLaunches, 0)}
                    </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Top Creator</p>
                  <p className="text-lg font-bold text-white">
                    {topUsers[0]?.totalLaunches || 0}
                  </p>
                </div>
                 <Crown className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Avg. Launches</p>
                    <p className="text-2xl font-bold text-white">
                      {topUsers.length > 0 ? Math.round(topUsers.reduce((sum: number, user: any) => sum + user.totalLaunches, 0) / topUsers.length) : 0}
                    </p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="animate-pulse">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      <div className="flex-1 w-full">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : topUsers.length > 0 ? (
          <div className="space-y-4">
             {topUsers.map((user: any, index: number) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                 <Card className={`border-0 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                   index === 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 ring-2 ring-green-200 dark:ring-green-800' :
                   index === 1 ? 'bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20 ring-2 ring-purple-200 dark:ring-purple-800' :
                   index === 2 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 ring-2 ring-blue-200 dark:ring-blue-800' :
                   'bg-gradient-to-br from-slate-800/50 to-slate-900/50'
                 }`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                          {getRankIcon(index + 1)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white truncate">
                              {user.username || `User ${index + 1}`}
                            </h3>
                            {getRankBadge(index + 1)}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-300">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs sm:text-sm">{formatAddress(user.walletAddress)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs sm:text-sm">Joined {formatDate(user.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="text-center sm:text-left">
                          <div className="text-2xl font-bold text-white">
                            {user.totalLaunches}
                          </div>
                          <div className="text-sm text-slate-300">Total Launches</div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Coins className="w-4 h-4" />
                              <span className="font-semibold text-sm sm:text-base">{user.totalTokensLaunched || 0}</span>
                            </div>
                            <div className="text-xs text-slate-300">Tokens</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              <Gem className="w-4 h-4" />
                              <span className="font-semibold text-sm sm:text-base">{user.totalNftsLaunched || 0}</span>
                            </div>
                            <div className="text-xs text-slate-300">NFTs</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for Top 3 */}
                    {index < 3 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                          <span>Activity Level</span>
                          <span>{user.totalLaunches} launches</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                           <div 
                             className={`h-2 rounded-full ${
                               index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                               index === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                               'bg-gradient-to-r from-blue-500 to-indigo-600'
                             }`}
                            style={{ 
                              width: `${Math.min(100, (user.totalLaunches / Math.max(topUsers[0]?.totalLaunches || 1, 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No users found
              </h3>
              <p className="text-slate-300 mb-6">
                Be the first to launch tokens and NFTs on Gorbchain!
              </p>
              <Link href="/">
                <Button className="gap-2">
                  <Flame className="w-4 h-4" />
                  Start Creating
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-12">
           <Card className="border-0 bg-gradient-to-r from-green-500 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Want to be on the leaderboard?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Start launching tokens and NFTs to climb the ranks and become a top creator!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button 
                   size="lg" 
                   variant="secondary" 
                   className="bg-white text-green-600 hover:bg-green-50"
                   onClick={() => {
                     window.location.href = '/#launchpad'
                   }}
                 >
                   <Coins className="w-5 h-5 mr-2" />
                   Launch Tokens
                 </Button>
                 <Button 
                   size="lg" 
                   variant="outline" 
                   className="border-2 border-white/30 text-white hover:bg-white/10"
                   onClick={() => {
                     window.location.href = '/#launchpad'
                   }}
                 >
                   <Gem className="w-5 h-5 mr-2" />
                   Mint NFTs
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
