"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTokenBalances } from "@/hooks/use-token-balances"
import { useWalletBalance } from "@/hooks/use-wallet-balance"
import { 
  Wallet, 
  Copy, 
  LogOut, 
  Coins, 
  RefreshCw, 
  ChevronDown,
  ExternalLink
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function WalletDropdown() {
  const { publicKey, disconnect, connected } = useWallet()
  const { balance } = useWalletBalance()
  const { tokenBalances, loading: tokenLoading, refetch } = useTokenBalances()
  const [isOpen, setIsOpen] = useState(false)

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsOpen(false)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected successfully",
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatBalance = (amount: number) => {
    if (amount < 0.001) return "< 0.001"
    if (amount < 1) return amount.toFixed(6)
    if (amount < 1000) return amount.toFixed(3)
    if (amount < 1000000) return `${(amount / 1000).toFixed(1)}K`
    return `${(amount / 1000000).toFixed(1)}M`
  }

  if (!connected || !publicKey) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 rounded-2xl wallet-button-custom bg-gradient-to-r from-blue-50 to-indigo-50 from-blue-950/40 to-indigo-950/40 hover:from-blue-100 hover:to-indigo-100 hover:from-blue-950/60 dark:hover:to-indigo-950/60 transition-all duration-200 px-4 py-2 h-auto min-h-10"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatAddress(publicKey.toBase58())}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-200">
              {balance.toFixed(3)} GOR
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-200" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 rounded-2xl border-0 bg-gray-800 backdrop-blur-xl shadow-2xl p-1" 
        align="end"
        sideOffset={8}
      >
                 {/* Wallet Info Header */}
         <div className="p-4 border-b text-black border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
               <Wallet className="w-5 h-5 text-white" />
             </div>
             <div className="flex-1">
               <div className="text-sm font-medium text-gray-900 dark:!text-white">
                 Connected Wallet
               </div>
               <div className="text-xs text-gray-500 dark:!text-gray-300 font-mono">
                 {formatAddress(publicKey.toBase58())}
               </div>
             </div>
           </div>
         </div>

                 {/* SOL Balance */}
         <div className="p-3">
           <Card className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
             <CardContent className="p-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                     <span className="text-white text-xs font-bold">GOR</span>
                   </div>
                   <div>
                     <div className="text-sm font-medium text-green-900 dark:!text-green-100">
                       Gorbchain
                     </div>
                     <div className="text-xs text-green-600 dark:!text-green-300">
                       Native Token
                     </div>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-sm font-bold text-green-900 dark:!text-green-100">
                     {balance.toFixed(4)}
                   </div>
                   <div className="text-xs text-green-600 dark:!text-green-300">
                     GOR
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>

        {/* Token Balances */}
        <div className="p-3 pt-0">
                     <div className="flex items-center justify-between mb-2">
             <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:!text-gray-300 p-0">
               TOKEN BALANCES
             </DropdownMenuLabel>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={refetch}
              className="h-6 w-6 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
              disabled={tokenLoading}
            >
              <RefreshCw className={`w-3 h-3 text-gray-500 dark:!text-gray-300 ${tokenLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-1 max-h-60 overflow-y-auto">
                         {tokenLoading ? (
               <div className="text-xs text-gray-500 dark:!text-gray-300 text-center py-4">
                 Loading tokens...
               </div>
             ) : tokenBalances.length > 0 ? (
               tokenBalances.map((token) => (
                 <Card key={token.mint} className="rounded-lg border-0 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                   <CardContent className="p-2">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                           <Coins className="w-3 h-3 text-white" />
                         </div>
                         <div>
                           <div className="text-xs font-medium text-gray-900 dark:!text-white">
                             {token.symbol || `TOKEN-${token.mint.slice(0, 4)}`}
                           </div>
                           <div className="text-xs text-gray-500 dark:!text-gray-300 font-mono">
                             {formatAddress(token.mint)}
                           </div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-xs font-medium text-gray-900 dark:!text-white">
                           {formatBalance(token.uiAmount)}
                         </div>
                         <Badge variant="secondary" className="text-xs h-4 px-1 dark:bg-gray-600 dark:!text-gray-200">
                           Token22
                         </Badge>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))
             ) : (
               <div className="text-xs text-gray-500 dark:!text-gray-300 text-center py-4">
                 No tokens found
               </div>
             )}
          </div>
        </div>

                 <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-600" />

         {/* Action Items */}
         <div className="p-1 space-y-0.5">
           <DropdownMenuItem 
             onClick={copyAddress}
             className="rounded-xl cursor-pointer flex items-center gap-3 p-3 text-sm font-medium bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:!text-white"
           >
             <Copy className="w-4 h-4" />
             Copy Address
           </DropdownMenuItem>

           <DropdownMenuItem 
             onClick={() => window.open(`https://gorbscan.com/address/${publicKey.toBase58()}`, '_blank')}
             className="rounded-xl cursor-pointer flex items-center gap-3 p-3 text-black text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 dark:!text-white"
           >
             <ExternalLink className="w-4 h-4" />
             View on GorbScan
           </DropdownMenuItem>

           <DropdownMenuItem 
             onClick={handleDisconnect}
             className="rounded-xl cursor-pointer flex items-center gap-3 p-3 text-sm font-medium text-red-600 dark:!text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
           >
             <LogOut className="w-4 h-4" />
             Disconnect
           </DropdownMenuItem>
         </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 