"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const messages = [
  "Welcome to GorbPad! 🚀",
  "Create tokens in seconds! ⚡",
  "No coding required! 💻",
  "Built on Gorbchain! 🔗",
  "Secure & fast! 🛡️",
  "Join the revolution! 🌟",
  "Your crypto dreams await! 💎",
  "Start building today! 🏗️"
]

export function MascotThoughtCloud() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
        setIsVisible(true)
      }, 300)
    }, 3000) // 3 seconds per message

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="hidden lg:block absolute -top-16 left-1/2 transform -translate-x-1/2 z-30">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="relative"
      >
        {/* Thought bubble */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-4 py-3 shadow-2xl border border-green-400/30 relative">
          {/* Tail */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/20"></div>
          </div>
          
          {/* Message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-semibold text-white text-center whitespace-nowrap drop-shadow-lg"
            >
              {messages[currentMessageIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating particles around the bubble */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400/40 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1
              }}
              style={{
                left: `${30 + i * 40}%`,
                top: `${15 + i * 25}%`
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
