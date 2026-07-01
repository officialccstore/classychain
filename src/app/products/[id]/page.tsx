'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Truck, RefreshCw, Shield, ChevronDown, ChevronUp, Tag, X, Ruler } from 'lucide-react'
import { showToast } from '@/components/Toast'
import { LogoWithText } from '@/components/Logo'

interface SizeVariant {
  id: string
  size: string
  quantity: number
}

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
  sizeVariants?: SizeVariant[]
  reviews?: any[]
  tags?: string[]
  colors?: string[]
  material?: string
  features?: string
  specifications?: string
}

const SIZE_CHART = [
  { uk: '4',  us: '5',  eur: '37', cm: '23.5' },
  { uk: '5',  us: '6',  eur: '38', cm: '24.0' },
  { uk: '6',  us: '7',  eur: '39', cm: '24.5' },
  { uk: '7',  us: '8',  eur: '40', cm: '25.5' },
  { uk: '8',  us: '9',  eur: '41', cm: '26.0' },
  { uk: '9',  us: '10', eur: '42', cm: '27.0' },
  { uk: '10', us: '11', eur: '43', cm: '27.5' },
  { uk: '11', us: '12', eur: '44', cm: '28.5' },
  { uk: '12', us: '13', eur: '45', cm: '29.5' },
]

function SizeChartModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-black uppercase tracking-wider">Size Chart</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-xs text-gray-500 mb-4">Measure your foot from heel to toe and match to the foot length below.</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2.5 px-3 text-left text-xs font-black uppercase tracking-wider text-gray-500 rounded-tl-lg">UK</th>
                <th className="py-2.5 px-3 text-left text-xs font-black uppercase tracking-wider text-gray-500">US</th>
                <th className="py-2.5 px-3 text-left text-xs font-black uppercase tracking-wider text-gray-500">EUR</th>
                <th className="py-2.5 px-3 text-left text-xs font-black uppercase tracking-wider text-gray-500 rounded-tr-lg">Foot Length</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row, i) => (
                <tr key={row.uk} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="py-2.5 px-3 font-bold text-gray-900">{row.uk}</td>
                  <td className="py-2.5 px-3 text-gray-600">{row.us}</td>
                  <td className="py-2.5 px-3 text-gray-600">{row.eur}</td>
                  <td className="py-2.5 px-3 text-gray-600">{row.cm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-gray-400 mt-3">* All sizes are based on UK sizing. Measurements are approximate.</p>
        </div>
      </div>
    </div>
  )
}

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-gray-100">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-4 text-sm font-bold text-gray-800 hover:text-black transition">
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="pb-4 text-sm text-gray-600 leading-relaxed">{children}</div>}
    </div>
  )
}

