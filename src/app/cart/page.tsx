'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus, X, Phone } from 'lucide-react'
import { showToast } from '@/components/Toast'

interface CartItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    brand: string
    image?: string
  }
  sizeVariant?: { id: string; size: string } | null
  size?: string
  quantity: number
}

function PhoneModal({ onClose, onSaved }: { onClose: () => void; onSaved: (phone: string) => void }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const validate = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) return 'Phone number is required'
    if (digits.length !== 10) return 'Phone number must be 10 digits'
    if (!/^[6-9]/.test(digits)) return 'Enter a valid Indian mobile number'
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(raw)
    if (error) setError(validate(raw))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate(phone)
    if (validationError) { setError(validationError); return }

    setSaving(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) throw new Error('Failed to save')
      // Update local user data
      localStorage.setItem('user', JSON.stringify({ ...user, phone }))
      showToast('Phone number saved!', 'success', 3000)
      onSaved(phone)
    } catch {
      setError('Failed to save phone number. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-4">
          <Phone className="w-6 h-6 text-amber-500" />
        </div>

        <h2 className="text-xl font-black text-black text-center mb-1">Add Phone Number</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          We need your phone number to process your order and for delivery updates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mobile Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent">
              <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-300 text-gray-600 text-sm font-medium">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 px-3 py-2.5 outline-none text-sm"
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white py-3 rounded-lg font-bold text-sm hover:bg-amber-400 hover:text-black transition disabled:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save & Continue to Checkout'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const router = useRouter()

  const getItemKey = (item: { productId: string; sizeVariantId?: string | null }) =>
    `${item.productId}-${item.sizeVariantId || 'na'}`

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/cart', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!response.ok) {
          if (response.status === 401) {
            const pendingRaw = localStorage.getItem('pendingCart')
            if (pendingRaw) {
              const pending = JSON.parse(pendingRaw) as Array<{ productId: string; quantity: number; sizeVariantId?: string | null; size?: string }>
              if (pending.length > 0) {
                const prods = await Promise.all(pending.map(it => fetch(`/api/products/${it.productId}`).then(r => r.ok ? r.json() : null)))
                const merged = pending.map((item, i) => {
                  const p = prods[i]
                  if (!p) return null
                  return {
                    id: getItemKey(item),
                    productId: item.productId,
                    product: { id: p.id, name: p.name, price: Number(p.price ?? 0), brand: p.brand || '', image: p.image },
                    sizeVariant: item.sizeVariantId ? p.sizeVariants?.find((v: any) => v.id === item.sizeVariantId) || null : null,
                    size: item.size,
                    quantity: item.quantity,
                  } as CartItem
                }).filter(Boolean) as CartItem[]
                setCartItems(merged)
              }
            }
          }
        } else {
          const data = await response.json()
          setCartItems(Array.isArray(data) ? data : [])
        }
      } catch {
        setCartItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [])

  const removeItem = async (itemId: string) => {
    try {
      setRemovingId(itemId)
      if (isLoggedIn) {
        const token = localStorage.getItem('token')
        await fetch(`/api/cart/${itemId}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} })
      } else {
        const pending = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        localStorage.setItem('pendingCart', JSON.stringify(pending.filter((it: any) => getItemKey(it) !== itemId)))
      }
      setCartItems(prev => prev.filter(it => it.id !== itemId))
      try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
    } catch {
      // ignore
    } finally {
      setRemovingId(null)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(itemId); return }
    try {
      setUpdatingId(itemId)
      if (isLoggedIn) {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/cart/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ quantity }),
        })
        if (res.ok) {
          const updated = await res.json()
          setCartItems(prev => prev.map(it => it.id === itemId ? updated : it))
        }
      } else {
        const pending = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        localStorage.setItem('pendingCart', JSON.stringify(pending.map((it: any) => getItemKey(it) === itemId ? { ...it, quantity } : it)))
        setCartItems(prev => prev.map(it => it.id === itemId ? { ...it, quantity } : it))
      }
      try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const subtotal = cartItems.reduce((s, it) => s + it.product.price * it.quantity, 0)
  const total = subtotal

  const handleCheckout = () => {
    if (!isLoggedIn) { router.push('/login?next=/checkout'); return }

    // Check if user has a phone number
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.phone) {
      setShowPhoneModal(true)
      return
    }

    router.push('/checkout')
  }

  const handlePhoneSaved = (phone: string) => {
    setShowPhoneModal(false)
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading cart...
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-9 h-9 text-gray-300" />
          </div>
          <h1 className="text-2xl font-black text-black mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 text-sm">Looks like you haven't added any items yet</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-black text-white px-7 py-3 rounded-lg font-bold text-sm hover:bg-amber-400 hover:text-black transition">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPhoneModal && (
        <PhoneModal
          onClose={() => setShowPhoneModal(false)}
          onSaved={handlePhoneSaved}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl sm:text-4xl font-black text-black">Shopping Cart</h1>
          <p className="text-gray-400 text-sm mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 flex gap-4 hover:shadow-sm transition-shadow">
                {/* Image */}
                <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">👟</div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{item.product.brand}</p>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 hover:text-black">{item.product.name}</h3>
                      </Link>
                      {item.size && (
                        <p className="text-xs text-gray-500 mt-1">UK Size: <span className="font-semibold">{item.size}</span></p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={removingId === item.id}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-40"
                    >
                      {removingId === item.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingId === item.id}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-black text-base text-black">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black transition mt-2">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-black text-black mb-6 uppercase tracking-wide">Order Summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
                <span className="font-black text-black uppercase tracking-wide">Total</span>
                <span className="font-black text-xl text-black">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-lg font-black text-sm uppercase tracking-wide hover:bg-amber-400 hover:text-black transition"
              >
                {isLoggedIn ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isLoggedIn && (
                <p className="text-center text-xs text-gray-400 mt-3">You'll be asked to sign in or create an account</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
