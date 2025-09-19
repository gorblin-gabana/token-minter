import { SkeletonLoading } from "@/components/skeleton-loading"

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900/30 to-emerald-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section Skeleton */}
        <div className="text-center py-20 mb-16">
          <SkeletonLoading className="h-6 w-32 mx-auto mb-6 rounded-full" />
          <SkeletonLoading className="h-16 w-96 mx-auto mb-6" />
          <SkeletonLoading className="h-6 w-80 mx-auto mb-8" />
          <SkeletonLoading className="h-12 w-48 mx-auto mb-8" />
          <SkeletonLoading className="w-32 h-32 mx-auto rounded-2xl" />
        </div>

        {/* Stats Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
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

        {/* Features Section Skeleton */}
        <div className="mb-16">
          <SkeletonLoading className="h-12 w-64 mx-auto mb-4" />
          <SkeletonLoading className="h-6 w-96 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
                <SkeletonLoading className="w-16 h-16 mx-auto mb-4 rounded-2xl" />
                <SkeletonLoading className="h-6 w-32 mx-auto mb-3" />
                <SkeletonLoading className="h-4 w-48 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Launchpad Forms Section Skeleton */}
        <div className="mb-16">
          <SkeletonLoading className="h-6 w-32 mx-auto mb-4 rounded-full" />
          <SkeletonLoading className="h-12 w-80 mx-auto mb-4" />
          <SkeletonLoading className="h-6 w-96 mx-auto mb-12" />
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 shadow-inner border border-slate-700/50 mb-8">
              <div className="flex gap-2">
                <SkeletonLoading className="h-10 flex-1 rounded-xl" />
                <SkeletonLoading className="h-10 flex-1 rounded-xl" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
              <div className="space-y-6">
                <SkeletonLoading className="h-10 w-full" />
                <SkeletonLoading className="h-10 w-full" />
                <SkeletonLoading className="h-24 w-full" />
                <SkeletonLoading className="h-10 w-full" />
                <SkeletonLoading className="h-12 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section Skeleton */}
        <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden border border-green-400/30 backdrop-blur-sm">
          <SkeletonLoading className="h-12 w-80 mx-auto mb-4" />
          <SkeletonLoading className="h-6 w-96 mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SkeletonLoading className="h-12 w-48" />
            <SkeletonLoading className="h-12 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}
