'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight } from 'lucide-react'

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
  sizeVariant?: {
    id: string
    size: string
  } | null
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
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
            // Fallback to pending cart in localStorage for guests
            const pendingRaw = localStorage.getItem('pendingCart')
            if (pendingRaw) {
              const pending = JSON.parse(pendingRaw) as Array<{ productId: string; quantity: number; sizeVariantId?: string | null }>
              if (pending.length > 0) {
                // Fetch product details for each item to display name/price/brand
                const products = await Promise.all(
                  pending.map((item) => fetch(`/api/products/${item.productId}`).then((res) => (res.ok ? res.json() : null)))
                )

                const merged = pending
                  .map((item, idx) => {
                    const product = products[idx]
                    if (!product) return null
                    return {
                      id: getItemKey(item),
                      productId: item.productId,
                      product: {
                        id: product.id,
                        name: product.name,
                        price: Number(product.price ?? 0),
                        brand: product.brand || 'Brand',
                        image: product.image,
                      },
                      sizeVariant: item.sizeVariantId
                        ? product.sizeVariants?.find((v: any) => v.id === item.sizeVariantId) || null
                        : null,
                      quantity: item.quantity,
                    } as CartItem
                  })
                  .filter(Boolean) as CartItem[]

                setCartItems(merged)
              } else {
                setCartItems([])
              }
            } else {
              setCartItems([])
            }
          } else {
            throw new Error(`Failed to fetch cart: ${response.status}`)
          }
        } else {
          const data = await response.json()
          // Ensure data is always an array
          setCartItems(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error)
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
        setCartItems(cartItems.filter((item) => item.id !== itemId))
      } else {
        // Remove from local pending cart
        const pending = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        const updatedPending = pending.filter((item: any) => getItemKey(item) !== itemId)
        localStorage.setItem('pendingCart', JSON.stringify(updatedPending))
        setCartItems(cartItems.filter((item) => item.id !== itemId))
      }
      try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setRemovingId(null)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    try {
      setUpdatingId(itemId)
      if (isLoggedIn) {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ quantity }),
        })
        if (response.ok) {
          const updatedItem = await response.json()
          setCartItems(
            cartItems.map((item) =>
              item.id === itemId ? updatedItem : item
            )
          )
        }
      } else {
        const pending = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        const updatedPending = pending.map((item: any) =>
          getItemKey(item) === itemId ? { ...item, quantity } : item
        )
        localStorage.setItem('pendingCart', JSON.stringify(updatedPending))
        setCartItems(
          cartItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        )
      }
      try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const total = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )
    : 0

  const handleCheckout = () => {
    if (!isLoggedIn) {
      router.push('/login?next=/checkout')
      return
    }
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-gray-700">
        <span className="h-5 w-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        <span>Loading cart...</span>
      </div>
    )
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
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        👟
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-1">
                      {item.product.brand}
                    </p>
                    {item.sizeVariant?.size && (
                      <p className="text-sm text-gray-700 mb-2">Size: {item.sizeVariant.size}</p>
                    )}
                    <p className="font-bold">
                      ₹{item.product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={updatingId === item.id}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-4 py-2">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={updatingId === item.id}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={removingId === item.id}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                    >
                      {removingId === item.id ? (
                        <span className="h-4 w-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
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
                  <span className="font-bold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold">₹0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-bold">₹{(total * 0.08).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span>₹{(total * 1.08).toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-secondary text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
