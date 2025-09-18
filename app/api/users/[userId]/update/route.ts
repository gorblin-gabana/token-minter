import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { username, bio, avatar } = body

    // Validate input
    if (!username && !bio && !avatar) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      )
    }

    // Validate username if provided
    if (username) {
      if (username.length < 3 || username.length > 20) {
        return NextResponse.json(
          { error: 'Username must be between 3 and 20 characters' },
          { status: 400 }
        )
      }

      // Check if username contains only alphanumeric characters and underscores
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          { error: 'Username can only contain letters, numbers, and underscores' },
          { status: 400 }
        )
      }

      // Check if username is unique
      const existingUser = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: userId }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    }

    // Validate bio if provided
    if (bio && bio.length > 200) {
      return NextResponse.json(
        { error: 'Bio must be 200 characters or less' },
        { status: 400 }
      )
    }

    // Validate avatar URL if provided
    if (avatar) {
      try {
        new URL(avatar)
      } catch {
        return NextResponse.json(
          { error: 'Avatar must be a valid URL' },
          { status: 400 }
        )
      }
    }

    await connectDB()

    // Update user profile
    const updateData: any = {}
    if (username) updateData.username = username.toLowerCase()
    if (bio !== undefined) updateData.bio = bio
    if (avatar) updateData.avatar = avatar

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        walletAddress: updatedUser.walletAddress,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
