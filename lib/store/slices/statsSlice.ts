import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface PlatformStats {
  totalTokens: number
  totalNFTs: number
  totalUsers: number
  networkTVL: number
  lastUpdated: string
}

export interface StatsState {
  platformStats: PlatformStats | null
  isLoading: boolean
  error: string | null
}

const initialState: StatsState = {
  platformStats: null,
  isLoading: false,
  error: null
}

// Async thunks
export const fetchPlatformStats = createAsyncThunk(
  'stats/fetchPlatformStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/stats/platform')
      
      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to fetch platform stats')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    updateStats: (state, action: PayloadAction<Partial<PlatformStats>>) => {
      if (state.platformStats) {
        state.platformStats = { ...state.platformStats, ...action.payload }
      }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Platform Stats
      .addCase(fetchPlatformStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.platformStats = action.payload
        state.error = null
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { updateStats, clearError } = statsSlice.actions
export default statsSlice.reducer
