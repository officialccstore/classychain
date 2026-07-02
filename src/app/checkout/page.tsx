'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, LogIn, ShoppingBag, Tag, X, MapPin, Plus } from 'lucide-react'
import { showToast } from '@/components/Toast'

interface Address {
  id: string
  label: string
  line1: string
  line2?: string | null
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

interface CartItem {
  id: string
  productId: string
  dealProductId?: string | null
  sizeVariantId?: string | null
  quantity: number
  size?: string
  color?: string
  isDeal?: boolean
  product?: {
    id: string
    name: string
    price: number
    brand: string
    image?: string
  }
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name?: string; email?: string; phone?: string; address?: string; city?: string; state?: string; zipCode?: string; country?: string } | null>(null)

  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingLine1, setShippingLine1] = useState('')
  const [shippingLine2, setShippingLine2] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('')
  const [shippingZip, setShippingZip] = useState('')
  const [shippingCountry, setShippingCountry] = useState('')

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const [paymentMethod] = useState<'razorpay'>('razorpay')

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percentage: number } | null>(null)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pinLookupLoading, setPinLookupLoading] = useState(false)

  const fetchPinData = async (pin: string) => {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) return
    setPinLookupLoading(true)
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0]
        setShippingCity(po.District || po.Division || '')
        setShippingState(po.State || '')
        setShippingCountry(po.Country || 'India')
        setFieldErrors(p => ({ ...p, city: '', state: '', zip: '', country: '' }))
      }
    } catch {} finally {
      setPinLookupLoading(false)
    }
  }

  // Load deal items immediately so loading=true doesn't hide them before the API call finishes
  useEffect(() => {
    try {
      const raw = localStorage.getItem('dealCart')
      const dealCart = raw ? JSON.parse(raw) : []
      if (dealCart.length > 0) {
        const items: CartItem[] = dealCart.map((it: any) => ({
          id: `deal-${it.dealProductId}-${it.size}`,
          productId: it.dealProductId,
          quantity: it.quantity,
          size: it.size,
          isDeal: true,
          product: {
            id: it.dealProductId,
            name: it.name,
            price: it.price || 0,
            brand: it.category || 'Deal',
            image: it.image,
          },
        }))
        setCartItems(items)
        setLoading(false)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const loadDealItems = (): CartItem[] => {
      try {
        const raw = localStorage.getItem('dealCart')
        const dealCart = raw ? JSON.parse(raw) : []
        return dealCart.map((it: any) => ({
          id: `deal-${it.dealProductId}-${it.size}`,
          productId: it.dealProductId,
          quantity: it.quantity,
          size: it.size,
          isDeal: true,
          product: {
            id: it.dealProductId,
            name: it.name,
            price: it.price || 0,
            brand: it.category || 'Deal',
            image: it.image,
          },
        }))
      } catch {
        return []
      }
    }

    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/cart', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await response.json()
        const rawItems = Array.isArray(data) ? data : (data?.items || [])

        // Normalize deal items: synthesize `product` from `dealProduct`
        const normalized: CartItem[] = rawItems.map((item: any) => {
          if (item.dealProductId && item.dealProduct) {
            const dp = item.dealProduct
            return {
              ...item,
              isDeal: true,
              product: { id: dp.id, name: dp.name, price: dp.price, brand: dp.category, image: dp.image },
            }
          }
          return item
        })

        // Guests: API returns 401 → normalized is empty → fall back to localStorage deal items
        if (!token) {
          setCartItems([...normalized, ...loadDealItems()])
        } else {
          setCartItems(normalized)
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error)
        setCartItems(loadDealItems())
      } finally {
        setLoading(false)
      }
    }

    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        setShippingName(parsed.name || '')
        setShippingPhone(parsed.phone || '')
      }
    } catch {}

    if (token) {
      fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then((addrs: Address[]) => {
          if (!Array.isArray(addrs) || addrs.length === 0) return
          setSavedAddresses(addrs)
          const def = addrs.find(a => a.isDefault) || addrs[0]
          setSelectedAddressId(def.id)
          setShippingLine1(def.line1)
          setShippingLine2(def.line2 || '')
          setShippingCity(def.city)
          setShippingState(def.state)
          setShippingZip(def.zipCode)
          setShippingCountry(def.country)
        })
        .catch(() => {})
    }

    fetchCart()
  }, [])

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full shadow-lg border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-8">Your order has been confirmed. We'll notify you when it ships.</p>
          <div className="flex flex-col gap-3">
            <Link href="/profile" className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-400 hover:text-black transition">
              View My Orders
            </Link>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-black transition text-sm">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
    : 0
  const discount = appliedCoupon ? subtotal * (appliedCoupon.percentage / 100) : 0
  const total = subtotal - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode.trim())}`)
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon')
        setAppliedCoupon(null)
      } else {
        setAppliedCoupon(data)
        setCouponError('')
      }
    } catch {
      setCouponError('Failed to apply coupon. Try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const selectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id)
    setShippingLine1(addr.line1)
    setShippingLine2(addr.line2 || '')
    setShippingCity(addr.city)
    setShippingState(addr.state)
    setShippingZip(addr.zipCode)
    setShippingCountry(addr.country)
    setFieldErrors({})
  }

  const validateFields = () => {
    const errors: Record<string, string> = {}
    if (!shippingName.trim()) errors.name = 'Full name is required'
    if (!shippingPhone.trim()) errors.phone = 'Phone number is required'
    if (!shippingLine1.trim()) errors.line1 = 'Address is required'
    if (!shippingCity.trim()) errors.city = 'City is required'
    if (!shippingState.trim()) errors.state = 'State is required'
    if (!shippingZip.trim()) errors.zip = 'PIN code is required'
    if (!shippingCountry.trim()) errors.country = 'Country is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildShippingAddress = () => [
    shippingName.trim(),
    shippingPhone.trim() ? `Phone: ${shippingPhone.trim()}` : null,
    shippingLine1.trim(),
    shippingLine2.trim() || null,
    shippingCity.trim() ? `${shippingCity.trim()}, ${shippingState.trim()} ${shippingZip.trim()}` : null,
    shippingCountry.trim(),
  ].filter(Boolean).join('\n')

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Removes items the backend says are out of stock, then bounces the user back to
  // the cart so they can see what's missing instead of silently dropping items.
  const removeOutOfStockItemsAndReturnToCart = async (issues: Array<{ cartItemId?: string; name?: string }>, token: string | null) => {
    const idsToRemove = new Set(issues.map(i => i.cartItemId).filter(Boolean) as string[])
    if (idsToRemove.size > 0) {
      await Promise.all(
        Array.from(idsToRemove).map(id =>
          fetch(`/api/cart/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined }).catch(() => {})
        )
      )
    }
    const names = issues.map(i => i.name).filter(Boolean).join(', ')
    showToast(
      names ? `${names} just went out of stock in this size and ${issues.length === 1 ? 'was' : 'were'} removed from your cart` : 'Some items just went out of stock and were removed from your cart',
      'error',
      5000
    )
    try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
    router.push('/cart')
  }

  const handlePayment = async () => {
    if (!isLoggedIn) {
      localStorage.setItem('pendingCart', JSON.stringify(cartItems))
      try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
      router.push('/login?redirect=/checkout&pendingCart=true')
      return
    }

    if (!validateFields()) return

    setPlacing(true)
    try {
      const token = localStorage.getItem('token')
      const shippingAddress = buildShippingAddress()

      // Verify every item is still in stock before we let the customer pay for it.
      const stockRes = await fetch('/api/checkout/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ items: cartItems }),
      })
      const stockData = await stockRes.json()
      if (!stockRes.ok || !stockData.valid) {
        setPlacing(false)
        await removeOutOfStockItemsAndReturnToCart(stockData.issues || [], token)
        return
      }

      const updatedUser = { ...user, name: shippingName.trim(), phone: shippingPhone.trim(), address: shippingLine1.trim(), city: shippingCity.trim(), state: shippingState.trim(), zipCode: shippingZip.trim(), country: shippingCountry.trim() }
      setUser(updatedUser)
      try { localStorage.setItem('user', JSON.stringify(updatedUser)) } catch {}

      // Razorpay payment
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ amount: total }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initiate payment')

      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load Razorpay. Please check your internet connection.')

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ClassyChain',
        description: 'Shoe Purchase',
        order_id: orderData.orderId,
        prefill: { name: shippingName.trim() || user?.name || '', email: user?.email || '', contact: shippingPhone.trim() || user?.phone || '' },
        theme: { color: '#000000' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartItems,
              total,
              shippingAddress,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyRes.ok && verifyData.success) {
            try { localStorage.removeItem('dealCart') } catch {}
            try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch {}
            router.push('/checkout?success=true')
          } else if (verifyRes.status === 409 && Array.isArray(verifyData.issues)) {
            setPlacing(false)
            await removeOutOfStockItemsAndReturnToCart(verifyData.issues, token)
          } else {
            alert(verifyData.error || 'Payment verification failed. Please contact support.')
            setPlacing(false)
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error: any) {
      alert(error.message || 'Something went wrong. Please try again.')
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading your order...
        </div>
      </div>
    )
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🛍️</div>
          <h1 className="text-2xl font-black mb-2">Nothing to check out</h1>
          <p className="text-gray-500 mb-6 text-sm">Add products to your cart before checking out</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-black text-white px-7 py-3 rounded-lg font-bold text-sm hover:bg-amber-400 hover:text-black transition">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const inputCls = (field: string) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition ${fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Almost there</p>
          <h1 className="text-3xl sm:text-4xl font-black text-black">Order Summary</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Items list */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-black uppercase tracking-wide text-sm">Items in Your Order</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {cartItems.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                  {item.product?.image && (
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 line-clamp-2">{item.product?.name}</p>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {item.isDeal ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Deal of the Day</span>
                      ) : (
                        <p className="text-xs text-gray-400">{item.product?.brand}</p>
                      )}
                      {item.size && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">UK Size: {item.size}</span>}
                      {item.color && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">Colour: {item.color}</span>}
                      <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <p className="font-black text-sm text-black whitespace-nowrap">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + payment */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-black text-black uppercase tracking-wide text-sm mb-4">Shipping Information</h3>

              {/* Saved address picker */}
              {isLoggedIn && savedAddresses.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Addresses</p>
                    <Link href="/profile" className="text-xs font-bold text-black hover:underline">Manage</Link>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
                    {savedAddresses.map(addr => {
                      const active = selectedAddressId === addr.id
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => selectAddress(addr)}
                          className={`flex-shrink-0 text-left border-2 rounded-xl p-3 w-48 transition-all ${active ? 'border-black bg-black/[0.04]' : 'border-gray-200 hover:border-gray-400'}`}
                        >
                          <div className="flex items-center justify-between mb-1.5 gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin className="w-3 h-3 flex-shrink-0 text-gray-500" />
                              <span className="text-xs font-black uppercase tracking-wide truncate">{addr.label}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {addr.isDefault && (
                                <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold leading-tight">Default</span>
                              )}
                              {active && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 line-clamp-2 leading-snug">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{addr.city}, {addr.state} {addr.zipCode}</p>
                        </button>
                      )
                    })}
                    <Link
                      href="/profile"
                      className="flex-shrink-0 border-2 border-dashed border-gray-200 rounded-xl p-3 w-36 flex flex-col items-center justify-center gap-1.5 hover:border-gray-400 hover:bg-gray-50 transition"
                    >
                      <Plus className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-400 font-medium text-center leading-tight">Add new address</span>
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">You can also edit the details below for this order.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => { setShippingName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })) }}
                    placeholder="Full Name *"
                    className={inputCls('name')}
                  />
                  {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="tel"
                    value={shippingPhone}
                    onChange={(e) => { setShippingPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: '' })) }}
                    placeholder="Phone Number *"
                    className={inputCls('phone')}
                  />
                  {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={shippingLine1}
                    onChange={(e) => { setShippingLine1(e.target.value); setFieldErrors(p => ({ ...p, line1: '' })) }}
                    placeholder="Delivery Address *"
                    className={inputCls('line1')}
                  />
                  {fieldErrors.line1 && <p className="text-xs text-red-500 mt-1">{fieldErrors.line1}</p>}
                </div>
                <input
                  type="text"
                  value={shippingLine2}
                  onChange={(e) => setShippingLine2(e.target.value)}
                  placeholder="Address line 2 (optional)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition sm:col-span-2"
                />
                <div className="sm:col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={shippingZip}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '')
                        setShippingZip(v)
                        setFieldErrors(p => ({ ...p, zip: '' }))
                        fetchPinData(v)
                      }}
                      placeholder="PIN Code *"
                      className={inputCls('zip')}
                    />
                    {pinLookupLoading && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    )}
                  </div>
                  {fieldErrors.zip && <p className="text-xs text-red-500 mt-1">{fieldErrors.zip}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => { setShippingCity(e.target.value); setFieldErrors(p => ({ ...p, city: '' })) }}
                    placeholder="City *"
                    className={inputCls('city')}
                  />
                  {fieldErrors.city && <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    value={shippingState}
                    onChange={(e) => { setShippingState(e.target.value); setFieldErrors(p => ({ ...p, state: '' })) }}
                    placeholder="State *"
                    className={inputCls('state')}
                  />
                  {fieldErrors.state && <p className="text-xs text-red-500 mt-1">{fieldErrors.state}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={shippingCountry}
                    onChange={(e) => { setShippingCountry(e.target.value); setFieldErrors(p => ({ ...p, country: '' })) }}
                    placeholder="Country *"
                    className={inputCls('country')}
                  />
                  {fieldErrors.country && <p className="text-xs text-red-500 mt-1">{fieldErrors.country}</p>}
                </div>
              </div>

              {/* Payment Method */}
              <h3 className="font-black text-black uppercase tracking-wide text-sm mb-3">Payment Method</h3>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-black bg-gray-50">
                  <div>
                    <p className="font-bold text-sm text-gray-900">Online Payment</p>
                    <p className="text-xs text-gray-500">Pay securely via Razorpay (UPI, Cards, Net Banking)</p>
                  </div>
                </div>
              </div>

              <h3 className="font-black text-black uppercase tracking-wide text-sm mb-5">Price Details</h3>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.percentage}% off)</span>
                    <span className="font-semibold">−₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-5">
                <span className="font-black text-black uppercase tracking-wide text-sm">Total</span>
                <span className="font-black text-xl text-black">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Coupon */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">{appliedCoupon.code}</span>
                    <span className="text-xs text-green-600">({appliedCoupon.percentage}% off)</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-green-500 hover:text-red-500 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mb-5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Coupon code"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-black transition"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-amber-400 hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {couponLoading
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                        : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1.5 font-medium">{couponError}</p>}
                </div>
              )}

              {!isLoggedIn && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                  <LogIn className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium">You'll be redirected to sign in to complete your purchase</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={placing}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-lg font-black text-sm uppercase tracking-wide hover:bg-amber-400 hover:text-black transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isLoggedIn ? 'Pay Now' : 'Sign In to Order'}
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
              <Link href="/cart" className="block text-center mt-3 text-xs text-gray-400 hover:text-black transition font-medium">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
