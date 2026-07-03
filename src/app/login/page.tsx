"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { LogoWithText } from '@/components/Logo'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { Phone, ArrowLeft, RefreshCw } from 'lucide-react'

type Step = 'phone' | 'otp' | 'profile'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [setupToken, setSetupToken] = useState('')
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [googleSetupToken, setGoogleSetupToken] = useState('')
  const [googleName, setGoogleName] = useState('')
  const [googleEmail, setGoogleEmail] = useState('')

  const handleLoginSuccess = async (token: string, user: any) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    const pendingCart = localStorage.getItem('pendingCart')
    if (pendingCart) {
      try {
        const cartItems = JSON.parse(pendingCart)
        await fetch('/api/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: cartItems }),
        })
        localStorage.removeItem('pendingCart')
        showToast('Cart items transferred to your account!', 'success', 3000)
      } catch {}
    }

    // Migrate guest deal cart items into DB
    const rawDealCart = localStorage.getItem('dealCart')
    if (rawDealCart) {
      try {
        const dealItems = JSON.parse(rawDealCart) as Array<{ dealProductId: string; size: string; quantity: number }>
        await Promise.all(
          dealItems.map(it =>
            fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ dealProductId: it.dealProductId, size: it.size, quantity: it.quantity }),
            })
          )
        )
        localStorage.removeItem('dealCart')
      } catch {}
    }

    try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}

    const urlParams = new URL(window.location.href).searchParams
    const redirect = urlParams.get('redirect') || urlParams.get('next') || (user.role === 'admin' ? '/admin' : '/')
    window.location.href = redirect
  }

  const startResendCooldown = () => {
    setResendCooldown(30)
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return }
      setStep('otp')
      startResendCooldown()
      showToast('OTP sent to your number!', 'success', 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, ...(googleSetupToken ? { googleSetupToken } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid OTP'); return }
      if (data.isNewUser) {
        setSetupToken(data.setupToken)
        setStep('profile')
        return
      }
      showToast(googleSetupToken ? 'Account created! Welcome to ClassyChain.' : 'Logged in successfully!', 'success', 2000)
      setGoogleSetupToken('')
      await handleLoginSuccess(data.token, data.user)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setOtp('')
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to resend OTP'); return }
      startResendCooldown()
      showToast('New OTP sent!', 'success', 2000)
    } catch {
      setError('Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteProfile = async () => {
    if (!profileName.trim()) { setError('Please enter your name'); return }
    if (!profileEmail.trim()) { setError('Please enter your email'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileEmail.trim())) { setError('Enter a valid email address'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/otp/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupToken, name: profileName, email: profileEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create account'); return }
      showToast('Account created! Welcome to ClassyChain.', 'success', 3000)
      await handleLoginSuccess(data.token, data.user)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return
    setGoogleLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Google login failed'); return }
      if (data.isNewUser) {
        // New Google account: verify a phone number via OTP before creating it.
        setGoogleSetupToken(data.googleSetupToken)
        setGoogleName(data.name || '')
        setGoogleEmail(data.email || '')
        setStep('phone')
        return
      }
      showToast('Signed in with Google!', 'success', 3000)
      await handleLoginSuccess(data.token, data.user)
    } catch {
      setError('Google login failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const cancelGoogleSignup = () => {
    setGoogleSetupToken('')
    setGoogleName('')
    setGoogleEmail('')
    setStep('phone')
    setPhone('')
    setOtp('')
    setError('')
  }

  const handleContinueAsGuest = () => {
    const urlParams = new URL(window.location.href).searchParams
    window.location.href = urlParams.get('redirect') || urlParams.get('next') || '/products'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <LogoWithText size="md" variant="default" />
        </div>
        <h1 className="text-2xl font-black text-center text-gray-900 mb-1">Welcome Back</h1>
        <p className="text-gray-500 text-center text-sm mb-6">Sign in to your ClassyChain account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Google Sign-In — hidden on profile setup step and mid Google-signup phone verification */}
        {step !== 'profile' && !googleSetupToken && (
          <>
            <div className={`mb-5 ${googleLoading ? 'opacity-60 pointer-events-none' : ''}`}>
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

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </>
        )}

        {/* Continuing a Google signup: ask for + verify phone before creating the account */}
        {googleSetupToken && step !== 'profile' && (
          <div className="flex items-start justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
            <p className="text-xs text-amber-800 font-medium">
              Signed in as <span className="font-bold">{googleName}</span> ({googleEmail}). Verify your mobile number to finish creating your account.
            </p>
            <button onClick={cancelGoogleSignup} className="text-xs font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap">
              Cancel
            </button>
          </div>
        )}

        {/* Profile Setup (new users only) */}
        {step === 'profile' ? (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm font-semibold text-gray-700">One last step — tell us about yourself</p>
              <p className="text-xs text-gray-400 mt-0.5">Verified: +91 {phone}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileName}
                onChange={e => { setProfileName(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCompleteProfile()}
                placeholder="Your full name"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={e => { setProfileEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCompleteProfile()}
                placeholder="you@email.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
            <button
              onClick={handleCompleteProfile}
              disabled={loading || !profileName.trim() || !profileEmail.trim()}
              className="w-full bg-black text-white py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : 'Create Account'}
            </button>
          </div>
        ) : /* Phone OTP */ step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition">
                <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-sm font-semibold text-gray-500 select-none">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  placeholder="Enter 10-digit number"
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                />
              </div>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Phone className="w-4 h-4" /> Send OTP</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                className="text-gray-400 hover:text-black transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-600">
                OTP sent to <span className="font-bold text-black">+91 {phone}</span>
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Enter 6-digit OTP
              </label>
              <input
                type="tel"
                maxLength={6}
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                placeholder="• • • • • •"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                autoFocus
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full bg-black text-white py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : 'Verify & Login'}
            </button>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        )}

        {step !== 'profile' && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={handleContinueAsGuest}
              className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-lg font-semibold text-sm hover:border-gray-400 hover:text-black transition"
            >
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
