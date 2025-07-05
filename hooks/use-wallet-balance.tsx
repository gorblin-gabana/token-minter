"use client"

import { GORB_CONNECTION } from "@/lib/utils"
import { useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useEffect, useState } from "react"

export function useWalletBalance() {
  const connection = GORB_CONNECTION
  const { publicKey } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!publicKey) {
      setBalance(0)
      return
    }

    const getBalance = async () => {
      setLoading(true)
      try {
        const balance = await connection.getBalance(publicKey)
        setBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error("Error fetching balance:", error)
        setBalance(0)
      } finally {
        setLoading(false)
      }
    }

    getBalance()

    // Set up a subscription to listen for balance changes
    const subscriptionId = connection.onAccountChange(publicKey, (accountInfo) => {
      setBalance(accountInfo.lamports / LAMPORTS_PER_SOL)
    })

    return () => {
      connection.removeAccountChangeListener(subscriptionId)
    }
  }, [publicKey, connection])

  return { balance, loading }
}
