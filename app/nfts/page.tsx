"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Gem, 
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
  SortDesc,
  Sparkles,
  Crown
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fetchAllNFTs } from "@/lib/store/slices/nftSlice"
import { Navigation } from "@/components/navigation"

export default function NFTsPage() {
  const dispatch = useAppDispatch()
  const { nfts, isLoading, totalCount } = useAppSelector((state: any) => state.nfts)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  const [isSearching, setIsSearching] = useState(false)
  
  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  useEffect(() => {
    fetchNFTs()
  }, [currentPage, searchTerm, sortBy])

  const fetchNFTs = async () => {
    setIsSearching(true)
    try {
      await dispatch(fetchAllNFTs({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined
      })).unwrap()
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch NFTs. Please try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 dark:from-slate-900 dark:via-purple-950/20 dark:to-pink-950/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  NFT Launches
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Discover and explore NFTs minted on Gorbchain
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search NFTs by name, symbol, or description..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 h-12 rounded-2xl border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
                className="gap-2"
              >
                {sortBy === "newest" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                {sortBy === "newest" ? "Newest" : "Oldest"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNFTs}
                disabled={isSearching}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total NFTs</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCount}</p>
                </div>
                <Gem className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Page</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{nfts.length}</p>
                </div>
                <Filter className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Royalty Fee</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">5%</p>
                </div>
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFTs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : nfts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {nfts.map((nft, index) => (
                <motion.div
                  key={nft._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden">
                    <CardContent className="p-0">
                      {/* NFT Image */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center overflow-hidden">
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
                        <div className={`absolute inset-0 flex items-center justify-center ${nft.uri ? 'hidden' : ''}`}>
                          <Gem className="w-16 h-16 text-purple-400" />
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            NFT
                          </Badge>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">
                              {nft.name}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 font-mono text-sm">
                              {nft.symbol}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              {nft.royaltyFee}%
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {nft.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Status:</span>
                            <Badge 
                              variant={nft.isFrozen ? "destructive" : "default"}
                              className={nft.isFrozen ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}
                            >
                              {nft.isFrozen ? "Frozen" : "Active"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Type:</span>
                            <span className="text-slate-900 dark:text-slate-100 font-medium">
                              Single NFT
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-500">Mint Address:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-600 dark:text-slate-400">
                                {formatAddress(nft.mintAddress)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(nft.mintAddress)}
                                className="w-6 h-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`https://gorbscan.com/token/${nft.mintAddress}`, '_blank')}
                                className="w-6 h-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{formatAddress(nft.creator.walletAddress)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(nft.createdAt)}</span>
                          </div>
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
                  className="gap-2"
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
                        className="w-10 h-10"
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
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Gem className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No NFTs found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm ? "Try adjusting your search terms" : "Be the first to mint an NFT on Gorbchain!"}
              </p>
              <Link href="/">
                <Button className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Mint Your NFT
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
