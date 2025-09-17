import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import NFT from '@/lib/models/NFT'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB()
    
    const { userId } = params
    
    const nfts = await NFT.find({ creator: userId })
      .populate('creator', 'walletAddress profile')
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      nfts,
      totalCount: nfts.length
    })
  } catch (error) {
    console.error('Error fetching user NFTs:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
