'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, ArrowRight } from 'lucide-react'

interface CartItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    brand: string
  }
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

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

    fetchCart()
  }, [])

  const removeItem = async (itemId: string) => {
    try {
      await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      setCartItems(cartItems.filter((item) => item.id !== itemId))
      try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (response.ok) {
        const updatedItem = await response.json()
        setCartItems(
          cartItems.map((item) =>
            item.id === itemId ? updatedItem : item
          )
        )
        try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (loading) {
    return <div className="text-center py-12">Loading cart...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block bg-secondary text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-6 flex gap-6"
                >
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                    👟
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">
                      {item.product.brand}
                    </p>
                    <p className="font-bold">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-2">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6 border-b pb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-bold">${(total * 0.08).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span>${(total * 1.08).toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="w-full bg-secondary text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
