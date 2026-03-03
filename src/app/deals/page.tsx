'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  mrp?: number
  image: string
  brand: string
}

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRandomProducts()
  }, [])

  const fetchRandomProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products?limit=20')
      const data = await response.json()
      
      // Get products array
      const productsArray = Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : []
      
      // Filter out products with invalid image URLs
      const validProducts = productsArray.filter((p: Product) => {
        return p.image && (p.image.startsWith('http://') || p.image.startsWith('https://') || p.image.startsWith('/'))
      })
      
      // Shuffle and take random 12 products
      const shuffled = [...validProducts].sort(() => Math.random() - 0.5)
      setProducts(shuffled.slice(0, 12))
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    setAddingId(product.id)
    try {
      const token = localStorage.getItem('token')
      
      if (token) {
        // User is logged in - add to server cart
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
          }),
        })

        if (!res.ok) throw new Error('Failed to add to cart')
        
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        // User is not logged in - add to localStorage
        const pendingCart = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        const existingIndex = pendingCart.findIndex((item: any) => item.productId === product.id)

        if (existingIndex > -1) {
          pendingCart[existingIndex].quantity += 1
        } else {
          pendingCart.push({
            productId: product.id,
            quantity: 1,
            product: { name: product.name, price: product.price, image: product.image }
          })
        }

        localStorage.setItem('pendingCart', JSON.stringify(pendingCart))
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading deals...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">🔥 Deal of the Day</h1>
          <p className="text-gray-600">Amazing deals on selected products - Limited time offers!</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}% OFF
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-3 md:p-4">
                  <Link href={`/products/${product.id}`}>
                    <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                    <h3 className="font-medium text-sm md:text-base text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg sm:text-2xl font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            ₹{product.mrp.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      className="mt-1 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                      title="Add to cart"
                    >
                      {addingId === product.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No deals available at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
