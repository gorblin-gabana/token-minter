"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Coins, 
  Search, 
  ExternalLink, 
  Copy, 
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fetchAllTokens } from "@/lib/store/slices/tokenSlice"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function TokensPage() {
  const dispatch = useAppDispatch()
  const { tokens, isLoading, totalCount } = useAppSelector((state: any) => state.tokens)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  const [isSearching, setIsSearching] = useState(false)
  
  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  useEffect(() => {
    fetchTokens()
  }, [currentPage, searchTerm, sortBy])

  const fetchTokens = async () => {
    setIsSearching(true)
    try {
      await dispatch(fetchAllTokens({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined
      })).unwrap()
    } catch (error) {
      console.error('Error fetching tokens:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900/30 to-emerald-900/20 relative overflow-hidden">
      <Navigation />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Token Launches
                </h1>
                <p className="text-slate-300">
                  Discover and explore tokens created on Gorbchain
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search tokens by name or symbol..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 h-12 rounded-2xl bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 placeholder:text-slate-400 text-white border border-slate-600/50"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
                className="gap-2 bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
              >
                {sortBy === "newest" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                {sortBy === "newest" ? "Newest" : "Oldest"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTokens}
                disabled={isSearching}
                className="gap-2 bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 backdrop-blur-sm border border-green-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Tokens</p>
                  <p className="text-2xl font-bold text-green-400">{totalCount}</p>
                </div>
                <Coins className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 backdrop-blur-sm border border-cyan-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">This Page</p>
                  <p className="text-2xl font-bold text-cyan-400">{tokens.length}</p>
                </div>
                <Filter className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Pages</p>
                  <p className="text-2xl font-bold text-emerald-400">{totalPages}</p>
                </div>
                <Calendar className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tokens Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tokens.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {tokens.map((token: any, index: number) => (
                <motion.div
                  key={token._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:from-slate-800/80 hover:to-slate-900/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-700/50 hover:border-green-400/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center overflow-hidden shadow-lg">
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
                            <Coins className={`w-6 h-6 text-white ${token.uri ? 'hidden' : ''}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-white text-lg truncate">
                              {token.name}
                            </h3>
                            <p className="text-slate-300 font-mono text-sm truncate">
                              {token.symbol}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 border-0 flex-shrink-0">
                          Token22
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Supply:</span>
                          <span className="font-mono text-white">
                            {parseInt(token.supply).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Decimals:</span>
                          <span className="font-mono text-white">
                            {token.decimals}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Status:</span>
                          <Badge 
                            className={token.isFrozen ? "bg-red-500/20 text-red-300 border-0" : "bg-green-500/20 text-green-300 border-0"}
                          >
                            {token.isFrozen ? "Frozen" : "Active"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Mint Address:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-300">
                              {formatAddress(token.mintAddress)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(token.mintAddress)}
                              className="w-6 h-6 p-0 hover:bg-slate-700/50 text-slate-400 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://gorbscan.com/token/${token.mintAddress}`, '_blank')}
                              className="w-6 h-6 p-0 hover:bg-slate-700/50 text-slate-400 hover:text-white"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{formatAddress(token.creator.walletAddress)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(token.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="gap-2 bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 ${
                          currentPage === page 
                            ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white" 
                            : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-2 bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-12 text-center">
              <Coins className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No tokens found
              </h3>
              <p className="text-slate-300 mb-6">
                {searchTerm ? "Try adjusting your search terms" : "Be the first to launch a token on Gorbchain!"}
              </p>
              <Link href="/">
                <Button className="gap-2 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white">
                  <Coins className="w-4 h-4" />
                  Launch Your Token
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
