"use client"

import { motion } from "framer-motion"

export function SkeletonLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 dark:from-slate-900 dark:via-green-950/20 dark:to-emerald-950/30">
      {/* Navigation Skeleton */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
              <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            <div className="w-24 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 via-emerald-100/10 to-teal-100/20 dark:from-green-900/10 dark:via-emerald-900/5 dark:to-teal-900/10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center space-y-8">
            <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            <div className="space-y-4">
              <div className="w-96 h-12 mx-auto bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              <div className="w-80 h-6 mx-auto bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="w-40 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
              <div className="w-40 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              <div className="w-16 h-6 mx-auto bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="w-20 h-4 mx-auto bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Skeleton */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 mb-16">
          <div className="w-80 h-8 mx-auto bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div className="w-96 h-6 mx-auto bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Launchpad Skeleton */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 mb-12">
          <div className="w-80 h-8 mx-auto bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div className="w-96 h-6 mx-auto bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              </div>
              <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              </div>
              <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              <div className="w-full h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
