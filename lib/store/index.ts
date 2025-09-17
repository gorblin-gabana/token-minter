import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import userSlice from './slices/userSlice'
import tokenSlice from './slices/tokenSlice'
import nftSlice from './slices/nftSlice'
import statsSlice from './slices/statsSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'stats'] // Only persist user and stats data
}

const rootReducer = combineReducers({
  user: userSlice,
  tokens: tokenSlice,
  nfts: nftSlice,
  stats: statsSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
