import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB()
    
    const { profile } = await request.json()
    const { userId } = await params
    
    if (!profile) {
      return NextResponse.json(
        { message: 'Profile data is required' },
        { status: 400 }
      )
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          profile: { ...profile },
          lastLoginAt: new Date()
        }
      },
      { new: true }
    )
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
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
        profile: user.profile
      },
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
