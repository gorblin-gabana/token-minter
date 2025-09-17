"use client"

import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { createOrLoginUser, clearUser } from '@/lib/store/slices/userSlice'
import { fetchPlatformStats } from '@/lib/store/slices/statsSlice'
import { toast } from '@/hooks/use-toast'

export function useUser() {
  const dispatch = useAppDispatch()
  const { publicKey, connected } = useWallet()
  const { currentUser, isAuthenticated, isLoading, error } = useAppSelector((state) => state.user)

  useEffect(() => {
    if (connected && publicKey && !isAuthenticated) {
      handleWalletConnect()
    } else if (!connected && isAuthenticated) {
      handleWalletDisconnect()
    }
  }, [connected, publicKey, isAuthenticated])

  const handleWalletConnect = async () => {
    if (!publicKey) return

    try {
      const result = await dispatch(createOrLoginUser(publicKey.toBase58())).unwrap()
      
      // Show welcome message
      toast({
        title: result.isNewUser ? "🎉 Welcome to GorbPad!" : "👋 Welcome back!",
        description: result.message,
      })

      // Fetch platform stats
      dispatch(fetchPlatformStats())
    } catch (error) {
      console.error('Error connecting user:', error)
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleWalletDisconnect = () => {
    dispatch(clearUser())
    toast({
      title: "Wallet Disconnected",
      description: "You have been logged out successfully.",
    })
  }

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    handleWalletConnect,
    handleWalletDisconnect
  }
}
