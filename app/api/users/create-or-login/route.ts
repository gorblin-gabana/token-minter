import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { walletAddress } = await request.json()
    
    if (!walletAddress) {
      return NextResponse.json(
        { message: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    let user = await User.findOne({ walletAddress })
    
    if (user) {
      // Update last login time
      user.lastLoginAt = new Date()
      user.isNewUser = false
      await user.save()
      
      return NextResponse.json({
        user: {
          _id: user._id,
          walletAddress: user.walletAddress,
          isNewUser: false,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          totalTokensLaunched: user.totalTokensLaunched,
          totalNftsLaunched: user.totalNftsLaunched,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar
        },
        isNewUser: false,
        message: 'Welcome back!'
      })
    } else {
      // Create new user
      const newUser = new User({
        walletAddress,
        isNewUser: true,
        lastLoginAt: new Date()
      })
      
      await newUser.save()
      
      return NextResponse.json({
        user: {
          _id: newUser._id,
          walletAddress: newUser.walletAddress,
          isNewUser: true,
          createdAt: newUser.createdAt,
          lastLoginAt: newUser.lastLoginAt,
          totalTokensLaunched: newUser.totalTokensLaunched,
          totalNftsLaunched: newUser.totalNftsLaunched,
          username: newUser.username,
          bio: newUser.bio,
          avatar: newUser.avatar
        },
        isNewUser: true,
        message: 'Welcome to GorbPad! 🎉'
      })
    }
  } catch (error) {
    console.error('Error in create-or-login:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
