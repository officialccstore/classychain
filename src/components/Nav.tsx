'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'

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
        const [subfamiliesRes, categoriesRes] = await Promise.all([
          fetch('/api/subfamilies'),
          fetch('/api/categories')
        ])
        
        const subfamiliesData = await subfamiliesRes.json()
        const categoriesData = await categoriesRes.json()
        
        setSubfamilies(subfamiliesData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to fetch navigation data:', error)
      }
    }
    
    fetchData()
  }, [])

  const menCategories = categories.filter(cat => {
    const subfamily = subfamilies.find(sf => sf.id === cat.subfamilyId)
    return subfamily?.family === 'men' && subfamily.name.toLowerCase() !== 'bags & accessories'
  })
  
  const womenCategories = categories.filter(cat => {
    const subfamily = subfamilies.find(sf => sf.id === cat.subfamilyId)
    return subfamily?.family === 'women' && subfamily.name.toLowerCase() !== 'bags & accessories'
  })

  const menBagsSubfamily = subfamilies.find(sf => sf.family === 'men' && sf.name.toLowerCase() === 'bags & accessories')
  const womenBagsSubfamily = subfamilies.find(sf => sf.family === 'women' && sf.name.toLowerCase() === 'bags & accessories')

  const menBagsCategories = categories.filter(cat => {
    const subfamily = subfamilies.find(sf => sf.id === cat.subfamilyId)
    return subfamily?.family === 'men' && subfamily.name.toLowerCase() === 'bags & accessories'
  })

  const womenBagsCategories = categories.filter(cat => {
    const subfamily = subfamilies.find(sf => sf.id === cat.subfamilyId)
    return subfamily?.family === 'women' && subfamily.name.toLowerCase() === 'bags & accessories'
  })

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8 h-12">
            {/* Men */}
            <div className="group relative">
              <button className="text-gray-700 hover:text-primary font-medium transition">
                Men
              </button>
              
              {/* Men Dropdown */}
              <div className="absolute left-0 top-full pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                <div className="bg-white shadow-xl rounded-lg p-6 w-max min-w-[600px] border border-gray-200">
                  <div className="grid grid-cols-4 gap-6">
                    {menCategories.map(category => (
                      <div key={category.id}>
                        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                          {category.name}
                        </h3>
                        <ul className="space-y-2">
                          {category.subcategories && category.subcategories.length > 0 ? (
                            category.subcategories.map(subcategory => (
                              <li key={subcategory.id}>
                                <Link
                                  href={`/products?family=men&categoryId=${category.id}&subcategoryId=${subcategory.id}`}
                                  className="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all inline-block"
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))
                          ) : (
                            <li>
                              <Link
                                href={`/products?family=men&categoryId=${category.id}`}
                                className="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all inline-block"
                              >
                                View All
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                    {menCategories.length === 0 && (
                      <p className="text-gray-400 text-sm col-span-4">No categories available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Women */}
            <div className="group relative">
              <button className="text-gray-700 hover:text-primary font-medium transition">
                Women
              </button>
              
              {/* Women Dropdown */}
              <div className="absolute left-0 top-full pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                <div className="bg-white shadow-xl rounded-lg p-6 w-max min-w-[600px] border border-gray-200">
                  <div className="grid grid-cols-4 gap-6">
                    {womenCategories.map(category => (
                      <div key={category.id}>
                        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                          {category.name}
                        </h3>
                        <ul className="space-y-2">
                          {category.subcategories && category.subcategories.length > 0 ? (
                            category.subcategories.map(subcategory => (
                              <li key={subcategory.id}>
                                <Link
                                  href={`/products?family=women&categoryId=${category.id}&subcategoryId=${subcategory.id}`}
                                  className="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all inline-block"
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))
                          ) : (
                            <li>
                              <Link
                                href={`/products?family=women&categoryId=${category.id}`}
                                className="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all inline-block"
                              >
                                View All
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                    {womenCategories.length === 0 && (
                      <p className="text-gray-400 text-sm col-span-4">No categories available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bags & Accessories */}
            <div className="group relative">
              <button className="text-gray-700 hover:text-primary font-medium transition">
                Bags & Accessories
              </button>
              
              {/* Bags & Accessories Dropdown */}
              <div className="absolute left-0 top-full pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                <div className="bg-white shadow-xl rounded-lg p-6 w-max min-w-[500px] border border-gray-200">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Men's Bags & Accessories */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide border-b pb-2">
                        Men
                      </h3>
                      <div className="space-y-4">
                        {menBagsCategories.map(category => (
                          <div key={category.id}>
                            <h4 className="font-semibold text-gray-800 mb-2 text-xs uppercase">
                              {category.name}
                            </h4>
                            <ul className="space-y-1.5 ml-2">
                              {category.subcategories && category.subcategories.length > 0 ? (
                                category.subcategories.map(subcategory => (
                                  <li key={subcategory.id}>
                                    <Link
                                      href={`/products?family=men&categoryId=${category.id}&subcategoryId=${subcategory.id}`}
                                      className="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all inline-block"
                                    >
                                      {subcategory.name}
                                    </Link>
                                  </li>
                                ))
                              ) : (
                                <li>
                                  <Link
                                    href={`/products?family=men&categoryId=${category.id}`}
                                    className="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all inline-block"
                                  >
                                    View All
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                        {menBagsCategories.length === 0 && (
                          <p className="text-gray-400 text-sm italic">No items available</p>
                        )}
                      </div>
                    </div>

                    {/* Women's Bags & Accessories */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide border-b pb-2">
                        Women
                      </h3>
                      <div className="space-y-4">
                        {womenBagsCategories.map(category => (
                          <div key={category.id}>
                            <h4 className="font-semibold text-gray-800 mb-2 text-xs uppercase">
                              {category.name}
                            </h4>
                            <ul className="space-y-1.5 ml-2">
                              {category.subcategories && category.subcategories.length > 0 ? (
                                category.subcategories.map(subcategory => (
                                  <li key={subcategory.id}>
                                    <Link
                                      href={`/products?family=women&categoryId=${category.id}&subcategoryId=${subcategory.id}`}
                                      className="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all inline-block"
                                    >
                                      {subcategory.name}
                                    </Link>
                                  </li>
                                ))
                              ) : (
                                <li>
                                  <Link
                                    href={`/products?family=women&categoryId=${category.id}`}
                                    className="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all inline-block"
                                  >
                                    View All
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                        {womenBagsCategories.length === 0 && (
                          <p className="text-gray-400 text-sm italic">No items available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-gray-100 border-b border-gray-200">
        <div className="px-4 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 text-gray-700 font-medium"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-white border-t border-gray-200">
            {/* Men */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => setMobileExpandedMenu(mobileExpandedMenu === 'men' ? null : 'men')}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 font-medium"
              >
                <span>Men</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpandedMenu === 'men' ? 'rotate-180' : ''}`} />
              </button>
              
              {mobileExpandedMenu === 'men' && (
                <div className="px-4 pb-4 space-y-4 bg-gray-50">
                  {menCategories.map(category => (
                    <div key={category.id}>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase">
                        {category.name}
                      </h4>
                      <ul className="space-y-2 ml-2">
                        {category.subcategories && category.subcategories.length > 0 ? (
                          category.subcategories.map(subcategory => (
                            <li key={subcategory.id}>
                              <Link
                                href={`/products?family=men&categoryId=${category.id}&subcategoryId=${subcategory.id}`}
                                className="text-sm text-gray-600 hover:text-primary block"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subcategory.name}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li>
                            <Link
                              href={`/products?family=men&categoryId=${category.id}`}
                              className="text-sm text-gray-600 hover:text-primary block"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              View All
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Women */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => setMobileExpandedMenu(mobileExpandedMenu === 'women' ? null : 'women')}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 font-medium"
              >
                <span>Women</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpandedMenu === 'women' ? 'rotate-180' : ''}`} />
              </button>
              
              {mobileExpandedMenu === 'women' && (
                <div className="px-4 pb-4 space-y-4 bg-gray-50">
                  {womenCategories.map(category => (
                    <div key={category.id}>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase">
                        {category.name}
                      </h4>
                      <ul className="space-y-2 ml-2">
                        {category.subcategories && category.subcategories.length > 0 ? (
                          category.subcategories.map(subcategory => (
                            <li key={subcategory.id}>
                              <Link
                                href={`/products?family=women&categoryId=${category.id}&subcategoryId=${subcategory.id}`}
                                className="text-sm text-gray-600 hover:text-primary block"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subcategory.name}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li>
                            <Link
                              href={`/products?family=women&categoryId=${category.id}`}
                              className="text-sm text-gray-600 hover:text-primary block"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              View All
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bags & Accessories */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => setMobileExpandedMenu(mobileExpandedMenu === 'bags' ? null : 'bags')}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 font-medium"
              >
                <span>Bags & Accessories</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpandedMenu === 'bags' ? 'rotate-180' : ''}`} />
              </button>
              
              {mobileExpandedMenu === 'bags' && (
                <div className="px-4 pb-4 space-y-4 bg-gray-50">
                  {/* Men Section */}
                  <div className="border-b border-gray-300 pb-3">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase">Men</h4>
                    <div className="space-y-3">
                      {menBagsCategories.map(category => (
                        <div key={category.id}>
                          <h5 className="font-semibold text-gray-800 mb-1.5 text-xs uppercase">
                            {category.name}
                          </h5>
                          <ul className="space-y-1.5 ml-2">
                            {category.subcategories && category.subcategories.length > 0 ? (
                              category.subcategories.map(subcategory => (
                                <li key={subcategory.id}>
                                  <Link
                                    href={`/products?family=men&categoryId=${category.id}&subcategoryId=${subcategory.id}`}
                                    className="text-sm text-gray-600 hover:text-primary block"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {subcategory.name}
                                  </Link>
                                </li>
                              ))
                            ) : (
                              <li>
                                <Link
                                  href={`/products?family=men&categoryId=${category.id}`}
                                  className="text-sm text-gray-600 hover:text-primary block"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  View All
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                      {menBagsCategories.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No items available</p>
                      )}
                    </div>
                  </div>

                  {/* Women Section */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase">Women</h4>
                    <div className="space-y-3">
                      {womenBagsCategories.map(category => (
                        <div key={category.id}>
                          <h5 className="font-semibold text-gray-800 mb-1.5 text-xs uppercase">
                            {category.name}
                          </h5>
                          <ul className="space-y-1.5 ml-2">
                            {category.subcategories && category.subcategories.length > 0 ? (
                              category.subcategories.map(subcategory => (
                                <li key={subcategory.id}>
                                  <Link
                                    href={`/products?family=women&categoryId=${category.id}&subcategoryId=${subcategory.id}`}
                                    className="text-sm text-gray-600 hover:text-primary block"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {subcategory.name}
                                  </Link>
                                </li>
                              ))
                            ) : (
                              <li>
                                <Link
                                  href={`/products?family=women&categoryId=${category.id}`}
                                  className="text-sm text-gray-600 hover:text-primary block"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  View All
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                      {womenBagsCategories.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No items available</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
