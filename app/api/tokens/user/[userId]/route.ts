import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Token from '@/lib/models/Token'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB()
    
    const { userId } = params
    
    const tokens = await Token.find({ creator: userId })
      .populate('creator', 'walletAddress profile')
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      tokens,
      totalCount: tokens.length
    })
  } catch (error) {
    console.error('Error fetching user tokens:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
