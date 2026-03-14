'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X, Flame } from 'lucide-react'

interface Subcategory {
  id: string
  name: string
  categoryId: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  subfamilyId: string
  subcategories?: Subcategory[]
}

interface Subfamily {
  id: string
  name: string
  family: string
}

export default function Nav() {
  const [subfamilies, setSubfamilies] = useState<Subfamily[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sfRes, catRes] = await Promise.all([fetch('/api/subfamilies'), fetch('/api/categories')])
        const [sfData, catData] = await Promise.all([sfRes.json(), catRes.json()])
        setSubfamilies(sfData)
        setCategories(catData)
      } catch {
        // silently ignore
      }
    }
    fetchData()
  }, [])

  const menCategories = categories.filter(cat => {
    const sf = subfamilies.find(s => s.id === cat.subfamilyId)
    return sf?.family === 'men' && sf.name.toLowerCase() !== 'bags & accessories'
  })
  const womenCategories = categories.filter(cat => {
    const sf = subfamilies.find(s => s.id === cat.subfamilyId)
    return sf?.family === 'women' && sf.name.toLowerCase() !== 'bags & accessories'
  })
  const menBagsCategories = categories.filter(cat => {
    const sf = subfamilies.find(s => s.id === cat.subfamilyId)
    return sf?.family === 'men' && sf.name.toLowerCase() === 'bags & accessories'
  })
  const womenBagsCategories = categories.filter(cat => {
    const sf = subfamilies.find(s => s.id === cat.subfamilyId)
    return sf?.family === 'women' && sf.name.toLowerCase() === 'bags & accessories'
  })

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-10 h-11">

            {/* Deal of the Day */}
            <Link
              href="/deals"
              className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition tracking-wide"
            >
              <Flame className="w-4 h-4" />
              DEAL OF THE DAY
            </Link>

            {/* Men */}
            <DesktopDropdown label="MEN" categories={menCategories} family="men" />

            {/* Women */}
            <DesktopDropdown label="WOMEN" categories={womenCategories} family="women" />

            {/* Bags & Accessories */}
            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-black transition tracking-wide py-2">
                BAGS & ACCESSORIES
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                <div className="bg-white shadow-2xl rounded-xl border border-gray-100 p-6 w-max min-w-[440px]">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">Men</p>
                      {menBagsCategories.map(cat => (
                        <div key={cat.id} className="mb-3">
                          <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">{cat.name}</p>
                          <ul className="space-y-1 pl-2">
                            {cat.subcategories?.length ? cat.subcategories.map(sub => (
                              <li key={sub.id}>
                                <Link href={`/products?family=men&categoryId=${cat.id}&subcategoryId=${sub.id}`} className="text-sm text-gray-500 hover:text-black hover:translate-x-1 transition-all inline-block">
                                  {sub.name}
                                </Link>
                              </li>
                            )) : (
                              <li><Link href={`/products?family=men&categoryId=${cat.id}`} className="text-sm text-gray-500 hover:text-black transition">View All</Link></li>
                            )}
                          </ul>
                        </div>
                      ))}
                      {!menBagsCategories.length && <p className="text-sm text-gray-400 italic">Coming soon</p>}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">Women</p>
                      {womenBagsCategories.map(cat => (
                        <div key={cat.id} className="mb-3">
                          <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">{cat.name}</p>
                          <ul className="space-y-1 pl-2">
                            {cat.subcategories?.length ? cat.subcategories.map(sub => (
                              <li key={sub.id}>
                                <Link href={`/products?family=women&categoryId=${cat.id}&subcategoryId=${sub.id}`} className="text-sm text-gray-500 hover:text-black hover:translate-x-1 transition-all inline-block">
                                  {sub.name}
                                </Link>
                              </li>
                            )) : (
                              <li><Link href={`/products?family=women&categoryId=${cat.id}`} className="text-sm text-gray-500 hover:text-black transition">View All</Link></li>
                            )}
                          </ul>
                        </div>
                      ))}
                      {!womenBagsCategories.length && <p className="text-sm text-gray-400 italic">Coming soon</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/products" className="text-sm font-semibold text-gray-700 hover:text-black transition tracking-wide">
              ALL PRODUCTS
            </Link>

            <Link href="/about" className="text-sm font-semibold text-gray-700 hover:text-black transition tracking-wide">
              ABOUT US
            </Link>

          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-t border-gray-100">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
          </button>
          <Link href="/deals" className="flex items-center gap-1 text-xs font-bold text-amber-600">
            <Flame className="w-3.5 h-3.5" /> Deal of the Day
          </Link>
        </div>

        {isMobileMenuOpen && (
          <div className="bg-white border-t border-gray-100 divide-y divide-gray-100">
            {/* Men */}
            <MobileSection
              label="Men"
              isOpen={mobileExpandedMenu === 'men'}
              onToggle={() => setMobileExpandedMenu(mobileExpandedMenu === 'men' ? null : 'men')}
            >
              {menCategories.map(cat => (
                <div key={cat.id} className="mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{cat.name}</p>
                  <ul className="space-y-1.5 pl-2">
                    {cat.subcategories?.length ? cat.subcategories.map(sub => (
                      <li key={sub.id}>
                        <Link href={`/products?family=men&categoryId=${cat.id}&subcategoryId=${sub.id}`} className="text-sm text-gray-600 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>
                          {sub.name}
                        </Link>
                      </li>
                    )) : (
                      <li><Link href={`/products?family=men&categoryId=${cat.id}`} className="text-sm text-gray-600 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>View All</Link></li>
                    )}
                  </ul>
                </div>
              ))}
            </MobileSection>

            {/* Women */}
            <MobileSection
              label="Women"
              isOpen={mobileExpandedMenu === 'women'}
              onToggle={() => setMobileExpandedMenu(mobileExpandedMenu === 'women' ? null : 'women')}
            >
              {womenCategories.map(cat => (
                <div key={cat.id} className="mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{cat.name}</p>
                  <ul className="space-y-1.5 pl-2">
                    {cat.subcategories?.length ? cat.subcategories.map(sub => (
                      <li key={sub.id}>
                        <Link href={`/products?family=women&categoryId=${cat.id}&subcategoryId=${sub.id}`} className="text-sm text-gray-600 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>
                          {sub.name}
                        </Link>
                      </li>
                    )) : (
                      <li><Link href={`/products?family=women&categoryId=${cat.id}`} className="text-sm text-gray-600 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>View All</Link></li>
                    )}
                  </ul>
                </div>
              ))}
            </MobileSection>

            {/* Bags */}
            <MobileSection
              label="Bags & Accessories"
              isOpen={mobileExpandedMenu === 'bags'}
              onToggle={() => setMobileExpandedMenu(mobileExpandedMenu === 'bags' ? null : 'bags')}
            >
              {menBagsCategories.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Men</p>
                  {menBagsCategories.map(cat => (
                    <div key={cat.id} className="mb-2">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-1">{cat.name}</p>
                      <ul className="space-y-1 pl-2">
                        {cat.subcategories?.map(sub => (
                          <li key={sub.id}><Link href={`/products?family=men&categoryId=${cat.id}&subcategoryId=${sub.id}`} className="text-sm text-gray-600 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>{sub.name}</Link></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {womenBagsCategories.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Women</p>
                  {womenBagsCategories.map(cat => (
                    <div key={cat.id} className="mb-2">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-1">{cat.name}</p>
                      <ul className="space-y-1 pl-2">
                        {cat.subcategories?.map(sub => (
                          <li key={sub.id}><Link href={`/products?family=women&categoryId=${cat.id}&subcategoryId=${sub.id}`} className="text-sm text-gray-600 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>{sub.name}</Link></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </MobileSection>

            <div className="px-4 py-3 flex gap-6">
              <Link href="/products" className="text-sm font-semibold text-gray-700 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>
                All Products
              </Link>
              <Link href="/about" className="text-sm font-semibold text-gray-700 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>
                About Us
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

function DesktopDropdown({ label, categories, family }: { label: string; categories: Category[]; family: string }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-black transition tracking-wide py-2">
        {label}
        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
      </button>
      <div className="absolute left-0 top-full pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
        <div className="bg-white shadow-2xl rounded-xl border border-gray-100 p-6 w-max min-w-[560px]">
          <div className="grid grid-cols-4 gap-6">
            {categories.map(cat => (
              <div key={cat.id}>
                <Link
                  href={`/products?family=${family}&categoryId=${cat.id}`}
                  className="block text-xs font-black text-gray-800 uppercase tracking-widest mb-3 hover:text-black transition"
                >
                  {cat.name}
                </Link>
                <ul className="space-y-1.5">
                  {cat.subcategories?.length ? cat.subcategories.map(sub => (
                    <li key={sub.id}>
                      <Link
                        href={`/products?family=${family}&categoryId=${cat.id}&subcategoryId=${sub.id}`}
                        className="text-sm text-gray-500 hover:text-black hover:translate-x-0.5 transition-all inline-block"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  )) : (
                    <li>
                      <Link href={`/products?family=${family}&categoryId=${cat.id}`} className="text-sm text-gray-500 hover:text-black transition">
                        View All
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-400 italic col-span-4">No categories available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileSection({ label, isOpen, onToggle, children }: { label: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800">
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  )
}
