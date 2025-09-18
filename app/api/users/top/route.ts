import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Aggregate users with their launch counts
    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: 'tokens',
          localField: '_id',
          foreignField: 'creator',
          as: 'tokens'
        }
      },
      {
        $lookup: {
          from: 'nfts',
          localField: '_id',
          foreignField: 'creator',
          as: 'nfts'
        }
      },
      {
        $addFields: {
          totalTokensLaunched: { $size: '$tokens' },
          totalNftsLaunched: { $size: '$nfts' },
          totalLaunches: { $add: [{ $size: '$tokens' }, { $size: '$nfts' }] }
        }
      },
      {
        $sort: { totalLaunches: -1, createdAt: 1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 1,
          walletAddress: 1,
          createdAt: 1,
          totalTokensLaunched: 1,
          totalNftsLaunched: 1,
          totalLaunches: 1,
          username: 1,
          bio: 1,
          avatar: 1
        }
      }
    ]);

    return NextResponse.json({ 
      users: topUsers,
      total: topUsers.length 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching top users:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error.message 
    }, { status: 500 });
  }
}
