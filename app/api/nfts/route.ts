import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import NFT from '@/lib/models/NFT'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    // Build search query
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {}
    
    const [nfts, totalCount] = await Promise.all([
      NFT.find(searchQuery)
        .populate('creator', 'walletAddress profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NFT.countDocuments(searchQuery)
    ])
    
    return NextResponse.json({
      nfts,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const nftData = await request.json()
    
    // Create NFT
    const nft = new NFT(nftData)
    await nft.save()
    
    // Update user's NFT count
    await User.findByIdAndUpdate(
      nftData.creator,
      { 
        $inc: { totalNftsLaunched: 1 },
        $push: { nftsLaunched: nft._id }
      }
    )
    
    // Populate creator data
    await nft.populate('creator', 'walletAddress profile')
    
    return NextResponse.json({
      nft,
      message: 'NFT created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating NFT:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
