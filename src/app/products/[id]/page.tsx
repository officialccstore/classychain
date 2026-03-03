'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, ArrowRight, Truck, RefreshCw, Shield } from 'lucide-react'
import { showToast } from '@/components/Toast'
import { LogoWithText } from '@/components/Logo'

interface Product {
  id: string
  name: string
  description: string
  mrp?: number
  price: number
  image: string
  images?: string[]
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()
        setProduct(data)
        if (data?.sizeVariants?.length > 0) {
          const first = data.sizeVariants.find((v: any) => v.quantity > 0) || data.sizeVariants[0]
          setSelectedVariantId(first?.id || null)
          if (first) {
            const sizes = first.size.includes(',') ? first.size.split(',').map((s: string) => s.trim()) : [first.size]
            setSelectedSize(sizes[0])
          }
        }
        if (data?.categoryId || data?.category?.id) {
          const categoryId = data.categoryId || data.category?.id
          const relRes = await fetch(`/api/products?categoryId=${categoryId}&limit=5`)
          const relData = await relRes.json()
          const arr = Array.isArray(relData) ? relData : relData.products || []
          setRelatedProducts(arr.filter((p: Product) => p.id !== data.id).slice(0, 4))
        }
      } catch {
        // silently ignore
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showToast('Please select a size first', 'error', 3000)
      return
    }
    try {
      setAdding(true)
      if (isLoggedIn) {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ productId: product?.id, quantity, sizeVariantId: selectedVariantId, size: selectedSize }),
        })
        if (res.ok) {
          showToast(`Added to cart!`, 'success', 3000)
          try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
        } else {
          showToast('Failed to add item to cart', 'error', 3000)
        }
      } else {
        const pendingCart = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        const existing = pendingCart.find((it: any) => it.productId === product?.id && it.sizeVariantId === selectedVariantId && it.size === selectedSize)
        if (existing) existing.quantity += quantity
        else pendingCart.push({ productId: product?.id, quantity, sizeVariantId: selectedVariantId, size: selectedSize })
        localStorage.setItem('pendingCart', JSON.stringify(pendingCart))
        showToast(`Added to cart!`, 'success', 3000)
        try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
      }
    } catch {
      showToast('Error adding to cart', 'error', 3000)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-gray-100 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-10 bg-gray-100 rounded w-1/2 mt-4" />
              <div className="h-24 bg-gray-100 rounded mt-4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-black mb-2">Product not found</h1>
          <Link href="/products" className="text-sm font-bold text-black underline">Back to products</Link>
        </div>
      </div>
    )
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean)
  const totalStock = product.sizeVariants?.reduce((s, v) => s + (v.quantity || 0), 0) || product.stock || 0
  const categoryName = (product as any).category?.name || (product as any).category || ''
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition">Products</Link>
          {categoryName && <><span>/</span><span className="text-gray-600">{categoryName}</span></>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

          {/* Image Gallery */}
          <div>
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square group">
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(i => (i - 1 + allImages.length) % allImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(i => (i + 1) % allImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-gray-50"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button key={i} onClick={() => setCurrentImageIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-6 bg-black' : 'w-1.5 bg-black/30'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">👟</div>
              )}
              {discount && (
                <div className="absolute top-4 left-4 bg-black text-white text-xs font-black px-2.5 py-1 rounded-lg">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === currentImageIndex ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {categoryName && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{categoryName}</p>
            )}
            <h1 className="text-3xl sm:text-4xl font-black text-black mb-1 leading-tight">{product.name}</h1>
            {product.brand && <p className="text-sm text-gray-500 font-medium mb-5">{product.brand}</p>}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <span className="text-3xl font-black text-black">₹{product.price.toLocaleString('en-IN')}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through font-medium">₹{product.mrp.toLocaleString('en-IN')}</span>
                  <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-lg">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm font-bold mb-6 ${totalStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {totalStock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
            </p>

            <p className="text-gray-600 text-sm leading-relaxed mb-7">{product.description}</p>

            {/* Size Selection */}
            {product.sizeVariants && product.sizeVariants.length > 0 && (
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black uppercase tracking-wider text-gray-700">Select Size</h4>
                  {selectedSize && <span className="text-xs text-gray-500">Selected: <strong>{selectedSize}</strong></span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizeVariants.map((v) => {
                    const sizes = v.size.includes(',') ? v.size.split(',').map(s => s.trim()) : [v.size]
                    return sizes.map((size, sizeIdx) => {
                      const isSelected = selectedVariantId === v.id && selectedSize === size
                      const isOOS = v.quantity === 0
                      return (
                        <button
                          key={`${v.id}-${sizeIdx}`}
                          onClick={() => { setSelectedVariantId(v.id); setSelectedSize(size) }}
                          disabled={isOOS}
                          className={`relative min-w-[52px] px-4 py-2.5 border-2 rounded-lg text-sm font-bold transition-all
                            ${isSelected ? 'border-black bg-black text-white' :
                              isOOS ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' :
                              'border-gray-200 bg-white text-gray-800 hover:border-gray-400'}`}
                        >
                          {isOOS && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-full h-0.5 bg-gray-300 rotate-45 absolute" />
                            </span>
                          )}
                          <span className="relative">{size}</span>
                        </button>
                      )
                    })
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl font-bold transition">−</button>
                <span className="w-10 h-12 flex items-center justify-center text-sm font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl font-bold transition">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={totalStock === 0 || adding}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-amber-400 hover:text-black transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                )}
              </button>
              <button className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition">
                <Heart className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Promises */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              {[
                { icon: <Truck className="w-4 h-4" />, text: 'Free shipping on all orders' },
                { icon: <RefreshCw className="w-4 h-4" />, text: '7-day easy returns' },
                { icon: <Shield className="w-4 h-4" />, text: '100% authentic products' },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <span className="text-gray-400">{p.icon}</span>
                  {p.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-100">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">More Like This</p>
                <h2 className="text-2xl font-black text-black">You May Also Like</h2>
              </div>
              <Link href="/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-black hover:text-amber-600 transition">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(rp => (
                <Link key={rp.id} href={`/products/${rp.id}`} className="group">
                  <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      {rp.image ? (
                        <img src={rp.image} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-100">👟</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-black">{rp.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-black">₹{rp.price.toLocaleString('en-IN')}</span>
                        {rp.mrp && rp.mrp > rp.price && (
                          <span className="text-xs text-gray-400 line-through">₹{rp.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-14 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="mb-4"><LogoWithText size="md" variant="light" /></div>
              <p className="text-gray-400 text-sm leading-relaxed">Premium footwear for those who dare to stand out.</p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-5 text-gray-400">Categories</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/products" className="hover:text-amber-400 transition">All Products</Link></li>
                <li><Link href="/products?family=men" className="hover:text-amber-400 transition">Men's Collection</Link></li>
                <li><Link href="/products?family=women" className="hover:text-amber-400 transition">Women's Collection</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-5 text-gray-400">Info</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-amber-400 transition">About Us</Link></li>
                <li><Link href="/about#contact" className="hover:text-amber-400 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-5 text-gray-400">Contact</h4>
              <p className="text-sm text-gray-400 mb-1">support@classychain.com</p>
              <p className="text-sm text-gray-400">+91 98765 43210</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
            &copy; 2026 ClassyChain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
