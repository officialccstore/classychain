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
  category: string
  brand: string
  rating: number
  stock: number
  reviews?: any[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          quantity,
        }),
      })
      if (response.ok) {
        showToast(`${product?.name} added to cart!`, 'success', 3000)
      } else {
        showToast('Failed to add item to cart', 'error', 3000)
      }
    } catch (error) {
      showToast('Error adding to cart', 'error', 3000)
      console.error('Failed to add to cart:', error)
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
              <span className="text-sm text-gray-500">{product.category}</span>
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
                ${product.price.toFixed(2)}
              </span>
              <p className="text-green-600 font-medium mt-2">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

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
                disabled={product.stock === 0}
                className="flex-1 bg-secondary text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button className="border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-100 transition">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold mb-4">Product Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Brand: <span className="font-medium text-gray-800">{product.brand}</span></li>
                <li>Category: <span className="font-medium text-gray-800">{product.category}</span></li>
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
