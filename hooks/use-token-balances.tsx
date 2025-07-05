"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"

export interface TokenBalance {
  mint: string
  amount: string
  decimals: number
  uiAmount: number
  symbol?: string
  name?: string
  logo?: string
}

export function useTokenBalances() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!connected || !publicKey) {
      setTokenBalances([])
      return
    }

    fetchTokenBalances()
  }, [connected, publicKey, connection])

  const fetchTokenBalances = async () => {
    if (!publicKey) return

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Fetching token balances for:", publicKey.toBase58())

      // Get all token accounts for the wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: TOKEN_2022_PROGRAM_ID,
        }
      )

      console.log("📊 Found", tokenAccounts.value.length, "token accounts")

      const balances: TokenBalance[] = []

      for (const account of tokenAccounts.value) {
        const accountData = account.account.data.parsed.info
        const mintAddress = accountData.mint
        const tokenAmount = accountData.tokenAmount

        // Only include tokens with non-zero balance
        if (tokenAmount.uiAmount && tokenAmount.uiAmount > 0) {
          try {
            // Try to get token metadata
            const mintPubkey = new PublicKey(mintAddress)
            
            // Basic token info
            const tokenBalance: TokenBalance = {
              mint: mintAddress,
              amount: tokenAmount.amount,
              decimals: tokenAmount.decimals,
              uiAmount: tokenAmount.uiAmount,
              symbol: `TOKEN-${mintAddress.slice(0, 4)}`, // Fallback symbol
              name: `Token ${mintAddress.slice(0, 8)}...`, // Fallback name
            }

            // Try to fetch metadata if available
            try {
              const accountInfo = await connection.getAccountInfo(mintPubkey)
              if (accountInfo) {
                // Try to extract metadata from account data
                // This is a simplified approach - in production you'd use proper metadata parsing
                const metadataString = accountInfo.data.toString()
                
                // Look for common metadata patterns
                const symbolMatch = metadataString.match(/"symbol":"([^"]*)"/)
                const nameMatch = metadataString.match(/"name":"([^"]*)"/)
                
                if (symbolMatch) tokenBalance.symbol = symbolMatch[1]
                if (nameMatch) tokenBalance.name = nameMatch[1]
              }
            } catch (metadataError) {
              // Metadata fetch failed, use fallback values
              console.log("⚠️ Could not fetch metadata for", mintAddress)
            }

            balances.push(tokenBalance)
          } catch (error) {
            console.error("Error processing token account:", error)
          }
        }
      }

      // Sort by balance (highest first)
      balances.sort((a, b) => b.uiAmount - a.uiAmount)

      console.log("✅ Fetched", balances.length, "token balances")
      setTokenBalances(balances)

    } catch (err) {
      console.error("❌ Error fetching token balances:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch token balances")
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    if (connected && publicKey) {
      fetchTokenBalances()
    }
  }

  return {
    tokenBalances,
    loading,
    error,
    refetch,
  }
} 