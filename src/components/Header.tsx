'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, Search, LogOut, Settings } from 'lucide-react'
import { LogoWithText } from './Logo'
import Nav from './Nav'

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
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; percentage: number } | null>(null)

  // Fetch active coupon
  useEffect(() => {
    const fetchActiveCoupon = async () => {
      try {
        const res = await fetch('/api/coupons?active=true&home=true')
        if (res.ok) {
          const coupons = await res.json()
          if (coupons.length > 0) {
            setActiveCoupon({
              code: coupons[0].code,
              percentage: coupons[0].percentage
            })
          } else {
            setActiveCoupon(null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch active coupon:', error)
      }
    }
    
    fetchActiveCoupon()
    // Refresh coupon every 5 minutes
    const interval = setInterval(fetchActiveCoupon, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Calculate time until midnight
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      
      const difference = midnight.getTime() - now.getTime()
      
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      setTimeLeft({ hours, minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

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
      {/* Deal of the Day Banner */}
      {activeCoupon && (
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-xs sm:text-sm font-semibold">
              🔥 Deal of the Day: Use code{' '}
              <span className="bg-white text-gray-800 px-2 py-0.5 rounded font-bold mx-1">
                {activeCoupon.code}
              </span>{' '}
              for {activeCoupon.percentage}% off | Ends in{' '}
              <span className="inline-flex items-center gap-1 font-mono font-bold">
                <span className="bg-black text-white px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')[0]}</span>
                <span className="bg-black text-white px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')[1]}</span>
                <span className="text-white">:</span>
                <span className="bg-black text-white px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')[0]}</span>
                <span className="bg-black text-white px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')[1]}</span>
                <span className="text-white">:</span>
                <span className="bg-black text-white px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')[0]}</span>
                <span className="bg-black text-white px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')[1]}</span>
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Empty spacer for layout balance */}
        <div className="flex-1"></div>
        
        {/* Centered Logo */}
        <Link href="/" className="flex-shrink-0 hover:opacity-80 transition">
          <LogoWithText size="sm" variant="default" />
        </Link>
        
        {/* Right side: Search, Cart, User */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
          {/* Compact Search Bar */}
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-40 lg:w-48">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none ml-2 text-sm"
            />
          </div>
          
          <Link href="/cart" className="text-gray-600 hover:text-primary relative flex-shrink-0">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {!isLoading && user ? (
            <div className="relative" ref={userMenuRef}>
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
      
      {/* Navigation Bar */}
      <Nav />
    </header>
  )
}
