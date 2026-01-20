'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { showToast } from '@/components/Toast'
import { LogoWithText } from '@/components/Logo'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category?: { id: string; name: string } | string
  categoryId?: string
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adding, setAdding] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

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
          
          // Also preselect the first size
          if (firstAvailable) {
            const sizes = firstAvailable.size.includes(',') 
              ? firstAvailable.size.split(',').map((s: string) => s.trim()) 
              : [firstAvailable.size];
            setSelectedSize(sizes[0]);
          }
        }
        
        // Fetch related products from same category
        if (data?.categoryId || data?.category?.id) {
          const categoryId = data.categoryId || data.category?.id
          const relatedResponse = await fetch(`/api/products?categoryId=${categoryId}&limit=4`)
          const relatedData = await relatedResponse.json()
          const products = Array.isArray(relatedData) ? relatedData : relatedData.products || []
          // Filter out current product
          setRelatedProducts(products.filter((p: Product) => p.id !== data.id).slice(0, 4))
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
    if (!selectedSize) {
      showToast('Please select a size first', 'error', 3000);
      return;
    }
    
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
            size: selectedSize,
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
        const existing = pendingCart.find((it: any) => it.productId === product?.id && it.sizeVariantId === selectedVariantId && it.size === selectedSize)
        if (existing) existing.quantity += quantity
        else pendingCart.push({ productId: product?.id, quantity, sizeVariantId: selectedVariantId, size: selectedSize })
        localStorage.setItem('pendingCart', JSON.stringify(pendingCart))
        showToast(`${product?.name} (Size ${selectedSize}) added to cart!`, 'success', 3000)
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
          <div className="bg-gray-200 rounded-lg h-96 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">
                👟
              </div>
            )}
          </div>

          <div>
              <div className="mb-4">
              <span className="text-sm text-gray-500">{(product as any).category?.name || (product as any).category || (product as any).categoryId}</span>
              <h1 className="text-4xl font-bold mt-2 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.brand}</p>
            </div>

            {product.reviews && product.reviews.length > 0 && (
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
                  ({product.reviews.length} reviews)
                </span>
              </div>
            )}

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">
                ₹{product.price.toFixed(2)}
              </span>
              <p className="font-medium mt-2">
                {(() => {
                  if (selectedVariantId && product.sizeVariants) {
                    const selectedVariant = product.sizeVariants.find(v => v.id === selectedVariantId);
                    if (selectedVariant) {
                      return selectedVariant.quantity > 0 
                        ? <span className="text-green-600">{selectedVariant.quantity} in stock{selectedSize ? ` (Size ${selectedSize})` : ''}</span>
                        : <span className="text-red-600">Out of stock</span>;
                    }
                  }
                  const totalStock = product.sizeVariants?.reduce((sum, v) => sum + (v.quantity || 0), 0) || product.stock || 0;
                  return totalStock > 0 
                    ? <span className="text-green-600">{totalStock} in stock</span> 
                    : <span className="text-red-600">Out of stock</span>;
                })()}
              </p>
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Size selection */}
            {product.sizeVariants && product.sizeVariants.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">Select Size</h4>
                <div className="flex flex-wrap gap-3">
                  {product.sizeVariants.map((v, idx) => {
                    // Handle both single size and comma-separated sizes
                    const sizes = v.size.includes(',') ? v.size.split(',').map(s => s.trim()) : [v.size];
                    
                    return sizes.map((size, sizeIdx) => (
                      <button
                        key={`${v.id}-${sizeIdx}`}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setSelectedSize(size);
                        }}
                        disabled={v.quantity === 0}
                        className={`
                          min-w-[60px] px-4 py-3 border-2 rounded-lg font-semibold text-sm transition-all
                          ${selectedVariantId === v.id && selectedSize === size
                            ? 'bg-white text-black border-black' 
                            : 'bg-black text-white border-black hover:bg-gray-800'
                          }
                          ${v.quantity === 0 
                            ? 'opacity-40 cursor-not-allowed line-through' 
                            : 'cursor-pointer'
                          }
                        `}
                      >
                        {size}
                        {v.quantity === 0 && <span className="block text-xs mt-0.5">Out</span>}
                      </button>
                    ));
                  })}
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
                disabled={(() => {
                  const totalStock = product.sizeVariants?.reduce((sum, v) => sum + (v.quantity || 0), 0) || product.stock || 0;
                  return totalStock === 0 || adding;
                })()}
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {relatedProduct.image ? (
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-6xl">
                          👟
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-yellow-500 transition line-clamp-2 text-sm">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-black text-black mt-1">₹{relatedProduct.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <LogoWithText size="md" variant="light" />
              </div>
              <p className="text-gray-400">
                Premium footwear for those who dare to stand out. Quality,
                style, and comfort in every step.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/products" className="hover:text-yellow-400">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=running"
                    className="hover:text-yellow-400"
                  >
                    Running
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=casual"
                    className="hover:text-yellow-400"
                  >
                    Casual
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=formal"
                    className="hover:text-yellow-400"
                  >
                    Formal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Information</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-yellow-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/about#contact" className="hover:text-yellow-400">
                    Contact
                  </Link>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-yellow-400 transition">
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-yellow-400 transition">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Get in Touch</h4>
              <p className="text-gray-400 mb-2">
                Email: support@classychain.com
              </p>
              <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
              <div className="flex gap-4 mt-4">
                <button className="text-yellow-400 hover:text-yellow-300 transition">
                  Facebook
                </button>
                <button className="text-yellow-400 hover:text-yellow-300 transition">
                  Instagram
                </button>
                <button className="text-yellow-400 hover:text-yellow-300 transition">
                  Twitter
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>
              &copy; 2026 ClassyChain. All rights reserved. Premium Footwear
              Store.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
