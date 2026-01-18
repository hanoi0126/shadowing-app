/**
 * OAuth callback handler
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { Container } from '@/components/layout/Container'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!isSupabaseConfigured) {
          throw new Error(
            'Supabaseが未設定です。.env.local に NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してから再度ログインしてください。'
          )
        }

        // supabase-js may auto-handle OAuth redirects depending on configuration.
        // So first, check if a session is already available.
        const existing = await supabase.auth.getSession()
        if (existing.data.session) {
          router.push('/')
          return
        }

        // If not, try exchanging the PKCE code explicitly (if present).
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (data.session) {
            router.push('/')
            return
          }
        }

        throw new Error(
          'invalid request: auth code が見つかりません。/auth/callback に直接アクセスしていないか確認し、ログインからやり直してください。'
        )
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed')
        // Redirect to login after delay
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        {error ? (
          <>
            <div className="text-4xl">❌</div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-destructive">Authentication Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Completing sign in...</p>
              <p className="text-sm text-muted-foreground">Please wait while we authenticate you</p>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}
