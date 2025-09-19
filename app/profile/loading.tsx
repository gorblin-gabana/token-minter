import { SkeletonLoading } from "@/components/skeleton-loading"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-indigo-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <SkeletonLoading className="w-24 h-24 rounded-full mx-auto mb-4" />
                <SkeletonLoading className="h-6 w-32 mx-auto mb-2" />
                <SkeletonLoading className="h-4 w-48 mx-auto mb-4" />
                <SkeletonLoading className="h-4 w-24 mx-auto" />
              </div>
              <div className="space-y-4">
                <SkeletonLoading className="h-10 w-full" />
                <SkeletonLoading className="h-10 w-full" />
                <SkeletonLoading className="h-10 w-full" />
                <SkeletonLoading className="h-10 w-full" />
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Tokens Section Skeleton */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <SkeletonLoading className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                    <SkeletonLoading className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <SkeletonLoading className="h-5 w-32 mb-2" />
                      <SkeletonLoading className="h-4 w-24" />
                    </div>
                    <SkeletonLoading className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* NFTs Section Skeleton */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <SkeletonLoading className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-700/30 rounded-xl p-4">
                    <SkeletonLoading className="w-full h-32 rounded-lg mb-3" />
                    <SkeletonLoading className="h-5 w-24 mb-2" />
                    <SkeletonLoading className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
