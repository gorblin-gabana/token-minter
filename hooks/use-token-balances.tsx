"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

export interface TokenBalance {
  mint: string
  amount: string
  decimals: number
  uiAmount: number
  uiAmountString: string
  symbol?: string
  name?: string
  logo?: string
  isFrozen?: boolean
  isInitialized?: boolean
  programId?: string
  supply?: string
  mintAuthority?: string
  freezeAuthority?: string
  updateAuthority?: string
  createdAt?: string
  lastUpdated?: string
}

export function useTokenBalances() {
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
  }, [connected, publicKey?.toBase58()])

  const fetchTokenBalances = async () => {
    if (!publicKey) return

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Fetching token balances for:", publicKey.toBase58())

      const response = await fetch(`/api/tokens/balances/${publicKey.toBase58()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch token balances: ${response.status}`)
      }

      const data = await response.json()
      const balances = data.balances || []

      // Sort by balance (highest first)
      balances.sort((a: TokenBalance, b: TokenBalance) => b.uiAmount - a.uiAmount)

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