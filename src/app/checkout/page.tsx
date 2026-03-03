'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, LogIn, ShoppingBag } from 'lucide-react'
import { LogoWithText } from '@/components/Logo'

interface CartItem {
  id: string
  productId: string
  quantity: number
  product?: {
    id: string
    name: string
    price: number
    brand: string
  }
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full shadow-lg border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-8">Thank you for your purchase. We'll notify you when your order ships.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/cart', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await response.json()
        // Ensure we always set an array for cart items. API may return
        // { error } or { items: [...] } in some cases — normalize it.
        const normalized = Array.isArray(data) ? data : (data?.items || [])
        setCartItems(normalized)
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      } finally {
        setLoading(false)
      }
    }

    // Check if user is logged in
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    fetchCart()
  }, [])

  // Guard reduce in case cartItems is unexpectedly not an array at runtime.
  const total = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
    : 0

  const handleFinalizeCart = async () => {
    if (!isLoggedIn) {
      // Save cart data to localStorage
      localStorage.setItem('pendingCart', JSON.stringify(cartItems))
      try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
      // Redirect to login
      router.push('/login?redirect=/checkout&pendingCart=true')
      return
    }

    // If logged in, proceed with order
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          items: cartItems,
          total: total * 1.08,
        }),
      });

      if (response.ok) {
        // Clear cart after order
        await fetch('/api/cart', { 
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
        router.push('/checkout?success=true')
      }
    } catch (error) {
      console.error('Failed to place order:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading your order...
        </div>
      </div>
    )
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🛍️</div>
          <h1 className="text-2xl font-black mb-2">Nothing to check out</h1>
          <p className="text-gray-500 mb-6 text-sm">Add products to your cart before checking out</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-black text-white px-7 py-3 rounded-lg font-bold text-sm hover:bg-amber-400 hover:text-black transition">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = total
  const tax = subtotal * 0.08
  const grandTotal = subtotal + tax

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Almost there</p>
          <h1 className="text-3xl sm:text-4xl font-black text-black">Order Summary</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Items */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-black uppercase tracking-wide text-sm">Items in Your Order</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {cartItems.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 line-clamp-2">{item.product?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.product?.brand} · Qty: {item.quantity}</p>
                  </div>
                  <p className="font-black text-sm text-black whitespace-nowrap">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + CTA */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-black text-black uppercase tracking-wide text-sm mb-5">Price Details</h3>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-gray-900">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
                <span className="font-black text-black uppercase tracking-wide text-sm">Total</span>
                <span className="font-black text-xl text-black">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {!isLoggedIn && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                  <LogIn className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium">You'll be redirected to sign in to complete your purchase</p>
                </div>
              )}

              <button
                onClick={handleFinalizeCart}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-lg font-black text-sm uppercase tracking-wide hover:bg-amber-400 hover:text-black transition"
              >
                {isLoggedIn ? 'Place Order' : 'Sign In to Order'}
                <CheckCircle className="w-4 h-4" />
              </button>
              <Link href="/cart" className="block text-center mt-3 text-xs text-gray-400 hover:text-black transition font-medium">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
