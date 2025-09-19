"use client"

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/lib/store'
import { SkeletonLoading } from '@/components/skeleton-loading'

interface ReduxProviderProps {
  children: React.ReactNode
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<SkeletonLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
