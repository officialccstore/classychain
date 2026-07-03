'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Flame, Clock, SlidersHorizontal, X } from 'lucide-react'
import confetti from 'canvas-confetti'

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
  image: string
  images?: string[]
  price: number
}

interface Deal {
  products: DealProduct[]
  endDate: string
}

const CATEGORIES = [
  'All Shoes',
  'Formal Shoes',
  'Loafers',
  'Boots',
  'Sneakers',
  'Casual',
  'Slippers & Sandals',
  'Peshawari & Mules',
]


function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false })
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, expired: true }); return }
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), expired: false })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [endDate])
  return timeLeft
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const { h, m, s, expired } = useCountdown(endDate)
  if (expired) return <span className="text-red-500 font-bold text-sm">Deal expired</span>
  const pad = (n: number) => String(n).padStart(2, '0')
  const units = [
    { value: h, label: 'Hours' },
    { value: m, label: 'Minutes' },
    { value: s, label: 'Seconds' },
  ]
  return (
    <div className="flex items-center gap-2.5">
      <Clock className="w-4 h-4 text-black/60" />
      <div className="flex items-center gap-1.5">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center">
              <span className="bg-black text-white px-2 py-0.5 rounded font-black text-sm tabular-nums leading-tight">{pad(u.value)}</span>
              <span className="text-[9px] font-bold text-black/50 uppercase tracking-wide mt-0.5">{u.label}</span>
            </div>
            {i < units.length - 1 && <span className="font-black text-black/40 -mt-3">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: DealProduct }) {
  const outOfStock = !product.sizeVariants || product.sizeVariants.length === 0 || product.sizeVariants.every(sv => sv.quantity === 0)

  return (
    <Link href={`/deals/${product.id}`} className="group">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img src={product.image} alt={product.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'grayscale opacity-60' : ''}`} />
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {outOfStock ? (
              <span title="You just missed it — out of stock" className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Sold Out</span>
            ) : (
              <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">Deal</span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="w-full flex items-center justify-center bg-white text-black py-2 rounded-lg font-bold text-xs uppercase tracking-wide">
              {outOfStock ? 'You Just Missed It' : 'View Details'}
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-black transition leading-snug">{product.name}</h3>
          <span className="text-base font-black text-black">
            {product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Special Price'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function DealsPage() {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All Shoes')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [showSizeFilter, setShowSizeFilter] = useState(false)

  useEffect(() => {
    fetch('/api/deal')
      .then(r => r.json())
      .then(d => setDeal(d.deal))
      .catch(() => setDeal(null))
      .finally(() => setLoading(false))
  }, [])

  // Party-poppers from both bottom corners the moment an active deal shows up
  useEffect(() => {
    if (!deal) return
    let active = true
    const colors = ['#fbbf24', '#111111', '#ffffff']
    const endTime = Date.now() + 1500
    const frame = () => {
      if (!active) return
      confetti({ particleCount: 3, angle: 60, spread: 55, startVelocity: 45, origin: { x: 0, y: 0.7 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, startVelocity: 45, origin: { x: 1, y: 0.7 }, colors })
      if (Date.now() < endTime) requestAnimationFrame(frame)
    }
    frame()
    return () => { active = false }
  }, [deal])

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  const availableSizes = useMemo(() => {
    if (!deal) return []
    const sizeSet = new Set<string>()
    deal.products.forEach(p => p.sizeVariants.forEach(sv => sizeSet.add(sv.size)))
    return Array.from(sizeSet).sort((a, b) => parseFloat(a) - parseFloat(b))
  }, [deal])

  const filtered = useMemo(() => {
    if (!deal) return []
    return deal.products.filter(p => {
      const catMatch = activeCategory === 'All Shoes' || p.category === activeCategory
      const sizeMatch = selectedSizes.length === 0 || selectedSizes.some(s => p.sizeVariants.some(sv => sv.size === s))
      return catMatch && sizeMatch
    })
  }, [deal, activeCategory, selectedSizes])

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                  activeCategory === cat
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div className="mb-6">
          <button
            onClick={() => setShowSizeFilter(v => !v)}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter by Size
            {selectedSizes.length > 0 && (
              <span className="bg-black text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{selectedSizes.length}</span>
            )}
          </button>

          {showSizeFilter && (
            <div className="mt-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">UK Sizes</p>
                {selectedSizes.length > 0 && (
                  <button onClick={() => setSelectedSizes([])} className="text-xs text-gray-400 hover:text-black flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => {
                  const active = selectedSizes.includes(size)
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        active ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      UK {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-6">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All Shoes' ? ` in ${activeCategory}` : ''}
          {selectedSizes.length > 0 ? ` · UK ${selectedSizes.join(', ')}` : ''}
        </p>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <p className="text-gray-400 font-medium">No products match your filters</p>
            <button onClick={() => { setActiveCategory('All Shoes'); setSelectedSizes([]) }} className="text-sm font-bold text-black underline">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
