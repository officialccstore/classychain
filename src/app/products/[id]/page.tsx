'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { showToast } from '@/components/Toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category?: { id: string; name: string } | string
  brand: string
  rating: number
  stock?: number
  sizeVariants?: { id: string; size: string; quantity: number }[]
  reviews?: any[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()
        setProduct(data)
        // preselect first available size variant if any
        if (data?.sizeVariants && data.sizeVariants.length > 0) {
          const firstAvailable = data.sizeVariants.find((v: any) => v.quantity > 0) || data.sizeVariants[0]
          setSelectedVariantId(firstAvailable?.id || null)
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleAddToCart = async () => {
    try {
      setAdding(true)
      if (isLoggedIn) {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            productId: product?.id,
            quantity,
            sizeVariantId: selectedVariantId,
          }),
        })
        if (response.ok) {
          showToast(`${product?.name} added to cart!`, 'success', 3000)
          try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
        } else {
          showToast('Failed to add item to cart', 'error', 3000)
        }
      } else {
        // Save to pendingCart for guests
        const pendingCart = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        const existing = pendingCart.find((it: any) => it.productId === product?.id && it.sizeVariantId === selectedVariantId)
        if (existing) existing.quantity += quantity
        else pendingCart.push({ productId: product?.id, quantity, sizeVariantId: selectedVariantId })
        localStorage.setItem('pendingCart', JSON.stringify(pendingCart))
        showToast(`${product?.name} added to cart!`, 'success', 3000)
        try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) {}
      }
    } catch (error) {
      showToast('Error adding to cart', 'error', 3000)
      console.error('Failed to add to cart:', error)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center text-9xl">
            👟
          </div>

          <div>
              <div className="mb-4">
              <span className="text-sm text-gray-500">{(product as any).category?.name || (product as any).category || (product as any).categoryId}</span>
              <h1 className="text-4xl font-bold mt-2 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.brand}</p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">
                ₹{product.price.toFixed(2)}
              </span>
              <p className="text-green-600 font-medium mt-2">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Size selection */}
            {product.sizeVariants && product.sizeVariants.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2">Select Size</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizeVariants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={v.quantity === 0}
                      className={`px-3 py-2 border rounded ${selectedVariantId === v.id ? 'bg-gray-800 text-white' : ''} ${v.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {v.size} {v.quantity === 0 ? '(Out)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex-1 bg-secondary text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button className="border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-100 transition">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold mb-4">Product Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Brand: <span className="font-medium text-gray-800">{product.brand}</span></li>
                <li>Category: <span className="font-medium text-gray-800">{(product as any).category?.name || (product as any).category || (product as any).categoryId}</span></li>
                <li>Size: <span className="font-medium text-gray-800">Available sizes: 6-13</span></li>
              </ul>
            </div>
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">{review.user.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
