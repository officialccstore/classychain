"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { showToast } from '@/components/Toast'
import { LogoWithText } from '@/components/Logo'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLoginSuccess = async (token: string, user: any) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    // Move pending cart to user's account
    const pendingCart = localStorage.getItem('pendingCart')
    if (pendingCart) {
      try {
        const cartItems = JSON.parse(pendingCart)
        await fetch('/api/cart/merge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ items: cartItems }),
        })
        localStorage.removeItem('pendingCart')
        try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
        showToast('Cart items transferred to your account!', 'success', 3000)
      } catch (cartError) {
        console.error('Failed to merge cart:', cartError)
      }
    }

    const urlParams = new URL(window.location.href).searchParams
    const redirect = urlParams.get('redirect') || urlParams.get('next') || (user.role === 'admin' ? '/admin' : '/products')
    window.location.href = redirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Login failed')
        return
      }

      const data = await response.json()
      await handleLoginSuccess(data.token, data.user)
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return
    setGoogleLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Google login failed')
        return
      }

      const data = await response.json()
      showToast('Signed in with Google!', 'success', 3000)
      await handleLoginSuccess(data.token, data.user)
    } catch (err) {
      setError('Google login failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleContinueAsGuest = () => {
    const urlParams = new URL(window.location.href).searchParams
    const next = urlParams.get('redirect') || urlParams.get('next') || '/products'
    window.location.href = next
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <LogoWithText size="md" variant="default" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-600 text-center mb-6">Login to your ClassyChain account</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Google Sign-In */}
        <div className="mb-4">
          <div className={googleLoading ? 'opacity-60 pointer-events-none' : ''}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed. Please try again.')}
              width="100%"
              shape="rectangular"
              theme="outline"
              text="continue_with"
              logo_alignment="left"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-black py-2 rounded-lg font-bold hover:bg-yellow-400 transition disabled:bg-gray-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 transition"
          >
            Continue as Guest
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-secondary font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
