'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Star, ChevronDown, X } from 'lucide-react'
import { showToast } from '@/components/Toast'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  brand: string
  rating: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState('featured')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const categories = ['Running', 'Casual', 'Formal', 'Sports', 'Premium']
  const brands = ['Nike', 'Adidas', 'Puma', 'New Balance']

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        showToast(`${product.name} added to cart!`, 'success', 3000)
      } else {
        showToast('Failed to add item to cart', 'error', 3000)
      }
    } catch (error) {
      showToast('Error adding to cart', 'error', 3000)
      console.error('Failed to add to cart:', error)
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categoryParam = selectedCategories.length > 0 ? selectedCategories[0] : ''
        const url = categoryParam
          ? `/api/products?category=${categoryParam}`
          : '/api/products'
        const response = await fetch(url)
        const data = await response.json()
        setProducts(data.products)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategories])

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const filteredProducts = products
    .filter(p => priceRange[0] <= p.price && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'newest') return 0
      return 0
    })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-black text-black">All Products</h1>
          <p className="text-gray-600 mt-2">Discover our exclusive collection of premium footwear</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-8">
              {/* Categories Filter */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-black">CATEGORIES</h3>
                <div className="space-y-3">
                  {categories.map(category => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-gray-700 hover:text-black transition">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-black">PRICE RANGE</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">${priceRange[0]}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-sm font-semibold">${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-black">BRAND</h3>
                <div className="space-y-3">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-gray-700 hover:text-black transition">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-black">RATING</h3>
                <div className="space-y-3">
                  {[5, 4, 3].map(rating => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 flex items-center gap-1">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        {Array.from({ length: 5 - rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-gray-300" />
                        ))}
                        <span className="text-sm text-gray-600">& up</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar - Sort & View */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                >
                  Filter
                </button>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredProducts.length}</span> products
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-gray-400 transition">
                  Sort by: <span className="capitalize">{sortBy === 'featured' ? 'Featured' : sortBy}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button onClick={() => setSortBy('featured')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Featured</button>
                  <button onClick={() => setSortBy('price-low')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Price: Low to High</button>
                  <button onClick={() => setSortBy('price-high')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Price: High to Low</button>
                  <button onClick={() => setSortBy('newest')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Newest</button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found matching your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div className="group cursor-pointer">
                      {/* Image */}
                      <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-300">
                          👟
                        </div>
                        <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition">
                          Quick view
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {product.category}
                        </p>
                        <h3 className="text-lg font-bold text-black group-hover:text-yellow-500 transition line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">{product.brand}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.round(product.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({product.rating.toFixed(1)})</span>
                        </div>

                        {/* Price & CTA */}
                        <div className="pt-4 flex items-center justify-between border-t border-gray-200">
                          <span className="text-2xl font-black text-black">
                            ${product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="bg-black text-white p-3 rounded-lg hover:bg-yellow-500 transition-colors"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
