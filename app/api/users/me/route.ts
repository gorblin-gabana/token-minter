import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ walletAddress })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        isNewUser: user.isNewUser,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        totalTokensLaunched: user.totalTokensLaunched,
        totalNftsLaunched: user.totalNftsLaunched,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar
      }
    })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
