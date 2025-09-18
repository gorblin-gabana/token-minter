import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Find all users that don't have the new fields
    const users = await User.find({
      $or: [
        { username: { $exists: false } },
        { bio: { $exists: false } },
        { avatar: { $exists: false } }
      ]
    })

    console.log(`Found ${users.length} users to migrate`)

    // Update each user to include the new fields
    const updatePromises = users.map(async (user) => {
      const updateData: any = {}
      
      if (!user.username) {
        updateData.username = undefined // Keep as undefined, not null
      }
      if (!user.bio) {
        updateData.bio = undefined
      }
      if (!user.avatar) {
        updateData.avatar = undefined
      }

      if (Object.keys(updateData).length > 0) {
        return User.findByIdAndUpdate(
          user._id,
          { $set: updateData },
          { new: true }
        )
      }
      return user
    })

    const updatedUsers = await Promise.all(updatePromises)
    
    console.log(`Successfully migrated ${updatedUsers.length} users`)

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${updatedUsers.length} users`,
      migratedCount: updatedUsers.length
    })

  } catch (error) {
    console.error('Error migrating users:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
