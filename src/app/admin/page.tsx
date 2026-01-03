"use client"

import { useState, useEffect } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { showToast } from '@/components/Toast'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', description: '', price: 0, image: '', category: '', size: '10', brand: '', stock: 0 })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  async function fetchProducts() {
    const token = getToken()
    const res = await fetch('/api/admin/products', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
    if (res.ok) setProducts(await res.json())
  }

  async function fetchOrders() {
    const token = getToken()
    const res = await fetch('/api/admin/orders', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
    if (res.ok) setOrders(await res.json())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = getToken()
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      })
      
      if (res.ok) {
        setForm({ name: '', description: '', price: 0, image: '', category: '', size: '10', brand: '', stock: 0 })
        setEditingId(null)
        setShowForm(false)
        fetchProducts()
        showToast(editingId ? 'Product updated successfully!' : 'Product created successfully!', 'success', 3000)
      } else {
        showToast('Failed to save product', 'error', 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const token = getToken()
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      
      if (res.ok) {
        fetchProducts()
        showToast('Product deleted successfully!', 'success', 3000)
      } else {
        showToast('Failed to delete product', 'error', 3000)
      }
    } catch (error) {
      showToast('Error deleting product', 'error', 3000)
    }
  }

  function handleEdit(product: any) {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      size: product.size,
      brand: product.brand,
      stock: product.stock,
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <section className="mb-8 bg-white p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Products</h2>
            <button
              onClick={() => {
                setShowForm(!showForm)
                if (editingId) {
                  setEditingId(null)
                  setForm({ name: '', description: '', price: 0, image: '', category: '', size: '10', brand: '', stock: 0 })
                }
              }}
              className="bg-secondary text-black px-4 py-2 rounded font-bold hover:bg-yellow-400"
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="border rounded px-3 py-2" />
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" required className="border rounded px-3 py-2" />
              <input value={form.price} type="number" onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" required className="border rounded px-3 py-2" />
              <input value={form.stock} type="number" onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="Stock" required className="border rounded px-3 py-2" />
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="border rounded px-3 py-2" />
              <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="Size" className="border rounded px-3 py-2" />
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" required className="border rounded px-3 py-2 md:col-span-2" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="border rounded px-3 py-2 md:col-span-2" />
              <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded font-bold md:col-span-2 hover:bg-gray-800">
                {loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Product' : 'Add Product')}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="border rounded p-4 bg-white hover:shadow-lg transition">
                {p.image && <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded mb-2" />}
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.brand}</p>
                <p className="text-sm text-gray-600">Stock: {p.stock}</p>
                <p className="text-lg font-bold text-primary my-2">${p.price}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(p)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="border rounded p-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-bold">Order {o.id}</div>
                    <div className="text-sm text-gray-600">Total: ${o.totalPrice}</div>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2">
                  {o.items.map((it: any) => (
                    <div key={it.id} className="text-sm">{it.quantity} x {it.product.name}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
