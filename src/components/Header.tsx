'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, Search, LogOut, Settings } from 'lucide-react'
import { LogoWithText } from './Logo'

interface UserData {
  id: string
  email: string
  name: string
  role: string
}

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        // If user is logged in, prefer server-side cart
        if (user) {
          const token = localStorage.getItem('token')
          const response = await fetch('/api/cart', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          })
          if (!response.ok) {
            // Unauthorized or server error — fall back to 0
            setCartCount(0)
            return
          }
          const data = await response.json()
          const count = Array.isArray(data) ? data.length : Array.isArray(data?.items) ? data.items.length : 0
          setCartCount(count)
          return
        }

        // If not logged in, read pending cart from localStorage
        const pending = localStorage.getItem('pendingCart')
        if (pending) {
          const parsed = JSON.parse(pending)
          setCartCount(Array.isArray(parsed) ? parsed.length : 0)
        } else {
          setCartCount(0)
        }
      } catch (error) {
        console.error('Failed to fetch cart count:', error)
        setCartCount(0)
      }
    }

    fetchCartCount()

    // Refresh cart count every 30 seconds when logged in
    let interval: ReturnType<typeof setInterval> | undefined
    if (user) {
      interval = setInterval(fetchCartCount, 30000)
    }

    const onCartUpdated = () => fetchCartCount()
    // Listen for custom cart update events and storage changes
    window.addEventListener('cartUpdated', onCartUpdated)
    window.addEventListener('storage', onCartUpdated)

    return () => {
      if (interval) clearInterval(interval)
      window.removeEventListener('cartUpdated', onCartUpdated)
      window.removeEventListener('storage', onCartUpdated)
    }
  }, [user])

  // Hide header on login, register, and other auth pages
  const hideHeaderPaths = ['/login', '/register']
  if (hideHeaderPaths.includes(pathname)) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 bg-white shadow z-50">
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex-shrink-0 hover:opacity-80 transition">
          <LogoWithText size="sm" variant="default" />
        </Link>
        <div className="hidden sm:flex flex-1 mx-4">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 sm:px-4 py-2 w-full">
            <Search className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search shoes..."
              className="flex-1 bg-transparent outline-none ml-2 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/cart" className="text-gray-600 hover:text-primary relative flex-shrink-0">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {!isLoading && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-primary flex-shrink-0"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline max-w-xs truncate">{user.name}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                  <p className="px-4 py-2 text-xs sm:text-sm text-gray-600 border-b truncate">{user.email}</p>
                  {user.role === 'admin' ? (
                    <>
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                        <Settings className="w-4 h-4 flex-shrink-0" />
                        Admin Panel
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                        <User className="w-4 h-4 flex-shrink-0" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-gray-600 hover:text-primary font-medium text-sm">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
