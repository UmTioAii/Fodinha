import { useEffect, type ReactNode } from 'react'
import { bootstrapAuth } from './authStore'

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void bootstrapAuth()
  }, [])
  return <>{children}</>
}
