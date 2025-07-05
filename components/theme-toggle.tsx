"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-2xl border-2 w-12 h-12 bg-gray-100 dark:bg-gray-800 transition-all duration-200"
      >
        <div className="w-5 h-5" />
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        rounded-2xl theme-toggle-custom w-12 h-12 transition-all duration-500 ease-out
        ${isDark 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 shadow-lg hover:shadow-yellow-500/25' 
          : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg hover:shadow-blue-500/25'
        }
        hover:scale-110 active:scale-95
      `}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
          className={`
            absolute w-5 h-5 text-white transition-all duration-500 ease-out
            ${isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-180 scale-0'
            }
          `}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`
            absolute w-5 h-5 text-white transition-all duration-500 ease-out
            ${isDark 
              ? 'opacity-0 -rotate-180 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
        />
      </div>
    </Button>
  )
} 