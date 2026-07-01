'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Package, RotateCcw } from 'lucide-react'

interface UserData {
  id: string
  email?: string | null
  name: string
  role?: string
}

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

interface OrderItem {
  id: string
  quantity: number
  price: number
  size?: string
  color?: string
  product?: { id: string; name: string; image?: string }
}

interface Order {
  id: string
  totalPrice: number
  status: string
  paymentMethod?: string
  trackingId?: string
  shippingAddress?: string
  createdAt: string
  items: OrderItem[]
}

const statusColors: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  shipped: 'bg-purple-100 text-purple-700',
  packaging: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  pending: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  return_requested: 'bg-orange-100 text-orange-700',
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [addressForm, setAddressForm] = useState({
    label: 'Home', line1: '', line2: '', city: '', state: '', zipCode: '', country: '', isDefault: false,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingAddress, setSavingAddress] = useState(false)
  const [pinLookupLoading, setPinLookupLoading] = useState(false)

  const fetchPinData = async (pin: string) => {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) return
    setPinLookupLoading(true)
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0]
        setAddressForm(prev => ({
          ...prev,
          city: po.District || po.Division || prev.city,
          state: po.State || prev.state,
          country: po.Country || 'India',
        }))
      }
    } catch {} finally {
      setPinLookupLoading(false)
    }
  }

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }, [token])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (storedToken && userData) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(userData))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!token) return
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setAddresses(await res.json().then(d => Array.isArray(d) ? d : []))
      } catch {}
    }
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setOrders(await res.json().then(d => Array.isArray(d) ? d : []))
      } catch {}
    }
    fetchAddresses()
    fetchOrders()
  }, [token])

  const handleEditProfile = () => {
    setProfileForm({ name: user?.name || '', email: user?.email || '' })
    setProfileError('')
    setEditingProfile(true)
  }

  const handleSaveProfile = async () => {
    if (!user || !token) return
    setSavingProfile(true)
    setProfileError('')
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: profileForm.name.trim() || user.name,
          email: profileForm.email.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setProfileError(data.error || 'Failed to update profile')
        return
      }
      const updated = await res.json()
      const updatedUser = { ...user, name: updated.name, email: updated.email }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.dispatchEvent(new CustomEvent('profileUpdated'))
      setEditingProfile(false)
    } catch {
      setProfileError('Something went wrong. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  const resetForm = () => {
    setAddressForm({ label: 'Home', line1: '', line2: '', city: '', state: '', zipCode: '', country: '', isDefault: false })
    setEditingId(null)
  }

  const handleSaveAddress = async () => {
    if (!token) return
    setSavingAddress(true)
    try {
      const payload = { ...addressForm, isDefault: !!addressForm.isDefault }
      const res = await fetch(editingId ? `/api/addresses/${editingId}` : '/api/addresses', {
        method: editingId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save address')
      const updated = await res.json()
      if (editingId) {
        setAddresses(prev => prev.map(a => a.id === editingId ? updated : a))
      } else {
        setAddresses(prev => [updated, ...prev.filter(a => a.id !== updated.id)])
      }
      if (payload.isDefault) {
        const refreshed = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
        if (refreshed.ok) setAddresses(await refreshed.json().then((d: any) => Array.isArray(d) ? d : []))
      }
      resetForm()
    } catch (e) {
      console.error(e)
    } finally {
      setSavingAddress(false)
    }
  }

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id)
    setAddressForm({ label: addr.label, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, zipCode: addr.zipCode, country: addr.country, isDefault: addr.isDefault })
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      await fetch(`/api/addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setAddresses(prev => prev.filter(a => a.id !== id))
      if (editingId === id) resetForm()
    } catch {}
  }

  const handleSetDefault = async (id: string) => {
    if (!token) return
    try {
      await fetch(`/api/addresses/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ isDefault: true }) })
      const refreshed = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
      if (refreshed.ok) setAddresses(await refreshed.json().then((d: any) => Array.isArray(d) ? d : []))
    } catch {}
  }

  const handleOrderAction = async (orderId: string, action: 'return') => {
    if (!token) return
    setActionLoading(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to process request')
        return
      }
      const updated = await res.json()
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o))
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to manage your profile.</p>
          <Link href="/login" className="inline-block bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Account</p>
            <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login' }}
            className="text-sm text-red-500 hover:text-red-700 font-semibold transition"
          >
            Sign Out
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black text-lg flex-shrink-0 mt-1">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          {editingProfile ? (
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Name</label>
                  <input
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              {profileError && <p className="text-red-500 text-xs">{profileError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition disabled:opacity-60"
                >
                  {savingProfile ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.email || 'No email added'}</p>
              </div>
              <button
                onClick={handleEditProfile}
                className="text-sm text-gray-600 hover:text-black font-semibold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'orders' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'addresses' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
          >
            Addresses ({addresses.length})
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No orders yet.</p>
                <Link href="/products" className="inline-block mt-4 bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-amber-400 hover:text-black transition">
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrderId === order.id
                const canReturn = order.status === 'delivered'

                return (
                  <div key={order.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                    {/* Order Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                          <p className="font-mono text-xs font-bold text-gray-700">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Date</p>
                          <p className="text-gray-700 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Amount</p>
                          <p className="font-black text-gray-900">₹{order.totalPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Status</p>
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status?.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-black border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition whitespace-nowrap"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 space-y-5">
                        {/* Products */}
                        <div>
                          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Items Ordered</p>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                                {item.product?.image && (
                                  <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm">{item.product?.name || 'Product'}</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {item.size && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">UK Size: {item.size}</span>}
                                    {item.color && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">Colour: {item.color}</span>}
                                    <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                                  </div>
                                </div>
                                <p className="font-black text-sm text-gray-900 whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm space-y-1.5">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Payment Info</p>
                            <p><span className="text-gray-500">Method:</span> <span className="font-semibold">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></p>
                            <p><span className="text-gray-500">Status:</span> <span className={`font-bold ${order.paymentMethod === 'cod' ? 'text-yellow-600' : 'text-green-600'}`}>{order.paymentMethod === 'cod' ? 'Pay on Delivery' : 'Paid'}</span></p>
                            <p><span className="text-gray-500">Total:</span> <span className="font-black text-black">₹{order.totalPrice.toFixed(2)}</span></p>
                          </div>
                          {(order.trackingId || order.shippingAddress) && (
                            <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm space-y-1.5">
                              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Delivery Info</p>
                              {order.trackingId && (
                                <p><span className="text-gray-500">Tracking ID:</span> <span className="font-mono font-bold text-black">{order.trackingId}</span></p>
                              )}
                              {order.shippingAddress && (
                                <p><span className="text-gray-500">Address:</span> <span className="font-medium whitespace-pre-line">{order.shippingAddress}</span></p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {canReturn && (
                          <div className="flex gap-3">
                            {canReturn && (
                              <button
                                onClick={() => handleOrderAction(order.id, 'return')}
                                disabled={actionLoading === order.id}
                                className="flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-600 hover:text-white hover:border-orange-600 transition disabled:opacity-50"
                              >
                                {actionLoading === order.id ? <span className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                Request Return / Exchange
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add / Edit Form */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Address' : 'Add Address'}</h3>
                  {editingId && <button onClick={resetForm} className="text-sm text-blue-600 hover:underline">Cancel</button>}
                </div>
                <div className="space-y-3">
                  <input value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="Label (Home, Work)" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none text-sm" />
                  <input value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} placeholder="Address line 1 *" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none text-sm" />
                  <input value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} placeholder="Address line 2 (optional)" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none text-sm" />
                  <div className="relative">
                    <input
                      value={addressForm.zipCode}
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '')
                        setAddressForm({ ...addressForm, zipCode: v })
                        fetchPinData(v)
                      }}
                      placeholder="PIN Code *"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none text-sm pr-8"
                    />
                    {pinLookupLoading && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City *" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none text-sm" />
                    <input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State *" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none text-sm" />
                  </div>
                  <input value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} placeholder="Country *" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none text-sm" />
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                    Set as default shipping address
                  </label>
                  <button onClick={handleSaveAddress} disabled={savingAddress} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-60 text-sm">
                    {savingAddress ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
                  <span className="text-sm text-gray-500">{addresses.length} saved</span>
                </div>
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No addresses yet. Add one to speed up checkout.</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{addr.label}</p>
                            {addr.isDefault && <span className="px-2 py-0.5 text-xs rounded-full bg-black text-white">Default</span>}
                          </div>
                          <p className="text-gray-700 text-sm mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p className="text-gray-700 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-gray-700 text-sm">{addr.country}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          {!addr.isDefault && <button onClick={() => handleSetDefault(addr.id)} className="text-blue-600 hover:underline">Set default</button>}
                          <button onClick={() => handleEdit(addr)} className="text-gray-800 hover:underline">Edit</button>
                          <button onClick={() => handleDelete(addr.id)} className="text-red-600 hover:underline">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
