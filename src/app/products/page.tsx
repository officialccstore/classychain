'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, SlidersHorizontal, X, ChevronDown, ArrowRight } from 'lucide-react'
import { showToast } from '@/components/Toast'

interface SizeVariant {
  id: string
  size: string
  quantity: number
}

interface Product {
  id: string
  name: string
  mrp?: number
  price: number
  image: string
  description: string
  categoryId: string
  subcategoryId?: string
  sizeVariants?: SizeVariant[]
  category?: { id: string; name: string }
  subcategory?: { id: string; name: string }
  brand?: string
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
      <div className="h-5 bg-gray-200 rounded w-1/2" />
    </div>
  )
}

function ProductsPageContent() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const categoryIdFromUrl = searchParams.get('categoryId')
  const subcategoryIdFromUrl = searchParams.get('subcategoryId')
  const familyFromUrl = searchParams.get('family') || ''
  const searchQuery = searchParams.get('search') || ''

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => categoryIdFromUrl ? [categoryIdFromUrl] : [])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(() => subcategoryIdFromUrl ? [subcategoryIdFromUrl] : [])
  const [selectedFamily, setSelectedFamily] = useState<string>(familyFromUrl)
  const [selectedSubfamily, setSelectedSubfamily] = useState<string>('')

  // Sync filter state whenever URL search params change (e.g. clicking nav category links)
  useEffect(() => {
    const catId = searchParams.get('categoryId')
    const subCatId = searchParams.get('subcategoryId')
    const family = searchParams.get('family') || ''
    setSelectedCategories(catId ? [catId] : [])
    setSelectedSubcategories(subCatId ? [subCatId] : [])
    setSelectedFamily(family)
    setSelectedSubfamily('')
    setPage(1)
  }, [searchParams.toString()])
  const [sortBy, setSortBy] = useState('featured')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [subfamilies, setSubfamilies] = useState<any[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [sortOpen, setSortOpen] = useState(false)
  const [sizePickerProduct, setSizePickerProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/subfamilies').then(r => r.json()),
    ])
      .then(([cats, sfs]) => { setCategories(cats); setSubfamilies(sfs) })
      .catch(() => {})
  }, [])

  const doAddToCart = async (product: Product, size?: string) => {
    setAddingId(product.id)
    try {
      const sizeVariantId = size ? product.sizeVariants?.find(sv => sv.size === size)?.id : undefined
      if (isLoggedIn) {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ productId: product.id, quantity: 1, ...(size ? { size } : {}), ...(sizeVariantId ? { sizeVariantId } : {}) }),
        })
        if (res.ok) {
          showToast(`${product.name} added to cart!`, 'success', 3000)
          window.dispatchEvent(new CustomEvent('cartUpdated'))
        } else {
          showToast('Failed to add item to cart', 'error', 3000)
        }
      } else {
        const pendingCart = JSON.parse(localStorage.getItem('pendingCart') || '[]')
        const existing = pendingCart.find((item: any) => item.productId === product.id && item.size === (size || null))
        if (existing) existing.quantity += 1
        else pendingCart.push({ productId: product.id, quantity: 1, size: size || null, sizeVariantId: sizeVariantId || null })
        localStorage.setItem('pendingCart', JSON.stringify(pendingCart))
        showToast(`${product.name} added to cart!`, 'success', 3000)
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      }
    } catch {
      showToast('Error adding to cart', 'error', 3000)
    } finally {
      setAddingId(null)
    }
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const availableSizes = product.sizeVariants?.filter(sv => sv.quantity > 0) || []
    if (availableSizes.length > 0) {
      setSizePickerProduct(product)
      setSelectedSize(null)
      return
    }
    doAddToCart(product)
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', String(page))
        params.append('limit', '12')
        if (selectedFamily) params.append('family', selectedFamily)
        if (selectedSubfamily) params.append('subfamilyId', selectedSubfamily)
        if (selectedCategories.length > 0) params.append('categoryId', selectedCategories[0])
        if (selectedSubcategories.length > 0) params.append('subcategoryId', selectedSubcategories[0])
        if (sortBy) params.append('sort', sortBy)
        if (searchQuery) params.append('search', searchQuery)

        const res = await fetch(`/api/products?${params.toString()}`)
        if (!res.ok) throw new Error()
        const data = await res.json()

        if (Array.isArray(data.products)) {
          setProducts(prev => page === 1 ? data.products : [...prev, ...data.products])
          setTotal(data.pagination?.total || 0)
          setPages(data.pagination?.pages || 1)
        } else if (Array.isArray(data)) {
          setProducts(data)
          setTotal(data.length)
          setPages(1)
        } else {
          setProducts([])
          setTotal(0)
          setPages(1)
        }
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }
    fetchProducts()
  }, [selectedCategories, selectedSubcategories, selectedFamily, selectedSubfamily, page, sortBy, searchQuery])

  const handleCategoryChange = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [id])
    setSelectedSubcategories([])
    setPage(1)
  }
  const handleFamilyChange = (family: string) => {
    setSelectedFamily(prev => prev === family ? '' : family)
    setSelectedSubfamily('')
    setSelectedCategories([])
    setSelectedSubcategories([])
    setPage(1)
  }
  const handleSubfamilyChange = (id: string) => {
    setSelectedSubfamily(prev => prev === id ? '' : id)
    setSelectedCategories([])
    setSelectedSubcategories([])
    setPage(1)
  }
  const handleSubcategoryChange = (id: string) => {
    setSelectedSubcategories(prev => prev.includes(id) ? prev.filter(s => s !== id) : [id])
    setPage(1)
  }

  const isOutOfStock = (product: Product) =>
    !product.sizeVariants || product.sizeVariants.length === 0 || product.sizeVariants.every(v => v.quantity === 0)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && !loading && page < pages) setPage(p => p + 1) },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading, pages, page])

  const sortLabels: Record<string, string> = {
    featured: 'Featured',
    'price-low': 'Price: Low → High',
    'price-high': 'Price: High → Low',
    newest: 'Newest First',
  }

  const filterSidebarContent = (
    <div className="space-y-8">
      {/* Family */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Shop For</h3>
        <div className="space-y-2">
          {['men', 'women'].map(f => (
            <label key={f} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${selectedFamily === f ? 'border-black bg-black' : 'border-gray-300 group-hover:border-gray-500'}`}>
                {selectedFamily === f && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <input type="radio" name="family" checked={selectedFamily === f} onChange={() => handleFamilyChange(f)} className="sr-only" />
              <span className="text-sm font-medium text-gray-700 capitalize">{f}</span>
            </label>
          ))}
          {selectedFamily && (
            <button onClick={() => handleFamilyChange('')} className="text-xs text-gray-400 hover:text-black transition underline mt-1">Clear</button>
          )}
        </div>
      </div>

      {/* Subfamily */}
      {selectedFamily && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Shop By</h3>
          <div className="space-y-2">
            {subfamilies.filter(sf => sf.family === selectedFamily && sf.isActive).map(sf => (
              <label key={sf.id} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${selectedSubfamily === sf.id ? 'border-black bg-black' : 'border-gray-300 group-hover:border-gray-500'}`}>
                  {selectedSubfamily === sf.id && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <input type="radio" name="subfamily" checked={selectedSubfamily === sf.id} onChange={() => handleSubfamilyChange(sf.id)} className="sr-only" />
                <span className="text-sm font-medium text-gray-700">{sf.name}</span>
              </label>
            ))}
            {selectedSubfamily && (
              <button onClick={() => handleSubfamilyChange('')} className="text-xs text-gray-400 hover:text-black transition underline mt-1">Clear</button>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Category</h3>
        <div className="space-y-2">
          {categories.length > 0 ? categories
            .filter(c => selectedSubfamily ? c.subfamilyId === selectedSubfamily : selectedFamily ? subfamilies.find((sf: any) => sf.id === c.subfamilyId)?.family === selectedFamily : true)
            .map(c => (
              <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${selectedCategories.includes(c.id) ? 'border-black bg-black' : 'border-gray-300 group-hover:border-gray-500'}`}>
                  {selectedCategories.includes(c.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => handleCategoryChange(c.id)} className="sr-only" />
                <span className="text-sm font-medium text-gray-700">{c.name}</span>
              </label>
            ))
          : <p className="text-sm text-gray-400">Loading...</p>}
        </div>
      </div>

      {/* Subcategories */}
      {selectedCategories.length > 0 && (() => {
        const subs = categories.find(c => c.id === selectedCategories[0])?.subcategories
        return subs?.length > 0 ? (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Style</h3>
            <div className="space-y-2">
              {subs.map((s: any) => (
                <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${selectedSubcategories.includes(s.id) ? 'border-black bg-black' : 'border-gray-300 group-hover:border-gray-500'}`}>
                    {selectedSubcategories.includes(s.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <input type="checkbox" checked={selectedSubcategories.includes(s.id)} onChange={() => handleSubcategoryChange(s.id)} className="sr-only" />
                  <span className="text-sm font-medium text-gray-700">{s.name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null
      })()}
    </div>
  )

  return (

    <div className="min-h-screen bg-white">
      {/* Size Picker Modal */}
      {sizePickerProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => setSizePickerProduct(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-lg text-black">Select Size <span className="text-sm text-gray-400 font-semibold">(UK)</span></h3>
              <button onClick={() => setSizePickerProduct(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4 line-clamp-1">{sizePickerProduct.name}</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(sizePickerProduct.sizeVariants?.filter(sv => sv.quantity > 0) || []).map(sv => (
                <button
                  key={sv.id}
                  type="button"
                  onClick={() => setSelectedSize(sv.size)}
                  className={`py-2.5 text-sm font-bold rounded-lg border-2 transition ${
                    selectedSize === sv.size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400 text-gray-800'
                  }`}
                >
                  {sv.size}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!selectedSize || addingId === sizePickerProduct.id}
              onClick={async () => {
                if (!selectedSize) return
                const product = sizePickerProduct
                setSizePickerProduct(null)
                await doAddToCart(product, selectedSize)
              }}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {addingId === sizePickerProduct.id ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
              )}
            </button>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">ClassyChain</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">All Products</h1>
          <p className="text-white/50 mt-2 text-sm">Discover our exclusive collection of premium footwear</p>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-black text-lg text-black uppercase tracking-wider">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {filterSidebarContent}
              <button onClick={() => setMobileFilterOpen(false)} className="mt-8 w-full bg-black text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-gray-800 transition">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              {filterSidebarContent}
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:border-gray-400 transition"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-black">{total}</span> products
                </p>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-gray-400 transition"
                >
                  {sortLabels[sortBy]}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {Object.entries(sortLabels).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => { setSortBy(val); setProducts([]); setPage(1); setSortOpen(false) }}
                        className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition ${sortBy === val ? 'font-bold text-black' : 'text-gray-600'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            {initialLoad ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-7xl mb-4 opacity-20">👟</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                <button
                  onClick={() => { setSelectedCategories([]); setSelectedSubcategories([]); setSelectedFamily(''); setSelectedSubfamily(''); setPage(1) }}
                  className="inline-flex items-center gap-2 text-sm font-bold text-black border-2 border-black px-6 py-2.5 rounded-lg hover:bg-black hover:text-white transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {products.map(product => (
                    <Link key={product.id} href={`/products/${product.id}`} className="group">
                      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-300">👟</div>
                          )}
                          {/* Badges */}
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                            {isOutOfStock(product) ? (
                              <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Sold Out</span>
                            ) : product.mrp && product.mrp > product.price ? (
                              <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                              </span>
                            ) : null}
                          </div>
                          {/* Cart button overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={addingId === product.id || isOutOfStock(product)}
                              className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-amber-400 transition disabled:opacity-50"
                            >
                              {addingId === product.id ? (
                                <span className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                              ) : (
                                <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          {product.brand && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{product.brand}</p>
                          )}
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-black transition leading-snug">
                            {product.name}
                          </h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-black">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="w-full h-4 mt-8" />
                {loading && page > 1 && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      Loading more...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="bg-black text-white py-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-4 bg-white/20 rounded w-24 mb-3 animate-pulse" />
            <div className="h-10 bg-white/20 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
