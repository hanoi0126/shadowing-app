/**
 * Navbar component
 */
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.svg"
              alt="Shadowing App"
              width={180}
              height={32}
              priority
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link
              href="/materials/create"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Create Material
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              History
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
