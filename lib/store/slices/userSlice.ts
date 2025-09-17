import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  _id?: string
  walletAddress: string
  isNewUser: boolean
  createdAt: string
  lastLoginAt: string
  totalTokensLaunched: number
  totalNftsLaunched: number
  profile?: {
    username?: string
    bio?: string
    avatar?: string
  }
}

export interface UserState {
  currentUser: User | null
  topUsers: Array<{
    _id: string
    walletAddress: string
    createdAt: string
    totalTokensLaunched: number
    totalNftsLaunched: number
    totalLaunches: number
    profile?: {
      username?: string
      bio?: string
      avatar?: string
    }
  }>
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  currentUser: null,
  topUsers: [],
  isAuthenticated: false,
  isLoading: false,
  error: null
}

// Async thunks
export const createOrLoginUser = createAsyncThunk(
  'user/createOrLogin',
  async (walletAddress: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users/create-or-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to create or login user')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, profile }: { userId: string; profile: Partial<User['profile']> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to update profile')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

export const fetchTopUsers = createAsyncThunk(
  'user/fetchTopUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users/top')

      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData.message || 'Failed to fetch top users')
      }

      const data = await response.json()
      return data.users
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload
      state.isAuthenticated = !!action.payload
    },
    clearUser: (state) => {
      state.currentUser = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateUserStats: (state, action: PayloadAction<{ tokensLaunched?: number; nftsLaunched?: number }>) => {
      if (state.currentUser) {
        if (action.payload.tokensLaunched !== undefined) {
          state.currentUser.totalTokensLaunched = action.payload.tokensLaunched
        }
        if (action.payload.nftsLaunched !== undefined) {
          state.currentUser.totalNftsLaunched = action.payload.nftsLaunched
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create or Login User
      .addCase(createOrLoginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrLoginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(createOrLoginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.currentUser) {
          state.currentUser.profile = { ...state.currentUser.profile, ...action.payload.profile }
        }
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Top Users
      .addCase(fetchTopUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTopUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.topUsers = action.payload
        state.error = null
      })
      .addCase(fetchTopUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setUser, clearUser, clearError, updateUserStats } = userSlice.actions
export default userSlice.reducer
