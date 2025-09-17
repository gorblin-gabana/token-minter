import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Token {
  _id: string
  mintAddress: string
  name: string
  symbol: string
  supply: string
  decimals: number
  uri?: string
  freezeAuthority?: string
  mintAuthority: string
  updateAuthority: string
  isFrozen: boolean
  isInitialized: boolean
  programId: string
  creator: string
  transactionSignature: string
  createdAt: string
  metadata?: {
    name: string
    symbol: string
    uri?: string
    updateAuthority: string
    additionalMetadata?: any[]
  }
}

export interface TokenState {
  tokens: Token[]
  userTokens: Token[]
  isLoading: boolean
  error: string | null
  totalCount: number
}

const initialState: TokenState = {
  tokens: [],
  userTokens: [],
  isLoading: false,
  error: null,
  totalCount: 0
}

// Async thunks
export const fetchAllTokens = createAsyncThunk(
  'tokens/fetchAll',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)

      const response = await fetch(`/api/tokens?${queryParams}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to fetch tokens')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

export const fetchUserTokens = createAsyncThunk(
  'tokens/fetchUserTokens',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tokens/user/${userId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to fetch user tokens')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

export const createToken = createAsyncThunk(
  'tokens/create',
  async (tokenData: Omit<Token, '_id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to create token')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    addToken: (state, action: PayloadAction<Token>) => {
      state.tokens.unshift(action.payload)
      state.totalCount += 1
    },
    clearTokens: (state) => {
      state.tokens = []
      state.userTokens = []
      state.totalCount = 0
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Tokens
      .addCase(fetchAllTokens.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.isLoading = false
        state.tokens = action.payload.tokens
        state.totalCount = action.payload.totalCount
        state.error = null
      })
      .addCase(fetchAllTokens.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch User Tokens
      .addCase(fetchUserTokens.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserTokens.fulfilled, (state, action) => {
        state.isLoading = false
        state.userTokens = action.payload.tokens
        state.error = null
      })
      .addCase(fetchUserTokens.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Token
      .addCase(createToken.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.tokens.unshift(action.payload.token)
        state.userTokens.unshift(action.payload.token)
        state.totalCount += 1
        state.error = null
      })
      .addCase(createToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { addToken, clearTokens, clearError } = tokenSlice.actions
export default tokenSlice.reducer
