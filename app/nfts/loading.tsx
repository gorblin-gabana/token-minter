import { SkeletonLoading } from "@/components/skeleton-loading"

export default function NFTsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-pink-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <SkeletonLoading className="w-10 h-10 rounded-lg" />
            <div className="flex items-center gap-3">
              <SkeletonLoading className="w-12 h-12 rounded-2xl" />
              <div>
                <SkeletonLoading className="h-8 w-48 mb-2" />
                <SkeletonLoading className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SkeletonLoading className="h-10 flex-1" />
            <div className="flex gap-2">
              <SkeletonLoading className="h-10 w-20" />
              <SkeletonLoading className="h-10 w-20" />
              <SkeletonLoading className="h-10 w-20" />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <SkeletonLoading className="w-8 h-8 rounded-lg" />
                <SkeletonLoading className="h-5 w-24" />
              </div>
              <SkeletonLoading className="h-8 w-20 mb-2" />
              <SkeletonLoading className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* NFTs Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:from-slate-800/80 hover:to-slate-900/80 transition-all duration-300">
              <div className="mb-4">
                <SkeletonLoading className="w-full h-48 rounded-xl mb-4" />
                <SkeletonLoading className="h-5 w-32 mb-2" />
                <SkeletonLoading className="h-4 w-24" />
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <SkeletonLoading className="h-4 w-16" />
                  <SkeletonLoading className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <SkeletonLoading className="h-4 w-20" />
                  <SkeletonLoading className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <SkeletonLoading className="h-4 w-24" />
                  <SkeletonLoading className="h-4 w-18" />
                </div>
              </div>
              <div className="flex gap-2">
                <SkeletonLoading className="h-6 w-16 rounded-full" />
                <SkeletonLoading className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
