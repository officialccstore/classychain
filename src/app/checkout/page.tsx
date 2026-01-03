'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, LogIn } from 'lucide-react'
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

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart')
        const data = await response.json()
        setCartItems(data)
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

  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  const handleFinalizeCart = async () => {
    if (!isLoggedIn) {
      // Save cart data to localStorage
      localStorage.setItem('pendingCart', JSON.stringify(cartItems))
      // Redirect to login
      router.push('/login?redirect=/checkout&pendingCart=true')
      return
    }

    // If logged in, proceed with order
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          total: total * 1.08,
        }),
      })

      if (response.ok) {
        // Clear cart after order
        await fetch('/api/cart', { method: 'DELETE' })
        router.push('/checkout?success=true')
      }
    } catch (error) {
      console.error('Failed to place order:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <LogoWithText size="md" variant="default" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some products to proceed with checkout</p>
          <Link
            href="/products"
            className="inline-block bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Order Summary</h1>

        {/* Cart Items Review */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Items in Your Order</h2>
          <div className="space-y-4 mb-6 border-b pb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.product?.name}</p>
                  <p className="text-sm text-gray-600">{item.product?.brand}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Qty: {item.quantity}</p>
                  <p className="text-sm text-gray-600">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="space-y-2 mb-6 border-b pb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-bold">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (8%)</span>
              <span className="font-bold">${(total * 0.08).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-xl font-bold mb-8">
            <span>Total</span>
            <span>${(total * 1.08).toFixed(2)}</span>
          </div>

          {/* Login Prompt or Finalize Button */}
          {!isLoggedIn ? (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <LogIn className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">Sign In Required</h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    Please sign in to your account to complete this purchase. If you don't have an account, you can create one during the login process.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <button
            onClick={handleFinalizeCart}
            className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            {isLoggedIn ? 'Place Order' : 'Proceed to Login'}
            <CheckCircle className="w-5 h-5" />
          </button>

          <Link
            href="/cart"
            className="block text-center mt-4 text-gray-600 hover:text-black font-medium"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  )
}
