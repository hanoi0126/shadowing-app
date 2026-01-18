/**
 * Auth provider to initialize auth on mount and handle redirects
 */
'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

const PUBLIC_ROUTES = ['/login', '/auth/callback']

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    // Redirect to login if not authenticated and not on public route
    if (!user && !isPublicRoute) {
      router.push('/login')
    }

    // Redirect to home if authenticated and on login page
    if (user && pathname === '/login') {
      router.push('/')
    }
  }, [user, isLoading, pathname, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">🎧</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated and not on public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  if (!user && !isPublicRoute) {
    return null
  }

  return <>{children}</>
}
