'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, ChevronLeft, ChevronRight, ArrowLeft, Truck, RefreshCw, Shield, Ruler, X } from 'lucide-react'
import { showToast } from '@/components/Toast'

interface SizeVariant {
  size: string
  quantity: number
}

interface DealProduct {
  id: string
  name: string
  description: string
  category: string
  sizeVariants: SizeVariant[]
  price: number
  image: string
  images?: string[]
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
        </div>
      </div>
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

  useEffect(() => { setZoomed(false); setPanX(0); setPanY(0) }, [index])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
    if (zoomed) panStartRef.current = { x: t.clientX, y: t.clientY, px: panX, py: panY }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoomed && panStartRef.current && e.touches.length === 1) {
      e.preventDefault()
      setPanX(panStartRef.current.px + e.touches[0].clientX - panStartRef.current.x)
      setPanY(panStartRef.current.py + e.touches[0].clientY - panStartRef.current.y)
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
        if (zoomed) { setZoomed(false); setPanX(0); setPanY(0) } else setZoomed(true)
        lastTapRef.current = 0
      } else { lastTapRef.current = now }
    } else if (!zoomed && images.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onNavigate((index + 1) % images.length)
      else onNavigate((index - 1 + images.length) % images.length)
    }
    touchStartRef.current = null; panStartRef.current = null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ touchAction: 'none' }}>
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {images.length > 1 && <span className="text-white/50 text-sm">{index + 1} / {images.length}</span>}
        <div className="w-10" />
      </div>
      <div className="flex-1 overflow-hidden flex items-center justify-center" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <img
          src={images[index]}
          alt={productName}
          draggable={false}
          className="w-full h-full object-contain select-none"
          style={{ transform: zoomed ? `translate(${panX}px,${panY}px) scale(2.5)` : 'scale(1)', transition: zoomed ? 'none' : 'transform 0.25s ease', touchAction: 'none', userSelect: 'none' } as React.CSSProperties}
        />
      </div>
      <div className="flex-shrink-0 pb-8">
        {zoomed ? (
          <p className="text-center text-white/30 text-xs py-3">Drag to pan · Double-tap to zoom out</p>
        ) : (
          <>
            {images.length > 1 && (
              <div className="flex items-center justify-between px-4 mb-3">
                <button onClick={() => onNavigate((index - 1 + images.length) % images.length)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex gap-1.5">
                  {images.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />)}
                </div>
                <button onClick={() => onNavigate((index + 1) % images.length)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition"><ChevronRight className="w-5 h-5" /></button>
              </div>
            )}
            <p className="text-center text-white/30 text-xs">Double-tap to zoom in</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function DealProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<DealProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const galleryTouchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    fetch(`/api/deal/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const allImages = product ? [product.image, ...(product.images || [])].filter(Boolean) : []
  const maxQty = product?.sizeVariants.find(sv => sv.size === selectedSize)?.quantity ?? 0

  const handleAddToCart = async () => {
    if (!product) return
    if (!selectedSize) {
      setSizeError(true)
      setShakeKey(k => k + 1)
      showToast('Please select a size first', 'error', 2500)
      return
    }
    setAdding(true)
    try {
      if (isLoggedIn) {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ dealProductId: product.id, size: selectedSize, quantity }),
        })
        const data = await res.json()
        if (res.ok) {
          showToast(`${product.name} added to cart!`, 'success', 3000)
          try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
        } else {
          showToast(data.error || 'Failed to add to cart', 'error', 3000)
        }
      } else {
        // Guest: store in localStorage
        const dealCart: any[] = JSON.parse(localStorage.getItem('dealCart') || '[]')
        const existing = dealCart.find(i => i.dealProductId === product.id && i.size === selectedSize)
        if (existing) {
          existing.quantity = Math.min(existing.quantity + quantity, maxQty)
        } else {
          dealCart.push({
            dealProductId: product.id,
            name: product.name,
            image: product.image,
            category: product.category,
            price: product.price,
            size: selectedSize,
            quantity: Math.min(quantity, maxQty),
          })
        }
        localStorage.setItem('dealCart', JSON.stringify(dealCart))
        try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
        showToast(`${product.name} added to cart!`, 'success', 3000)
      }
    } catch {
      showToast('Failed to add to cart', 'error', 3000)
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-gray-500 font-medium">Product not found or no longer available.</p>
        <button onClick={() => router.push('/deals')} className="text-sm font-bold text-black underline">Back to Deals</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {sizeChartOpen && <SizeChartModal onClose={() => setSizeChartOpen(false)} />}
      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox images={allImages} index={currentImageIndex} productName={product.name} onClose={() => setLightboxOpen(false)} onNavigate={setCurrentImageIndex} />
      )}

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link href="/deals" className="hover:text-black transition">Deals</Link>
          <span>/</span>
          <span className="text-gray-600">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

          {/* Image Gallery */}
          <div>
            <div
              className={`relative bg-gray-50 rounded-2xl overflow-hidden aspect-square group ${zoomPos ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
              }}
              onMouseLeave={() => setZoomPos(null)}
              onTouchStart={e => { galleryTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
              onTouchEnd={e => {
                if (!galleryTouchStart.current || e.changedTouches.length === 0) return
                const dx = e.changedTouches[0].clientX - galleryTouchStart.current.x
                const dy = e.changedTouches[0].clientY - galleryTouchStart.current.y
                if (Math.sqrt(dx * dx + dy * dy) < 15) setLightboxOpen(true)
                galleryTouchStart.current = null
              }}
            >
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={zoomPos ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: 'scale(2.2)' } : {}}
                  />
                  {!zoomPos && allImages.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImageIndex(i => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setCurrentImageIndex(i => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition">
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
              {/* Deal badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-amber-400 text-black text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">Deal of the Day</span>
              </div>
            </div>

            {/* Thumbnails */}
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
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-3xl sm:text-4xl font-black text-black mb-4 leading-tight">{product.name}</h1>

            {/* Price */}
            {product.price > 0 && (
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-black text-black">₹{product.price.toLocaleString('en-IN')}</span>
              </div>
            )}

            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Size Selection */}
            <div key={shakeKey} className={`mb-7 ${sizeError ? 'animate-shake' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-black uppercase tracking-wider ${sizeError ? 'text-red-500' : 'text-gray-700'}`}>
                  Select Size <span className="text-gray-400 font-semibold normal-case">(UK)</span>
                </h4>
                <button onClick={() => setSizeChartOpen(true)} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black underline underline-offset-2 transition">
                  <Ruler className="w-3.5 h-3.5" /> Size Chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizeVariants.map(sv => {
                  const outOfStock = sv.quantity === 0
                  const isSelected = selectedSize === sv.size
                  return (
                    <button
                      key={sv.size}
                      onClick={() => { if (!outOfStock) { setSelectedSize(sv.size); setQuantity(1); setSizeError(false) } }}
                      disabled={outOfStock}
                      className={`relative min-w-[52px] px-4 py-2.5 border-2 rounded-lg text-sm font-bold transition-all duration-200
                        ${isSelected ? 'border-black bg-black text-white scale-105 shadow-md' :
                          outOfStock ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' :
                          sizeError ? 'border-red-300 bg-red-50 text-gray-800 hover:border-red-400' :
                          'border-gray-200 bg-white text-gray-800 hover:border-black hover:-translate-y-0.5'}`}
                    >
                      {outOfStock && <span className="absolute inset-0 flex items-center justify-center"><span className="w-full h-0.5 bg-gray-300 rotate-45 absolute" /></span>}
                      <span className="relative">UK {sv.size}</span>
                    </button>
                  )
                })}
              </div>
              {sizeError && <p className="text-xs font-bold text-red-500 mt-2">Please select a size to continue</p>}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl font-bold transition">−</button>
                <span className="w-10 h-12 flex items-center justify-center text-sm font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={!selectedSize} className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl font-bold transition disabled:opacity-40">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-amber-400 hover:text-black transition disabled:opacity-60"
              >
                {adding ? (
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                )}
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
          </div>
        </div>
      </div>
    </div>
  )
}
