'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Flame, Clock } from 'lucide-react'
import { showToast } from '@/components/Toast'

interface DealProduct {
  id: string
  name: string
  price: number
  mrp?: number
  image: string
  brand: string
  description: string
}

interface Deal {
  products: DealProduct[]
  endDate: string
}

function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, expired: true }); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ h, m, s, expired: false })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [endDate])

  return timeLeft
}

function ProductCard({ product }: { product: DealProduct }) {
  const [addingId, setAddingId] = useState<string | null>(null)
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0

  const handleAddToCart = async () => {
    setAddingId(product.id)
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        })
        if (!res.ok) throw new Error()
        window.dispatchEvent(new CustomEvent('cartUpdated'))
        showToast(`${product.name} added to cart!`, 'success', 3000)
      } else {
        const pendingCart = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        const existing = pendingCart.find((i: any) => i.productId === product.id)
        if (existing) existing.quantity += 1
        else pendingCart.push({ productId: product.id, quantity: 1 })
        localStorage.setItem('pendingCart', JSON.stringify(pendingCart))
        window.dispatchEvent(new CustomEvent('cartUpdated'))
        showToast(`${product.name} added to cart!`, 'success', 3000)
      }
    } catch {
      showToast('Failed to add to cart', 'error', 3000)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-sm hover:shadow-md transition-all">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
              -{discount}%
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        {product.brand && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{product.brand}</p>}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-3 hover:text-black leading-snug">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-black text-black">₹{product.price.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through ml-2">₹{product.mrp.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addingId === product.id}
            className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-amber-400 hover:text-black transition disabled:opacity-50"
          >
            {addingId === product.id ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5" /> Add</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const { h, m, s, expired } = useCountdown(endDate)
  if (expired) return <span className="text-red-500 font-bold text-sm">Deal expired</span>
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-black/60" />
      <div className="flex items-center gap-1 font-black text-black text-sm tabular-nums">
        <span className="bg-black text-white px-2 py-0.5 rounded">{pad(h)}</span>
        <span>:</span>
        <span className="bg-black text-white px-2 py-0.5 rounded">{pad(m)}</span>
        <span>:</span>
        <span className="bg-black text-white px-2 py-0.5 rounded">{pad(s)}</span>
      </div>
    </div>
  )
}

export default function DealsPage() {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/deal')
      .then(r => r.json())
      .then(d => setDeal(d.deal))
      .catch(() => setDeal(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <Flame className="w-16 h-16 text-gray-200" />
        <h1 className="text-2xl font-black text-gray-800">No Active Deal Right Now</h1>
        <p className="text-gray-400 text-sm max-w-xs">Check back soon — our next deal of the day will appear here when it goes live.</p>
        <Link href="/products" className="mt-2 inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition">
          Browse All Products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <Flame className="w-6 h-6 text-black" />
            <p className="text-[11px] font-black uppercase tracking-widest text-black/60">Limited Time</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-4">Deal of the Day</h1>
          <CountdownTimer endDate={deal.endDate} />
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-sm text-gray-400 mb-8">{deal.products.length} product{deal.products.length > 1 ? 's' : ''} on deal today</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {deal.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
