import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Token from '@/lib/models/Token'
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
        { symbol: { $regex: search, $options: 'i' } }
      ]
    } : {}
    
    const [tokens, totalCount] = await Promise.all([
      Token.find(searchQuery)
        .populate('creator', 'walletAddress profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Token.countDocuments(searchQuery)
    ])
    
    return NextResponse.json({
      tokens,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const tokenData = await request.json()
    
    // Create token
    const token = new Token(tokenData)
    await token.save()
    
    // Update user's token count
    await User.findByIdAndUpdate(
      tokenData.creator,
      { 
        $inc: { totalTokensLaunched: 1 },
        $push: { tokensLaunched: token._id }
      }
    )
    
    // Populate creator data
    await token.populate('creator', 'walletAddress profile')
    
    return NextResponse.json({
      token,
      message: 'Token created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
