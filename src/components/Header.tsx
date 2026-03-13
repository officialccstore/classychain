'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, User, Search, LogOut, Settings, X } from 'lucide-react'
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
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
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
            setActiveCoupon({ code: coupons[0].code, percentage: coupons[0].percentage })
          } else {
            setActiveCoupon(null)
          }
        }
      } catch (error) {
        // silently ignore
      }
    }
    fetchActiveCoupon()
    const interval = setInterval(fetchActiveCoupon, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Countdown to midnight
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try { setUser(JSON.parse(userData)) } catch { localStorage.removeItem('token'); localStorage.removeItem('user') }
    }
    setIsLoading(false)
  }, [])

  // Cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        if (user) {
          const token = localStorage.getItem('token')
          const response = await fetch('/api/cart', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
          if (!response.ok) { setCartCount(0); return }
          const data = await response.json()
          setCartCount(Array.isArray(data) ? data.length : Array.isArray(data?.items) ? data.items.length : 0)
          return
        }
        const pending = localStorage.getItem('pendingCart')
        setCartCount(pending ? (JSON.parse(pending) as any[]).length : 0)
      } catch { setCartCount(0) }
    }
    fetchCartCount()
    let interval: ReturnType<typeof setInterval> | undefined
    if (user) interval = setInterval(fetchCartCount, 30000)
    const onCartUpdated = () => fetchCartCount()
    window.addEventListener('cartUpdated', onCartUpdated)
    window.addEventListener('storage', onCartUpdated)
    return () => {
      if (interval) clearInterval(interval)
      window.removeEventListener('cartUpdated', onCartUpdated)
      window.removeEventListener('storage', onCartUpdated)
    }
  }, [user])

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const hideHeaderPaths = ['/login', '/register']
  if (hideHeaderPaths.includes(pathname)) return null

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  if (pathname?.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Coupon Banner */}
      {activeCoupon && (
        <div className="bg-black text-white py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide">
          Use code{' '}
          <span className="inline-block bg-amber-400 text-black font-bold px-2 py-0.5 rounded mx-1 tracking-widest text-xs">
            {activeCoupon.code}
          </span>{' '}
          for <span className="font-bold text-amber-400">{activeCoupon.percentage}% off</span>
          {' '}— Ends in{' '}
          <span className="font-mono font-bold text-amber-400">
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </span>
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Left: Search */}
        <div className="flex-1 flex items-center">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-xs">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shoes..."
                className="flex-1 border-b-2 border-black outline-none text-sm py-1 bg-transparent placeholder-gray-400"
              />
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-gray-400 hover:text-black transition">
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition text-sm"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline text-sm text-gray-400">Search...</span>
            </button>
          )}
        </div>

        {/* Center: Logo */}
        <Link href="/" className="flex-shrink-0 hover:opacity-80 transition">
          <LogoWithText size="sm" variant="default" />
        </Link>

        {/* Right: Cart + User */}
        <div className="flex-1 flex items-center justify-end gap-4 sm:gap-5">
          <Link href="/cart" className="relative text-gray-700 hover:text-black transition">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-black rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-black">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {!isLoading && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 text-gray-700 hover:text-black transition"
              >
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !isLoading ? (
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-black transition">
              Login
            </Link>
          ) : null}
        </div>
      </div>

      {/* Navigation Bar */}
      <Nav />
    </header>
  )
}
