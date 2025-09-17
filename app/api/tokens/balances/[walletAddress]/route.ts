import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params
    
    if (!walletAddress) {
      return NextResponse.json(
        { message: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Fetch token balances from GorbScan API
    const response = await fetch(
      `https://api.gorbscan.com/api/tokens/${walletAddress}/mints`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`GorbScan API error: ${response.status}`)
    }

    const tokenBalances = await response.json()
    
    // Transform the data to match our expected format
    const transformedBalances = tokenBalances.map((token: any) => ({
      mint: token.mintAddress || token.mint,
      amount: token.tokenAmount?.amount || '0',
      decimals: token.tokenAmount?.decimals || 0,
      uiAmount: token.tokenAmount?.uiAmount || 0,
      uiAmountString: token.tokenAmount?.uiAmountString || '0',
      symbol: token.symbol || token.metadata?.tokenMetadata?.symbol || `TOKEN-${token.mintAddress?.slice(0, 4) || 'UNK'}`,
      name: token.name || token.metadata?.tokenMetadata?.name || `Token ${token.mintAddress?.slice(0, 8) || 'Unknown'}...`,
      logo: token.uri || token.metadata?.tokenMetadata?.uri,
      isFrozen: token.isFrozen || false,
      isInitialized: token.isInitialized || false,
      programId: token.programId,
      supply: token.supply,
      mintAuthority: token.mintAuthority,
      freezeAuthority: token.freezeAuthority,
      updateAuthority: token.updateAuthority,
      createdAt: token.createdAt,
      lastUpdated: token.lastUpdated
    }))

    return NextResponse.json({
      balances: transformedBalances,
      totalCount: transformedBalances.length
    })
  } catch (error) {
    console.error('Error fetching token balances:', error)
    return NextResponse.json(
      { message: 'Failed to fetch token balances' },
      { status: 500 }
    )
  }
}