function ImageLightbox({
  images,
  index,
  productName,
  onClose,
  onNavigate,
}: {
  images: string[]
  index: number
  productName: string
  onClose: () => void
  onNavigate: (i: number) => void
}) {
  const [zoomed, setZoomed] = useState(false)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)

  const lastTapRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    setZoomed(false)
    setPanX(0)
    setPanY(0)
  }, [index])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
    if (zoomed) {
      panStartRef.current = { x: t.clientX, y: t.clientY, px: panX, py: panY }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoomed && panStartRef.current && e.touches.length === 1) {
      e.preventDefault()
      const dx = e.touches[0].clientX - panStartRef.current.x
      const dy = e.touches[0].clientY - panStartRef.current.y
      setPanX(panStartRef.current.px + dx)
      setPanY(panStartRef.current.py + dy)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const now = Date.now()

    if (dist < 15) {
      if (now - lastTapRef.current < 300) {
        // Double tap — toggle zoom
        if (zoomed) { setZoomed(false); setPanX(0); setPanY(0) }
        else setZoomed(true)
        lastTapRef.current = 0
      } else {
        lastTapRef.current = now
      }
    } else if (!zoomed && images.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      // Swipe to navigate
      if (dx < 0) onNavigate((index + 1) % images.length)
      else onNavigate((index - 1 + images.length) % images.length)
    }

    touchStartRef.current = null
    panStartRef.current = null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ touchAction: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {images.length > 1 && (
          <span className="text-white/50 text-sm">{index + 1} / {images.length}</span>
        )}
        <div className="w-10" />
      </div>

      {/* Image */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[index]}
          alt={productName}
          draggable={false}
          className="w-full h-full object-contain select-none"
          style={{
            transform: zoomed ? `translate(${panX}px, ${panY}px) scale(2.5)` : 'scale(1)',
            transition: zoomed ? 'none' : 'transform 0.25s ease',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          } as React.CSSProperties}
        />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 pb-8">
        {zoomed ? (
          <p className="text-center text-white/30 text-xs py-3">Drag to pan · Double-tap to zoom out</p>
        ) : (
          <>
            {images.length > 1 && (
              <div className="flex items-center justify-between px-4 mb-3">
                <button
                  onClick={() => onNavigate((index - 1 + images.length) % images.length)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1.5">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
                  ))}
                </div>
                <button
                  onClick={() => onNavigate((index + 1) % images.length)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            <p className="text-center text-white/30 text-xs">Double-tap to zoom in</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adding, setAdding] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const galleryTouchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [params.id])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()
        setProduct(data)
        if (data?.colors?.length > 0) {
          setSelectedColor(data.colors[0])
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
      setSizeError(true)
      setShakeKey((k) => k + 1)
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
          body: JSON.stringify({ productId: product?.id, quantity, sizeVariantId: selectedVariantId, size: selectedSize, color: selectedColor }),
        })
        const data = await res.json()
        if (res.ok) {
          showToast(`Added to cart!`, 'success', 3000)
          try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
        } else {
          showToast(data.error || 'Failed to add item to cart', 'error', 3000)
        }
      } else {
        const pendingCart = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        const existing = pendingCart.find((it: any) => it.productId === product?.id && it.sizeVariantId === selectedVariantId && it.size === selectedSize && it.color === selectedColor)
        if (existing) existing.quantity += quantity
        else pendingCart.push({ productId: product?.id, quantity, sizeVariantId: selectedVariantId, size: selectedSize, color: selectedColor })
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
      {sizeChartOpen && <SizeChartModal onClose={() => setSizeChartOpen(false)} />}
      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox
          images={allImages}
          index={currentImageIndex}
          productName={product.name}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
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
            <div
              className={`relative bg-gray-50 rounded-2xl overflow-hidden aspect-square group ${zoomPos ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setZoomPos({
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                })
              }}
              onMouseLeave={() => setZoomPos(null)}
              onTouchStart={(e) => {
                galleryTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
              }}
              onTouchEnd={(e) => {
                if (!galleryTouchStart.current || e.changedTouches.length === 0) return
                const dx = e.changedTouches[0].clientX - galleryTouchStart.current.x
                const dy = e.changedTouches[0].clientY - galleryTouchStart.current.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < 15) setLightboxOpen(true)
                galleryTouchStart.current = null
              }}
            >
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={zoomPos ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: 'scale(2.2)',
                    } : {}}
                  />
                  {!zoomPos && allImages.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImageIndex(i => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center transition hover:bg-gray-50">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setCurrentImageIndex(i => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center transition hover:bg-gray-50">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button key={i} onClick={() => setCurrentImageIndex(i)} className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-6 bg-black' : 'w-1.5 bg-black/30'}`} />
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
            {allImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setCurrentImageIndex(i)}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === currentImageIndex ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {categoryName && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{categoryName}</p>}
            <h1 className="text-3xl sm:text-4xl font-black text-black mb-1 leading-tight">{product.name}</h1>
            {product.brand && <p className="text-sm text-gray-500 font-medium mb-4">{product.brand}</p>}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {product.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

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

            <p className={`text-sm font-bold mb-5 ${totalStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {totalStock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black uppercase tracking-wider text-gray-700">Select Colour</h4>
                  {selectedColor && <span className="text-xs text-gray-500">Selected: <strong>{selectedColor}</strong></span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded-lg text-sm font-bold transition-all ${selectedColor === color ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizeVariants && product.sizeVariants.length > 0 && (
              <div key={shakeKey} className={`mb-7 ${sizeError ? 'animate-shake' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-black uppercase tracking-wider ${sizeError ? 'text-red-500' : 'text-gray-700'}`}>
                    Select Size <span className="text-gray-400 font-semibold normal-case">(UK)</span>
                  </h4>
                  <button
                    onClick={() => setSizeChartOpen(true)}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black underline underline-offset-2 transition"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Size Chart
                  </button>
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
                          onClick={() => { setSelectedVariantId(v.id); setSelectedSize(size); setSizeError(false) }}
                          disabled={isOOS}
                          className={`relative min-w-[52px] px-4 py-2.5 border-2 rounded-lg text-sm font-bold transition-all duration-200
                            ${isSelected ? 'border-black bg-black text-white scale-105 shadow-md' :
                              isOOS ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' :
                              sizeError ? 'border-red-300 bg-red-50 text-gray-800 hover:border-red-400' :
                              'border-gray-200 bg-white text-gray-800 hover:border-black hover:-translate-y-0.5'}`}
                        >
                          {isOOS && <span className="absolute inset-0 flex items-center justify-center"><span className="w-full h-0.5 bg-gray-300 rotate-45 absolute" /></span>}
                          <span className="relative">{size}</span>
                        </button>
                      )
                    })
                  })}
                </div>
                {sizeError && (
                  <p className="text-xs font-bold text-red-500 mt-2">Please select a size to continue</p>
                )}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl font-bold transition">−</button>
                <span className="w-10 h-12 flex items-center justify-center text-sm font-bold">{quantity}</span>
                <button onClick={() => {
                  const sv = product.sizeVariants?.find(v => v.id === selectedVariantId)
                  const cap = sv?.quantity ?? 99
                  if (quantity >= cap) { showToast(`Only ${cap} unit${cap === 1 ? '' : 's'} available in this size`, 'error', 2000); return }
                  setQuantity(quantity + 1)
                }} className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl font-bold transition">+</button>
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
            <div className="border-t border-gray-100 pt-5 space-y-2.5">
              {[
                { icon: <Truck className="w-4 h-4" />, text: 'Free shipping on all orders' },
                { icon: <Shield className="w-4 h-4" />, text: '100% authentic products' },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <span className="text-gray-400">{p.icon}</span>
                  {p.text}
                </div>
              ))}
            </div>

            {/* Product Details Accordion */}
            <div className="mt-5">
              {product.material && (
                <AccordionSection title="Material">
                  <p>{product.material}</p>
                </AccordionSection>
              )}
              {product.features && (
                <AccordionSection title="Features">
                  <p className="whitespace-pre-line">{product.features}</p>
                </AccordionSection>
              )}
              {product.specifications && (
                <AccordionSection title="Specifications">
                  <p className="whitespace-pre-line">{product.specifications}</p>
                </AccordionSection>
              )}
              <div className="border-t border-gray-100">
                <p className="py-4 text-sm font-bold text-gray-800">Product Description</p>
                <p className="pb-4 text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
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
                      {rp.tags && rp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {rp.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
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
