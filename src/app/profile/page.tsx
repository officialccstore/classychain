'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

interface UserData {
  id: string
  email: string
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
  product?: { id: string; name: string }
}

interface Order {
  id: string
  totalPrice: number
  status: string
  createdAt: string
  items: OrderItem[]
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingAddress, setSavingAddress] = useState(false)

  const authHeaders = useMemo(() => (
    token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  ), [token])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (storedToken && userData) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(userData))
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return
      try {
        const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        setAddresses(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to load addresses', e)
      }
    }

    const fetchOrders = async () => {
      if (!token) return
      try {
        const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to load orders', e)
      }
    }

    if (token) {
      fetchAddresses()
      fetchOrders()
    }
  }, [token])

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
        setAddresses((prev) => prev.map((addr) => (addr.id === editingId ? updated : addr)))
      } else {
        setAddresses((prev) => [updated, ...prev.filter((a) => a.id !== updated.id)])
      }

      // If new default, re-fetch to reflect ordering/default flags
      if (payload.isDefault) {
        const refreshed = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
        if (refreshed.ok) {
          const arr = await refreshed.json()
          setAddresses(Array.isArray(arr) ? arr : [])
        }
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
    setAddressForm({
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault,
    })
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete address')
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      if (editingId === id) resetForm()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSetDefault = async (id: string) => {
    if (!token) return
    try {
      const target = addresses.find((a) => a.id === id)
      if (!target) return
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ isDefault: true }),
      })
      if (!res.ok) throw new Error('Failed to update default')
      const refreshed = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
      if (refreshed.ok) {
        const arr = await refreshed.json()
        setAddresses(Array.isArray(arr) ? arr : [])
      }
    } catch (e) {
      console.error(e)
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Account</p>
            <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your addresses and keep track of your orders.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full px-4 py-2 bg-gray-100 text-gray-700 font-medium w-fit">{user.name}</div>
              <div className="text-gray-700 font-semibold text-lg">{user.email}</div>
              <p className="text-sm text-gray-500">Keep your info current to ensure smooth deliveries.</p>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Add / Edit Address</h3>
                {editingId && (
                  <button onClick={resetForm} className="text-sm text-blue-600 hover:underline">Cancel edit</button>
                )}
              </div>
              <div className="space-y-3">
                <input value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="Label (Home, Work)" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none" />
                <input value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} placeholder="Address line 1" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none" />
                <input value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} placeholder="Address line 2 (optional)" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none" />
                  <input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={addressForm.zipCode} onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })} placeholder="ZIP / Postal" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none" />
                  <input value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} placeholder="Country" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-black focus:outline-none" />
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                  Set as default shipping address
                </label>
                <button
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-60"
                >
                  {savingAddress ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
                <span className="text-sm text-gray-500">{addresses.length} saved</span>
              </div>
              {addresses.length === 0 ? (
                <p className="text-gray-500">No addresses yet. Add one to speed up checkout.</p>
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
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr.id)} className="text-blue-600 hover:underline">Set default</button>
                        )}
                        <button onClick={() => handleEdit(addr)} className="text-gray-800 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(addr.id)} className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Order History</h3>
                <span className="text-sm text-gray-500">{orders.length} order{orders.length === 1 ? '' : 's'}</span>
              </div>
              {orders.length === 0 ? (
                <div className="text-gray-500">
                  <p>No orders yet. Start shopping now!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                          <p className="text-gray-900 font-semibold">₹{order.totalPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-900 text-white">{order.status || 'pending'}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
