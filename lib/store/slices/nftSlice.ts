import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface NFT {
  _id: string
  mintAddress: string
  name: string
  symbol: string
  uri: string
  description: string
  freezeAuthority?: string
  mintAuthority?: string
  updateAuthority?: string
  isFrozen: boolean
  isInitialized: boolean
  programId: string
  creator: string
  transactionSignature: string
  royaltyFee: number
  createdAt: string
  metadata?: {
    name: string
    symbol: string
    uri: string
    description: string
    updateAuthority?: string
    additionalMetadata?: any[]
  }
}

export interface NFTState {
  nfts: NFT[]
  userNfts: NFT[]
  isLoading: boolean
  error: string | null
  totalCount: number
}

const initialState: NFTState = {
  nfts: [],
  userNfts: [],
  isLoading: false,
  error: null,
  totalCount: 0
}

// Async thunks
export const fetchAllNFTs = createAsyncThunk(
  'nfts/fetchAll',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)

      const response = await fetch(`/api/nfts?${queryParams}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to fetch NFTs')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

export const fetchUserNFTs = createAsyncThunk(
  'nfts/fetchUserNFTs',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/nfts/user/${userId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to fetch user NFTs')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

export const createNFT = createAsyncThunk(
  'nfts/create',
  async (nftData: Omit<NFT, '_id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/nfts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nftData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to create NFT')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

const nftSlice = createSlice({
  name: 'nfts',
  initialState,
  reducers: {
    addNFT: (state, action: PayloadAction<NFT>) => {
      state.nfts.unshift(action.payload)
      state.totalCount += 1
    },
    clearNFTs: (state) => {
      state.nfts = []
      state.userNfts = []
      state.totalCount = 0
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All NFTs
      .addCase(fetchAllNFTs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllNFTs.fulfilled, (state, action) => {
        state.isLoading = false
        state.nfts = action.payload.nfts
        state.totalCount = action.payload.totalCount
        state.error = null
      })
      .addCase(fetchAllNFTs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch User NFTs
      .addCase(fetchUserNFTs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserNFTs.fulfilled, (state, action) => {
        state.isLoading = false
        state.userNfts = action.payload.nfts
        state.error = null
      })
      .addCase(fetchUserNFTs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create NFT
      .addCase(createNFT.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createNFT.fulfilled, (state, action) => {
        state.isLoading = false
        state.nfts.unshift(action.payload.nft)
        state.userNfts.unshift(action.payload.nft)
        state.totalCount += 1
        state.error = null
      })
      .addCase(createNFT.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { addNFT, clearNFTs, clearError } = nftSlice.actions
export default nftSlice.reducer
