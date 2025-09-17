import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Token from '@/lib/models/Token'
import NFT from '@/lib/models/NFT'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const [totalTokens, totalNFTs, totalUsers] = await Promise.all([
      Token.countDocuments(),
      NFT.countDocuments(),
      User.countDocuments()
    ])
    
    // Calculate network TVL (simplified - in production you'd calculate actual value)
    const networkTVL = 0 // This would be calculated based on token values
    
    const stats = {
      totalTokens,
      totalNFTs,
      totalUsers,
      networkTVL,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
