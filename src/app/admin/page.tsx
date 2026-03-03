'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { Package, Tag, LayoutGrid, Ticket, ChevronDown, ChevronRight, Pencil, Trash2, Plus, AlertCircle, CheckCircle, X } from 'lucide-react';

interface SizeVariant {
  id: string;
  size: string;
  quantity: number;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  subfamilyId?: string;
  subcategories?: Subcategory[];
  subfamily?: {
    id: string;
    name: string;
    family: string;
  };
}

interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  mrp?: number;
  price: number;
  image: string;
  images?: string[];
  brand: string;
  categoryId: string;
  subcategoryId?: string;
  sizeVariants?: SizeVariant[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'subfamilies' | 'coupons'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    mrp: '',
    price: '',
    image: '',
    images: [] as string[],
    brand: '',
    family: '',
    subfamilyId: '',
    categoryId: '',
    subcategoryId: '',
  });
  const [sizeVariants, setSizeVariants] = useState<Omit<SizeVariant, 'id'>[]>([
    { size: '', quantity: 0 },
  ]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Subfamily and Category form state
  const [subfamilies, setSubfamilies] = useState<any[]>([]);
  const [subfamilyForm, setSubfamilyForm] = useState({ name: '', family: 'men', isActive: true });
  const [editingSubfamilyId, setEditingSubfamilyId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', subfamilyId: '', isActive: true });
  const [subcategoryForm, setSubcategoryForm] = useState({
    categoryId: '',
    name: '',
    isActive: true,
  });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Coupon form state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponForm, setCouponForm] = useState({ code: '', percentage: '', validUntil: '', isHome: false });
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    fetchCategories();
    fetchSubfamilies();
    if (activeTab === 'coupons') fetchCoupons();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
  }, [activeTab, page, selectedCategoryFilter, selectedSubcategoryFilter]);

  const fetchSubfamilies = async () => {
    try {
      const res = await fetch('/api/subfamilies');
      if (!res.ok) throw new Error('Failed to fetch subfamilies');
      const data = await res.json();
      setSubfamilies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching subfamilies');
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      if (!res.ok) throw new Error('Failed to fetch coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching coupons');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching categories');
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '12');
      if (selectedCategoryFilter) params.append('categoryId', selectedCategoryFilter);
      if (selectedSubcategoryFilter) params.append('subcategoryId', selectedSubcategoryFilter);
      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const msg = `Failed to fetch products: ${res.status} ${res.statusText} ${text}`
        console.error(msg)
        setError(msg)
        setProducts([])
        return
      }

      let data: any
      try {
        data = await res.json()
      } catch (parseErr) {
        const text = await res.text().catch(() => '')
        const msg = `Failed to parse products JSON. Response text: ${text}`
        console.error(msg, parseErr)
        setError(msg)
        setProducts([])
        return
      }

      // API may return { products, pagination } or an array
      if (Array.isArray(data)) {
        setProducts(data as Product[])
        setTotal(data.length)
        setPages(1)
      } else if (Array.isArray(data?.products)) {
        setProducts(data.products as Product[])
        setTotal(data.pagination?.total || 0)
        setPages(data.pagination?.pages || 1)
      } else {
        const msg = 'Unexpected products response shape'
        console.warn(msg, data)
        setError(msg)
        setProducts([])
        setTotal(0)
        setPages(1)
      }
    } catch (err) {
      console.error('Error fetching products', err)
      setError(err instanceof Error ? err.message : 'Error fetching products')
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > pages) return;
    setPage(p);
    // scroll to top of admin panel for context
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Product handlers
  const handleAddSizeVariant = () => {
    setSizeVariants([...sizeVariants, { size: '', quantity: 0 }]);
  };

  const handleRemoveSizeVariant = (index: number) => {
    setSizeVariants(sizeVariants.filter((_, i) => i !== index));
  };

  const handleSizeVariantChange = (index: number, field: 'size' | 'quantity', value: string) => {
    setSizeVariants(sizeVariants.map((variant, i) => {
      if (i !== index) return variant;
      if (field === 'size') return { ...variant, size: value };
      const parsed = parseInt(value);
      return { ...variant, quantity: isNaN(parsed) ? 0 : parsed };
    }));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate
      if (!productForm.name || !productForm.mrp || !productForm.price || !productForm.categoryId) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (sizeVariants.some((sv) => !sv.size)) {
        setError('All size variants must have a size value');
        setIsLoading(false);
        return;
      }

      const payload = {
        ...productForm,
        mrp: parseFloat(productForm.mrp),
        price: parseFloat(productForm.price),
        sizeVariants,
      };

      const url = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products';
      const method = editingProductId ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save product');
      }

      // Reset form
      setProductForm({ name: '', description: '', mrp: '', price: '', image: '', images: [], brand: '', family: '', subfamilyId: '', categoryId: '', subcategoryId: '' });
      setSizeVariants([{ size: '', quantity: 0 }]);
      setEditingProductId(null);
      fetchProducts();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    // Find category to get subfamily and family info
    const category = categories.find(c => c.id === product.categoryId);
    setProductForm({
      name: product.name,
      description: product.description,
      mrp: product.mrp?.toString() || '',
      price: product.price.toString(),
      images: product.images || [],
      image: product.image,
      brand: product.brand || '',
      family: category?.subfamily?.family || '',
      subfamilyId: category?.subfamilyId || '',
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || '',
    });
    setSizeVariants(product.sizeVariants || [{ size: '', quantity: 0 }]);
    setEditingProductId(product.id);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/products/${productId}`, { 
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting product');
    }
  };

  // Category handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!categoryForm.name.trim()) {
        setError('Category name is required');
        setIsLoading(false);
        return;
      }

      if (!categoryForm.subfamilyId) {
        setError('Please select a subfamily');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(categoryForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create category');
      }

      setCategoryForm({ name: '', subfamilyId: '', isActive: true });
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!subcategoryForm.name.trim() || !subcategoryForm.categoryId) {
        setError('Subcategory name and category are required');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(subcategoryForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create subcategory');
      }

      setSubcategoryForm({ categoryId: '', name: '', isActive: true });
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating subcategory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure? This will delete all subcategories and products.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/categories/${categoryId}`, { 
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete category');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting category');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/subcategories/${subcategoryId}`, { 
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete subcategory');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting subcategory');
    }
  };

  // Subfamily handlers
  const handleSubfamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!subfamilyForm.name.trim()) {
        setError('Subfamily name is required');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const url = editingSubfamilyId 
        ? `/api/subfamilies/${editingSubfamilyId}` 
        : '/api/subfamilies';
      const method = editingSubfamilyId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(subfamilyForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save subfamily');
      }

      setSubfamilyForm({ name: '', family: 'men', isActive: true });
      setEditingSubfamilyId(null);
      fetchSubfamilies();
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving subfamily');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubfamily = (subfamily: any) => {
    setSubfamilyForm({
      name: subfamily.name,
      family: subfamily.family,
      isActive: subfamily.isActive,
    });
    setEditingSubfamilyId(subfamily.id);
  };

  const handleDeleteSubfamily = async (subfamilyId: string) => {
    if (!confirm('Are you sure? This will unlink all categories from this subfamily.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/subfamilies/${subfamilyId}`, { 
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete subfamily');
      fetchSubfamilies();
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting subfamily');
    }
  };

  const handleCancelSubfamilyEdit = () => {
    setSubfamilyForm({ name: '', family: 'men', isActive: true });
    setEditingSubfamilyId(null);
  };

  // Coupon handlers
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!couponForm.code.trim() || !couponForm.percentage || !couponForm.validUntil) {
        setError('All fields are required');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const url = editingCouponId ? `/api/coupons/${editingCouponId}` : '/api/coupons';
      const method = editingCouponId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(couponForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save coupon');
      }

      setCouponForm({ code: '', percentage: '', validUntil: '', isHome: false });
      setEditingCouponId(null);
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCoupon = (coupon: any) => {
    setCouponForm({
      code: coupon.code,
      percentage: coupon.percentage.toString(),
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      isHome: coupon.isHome || false,
    });
    setEditingCouponId(coupon.id);
  };

  const handleToggleCoupon = async (couponId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle coupon');
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error toggling coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/coupons/${couponId}`, { 
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete coupon');
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting coupon');
    }
  };

  const handleCancelCouponEdit = () => {
    setCouponForm({ code: '', percentage: '', validUntil: '', isHome: false });
    setEditingCouponId(null);
  };

  const isOutOfStock = (variants: SizeVariant[] | undefined) => {
    return !variants || variants.length === 0 || variants.every((v) => v.quantity === 0);
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { id: 'subfamilies', label: 'Subfamilies', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <Tag className="w-4 h-4" /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket className="w-4 h-4" /> },
  ] as const;

  const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
  const primaryBtn = "inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition";
  const secondaryBtn = "inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-semibold text-sm hover:border-gray-400 transition";
  const dangerBtn = "inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-bold transition";
  const editBtn = "inline-flex items-center gap-1 text-gray-500 hover:text-black text-xs font-bold transition";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-black min-h-screen hidden md:flex flex-col">
        <div className="px-6 py-7 border-b border-white/10">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">ClassyChain</p>
          <p className="text-white font-black text-lg">Admin Panel</p>
        </div>
        <nav className="flex-1 py-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border-r-2 border-amber-400'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-white/10">
          <p className="text-[10px] text-white/30">Admin access only</p>
        </div>
      </aside>

      {/* ── Mobile Tab Bar ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-black border-t border-white/10 z-40 flex">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[10px] font-bold transition ${activeTab === tab.id ? 'text-amber-400' : 'text-white/40'}`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tabs.find(t => t.id === activeTab)?.label}</p>
            <h1 className="text-xl font-black text-black mt-0.5">
              {activeTab === 'products' ? 'Manage Products' :
               activeTab === 'subfamilies' ? 'Manage Subfamilies' :
               activeTab === 'categories' ? 'Manage Categories' : 'Manage Coupons'}
            </h1>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 py-7">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              {/* Form */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
                <h2 className="text-base font-black text-black mb-6 uppercase tracking-wide">
                  {editingProductId ? '✏️ Edit Product' : '+ Create New Product'}
                </h2>

              <form onSubmit={handleProductSubmit} className="">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Product Name *</label>
                    <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Brand *</label>
                    <input type="text" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className={inputCls} placeholder="e.g., Nike, Adidas" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>MRP (₹) *</label>
                    <input type="number" step="0.01" value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })} className={inputCls} placeholder="e.g., 5999" required />
                  </div>
                  <div>
                    <label className={labelCls}>Offer Price (₹) *</label>
                    <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={inputCls} placeholder="e.g., 4999" required />
                  </div>
                </div>

                <div className="mb-4">
                  <label className={labelCls}>Description</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className={inputCls} rows={3} />
                </div>

                <div className="mb-4">
                  <ImageUpload
                    label="Main Product Image"
                    currentImage={productForm.image}
                    onUploadComplete={(url) => setProductForm({ ...productForm, image: url })}
                  />
                  <div className="mt-2">
                    <label className="block text-sm font-semibold mb-1">Or paste Main Image URL</label>
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Additional Images */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Additional Images (Gallery)</h3>
                  <div className="space-y-3">
                    {(productForm.images || []).map((img, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <ImageUpload
                            label={`Image ${idx + 1}`}
                            currentImage={img}
                            onUploadComplete={(url) => {
                              const updated = [...(productForm.images || [])];
                              updated[idx] = url;
                              setProductForm({ ...productForm, images: updated });
                            }}
                          />
                          <input
                            type="url"
                            value={img}
                            onChange={(e) => {
                              const updated = [...(productForm.images || [])];
                              updated[idx] = e.target.value;
                              setProductForm({ ...productForm, images: updated });
                            }}
                            className="w-full border rounded px-3 py-2 mt-2"
                            placeholder="Or paste image URL"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (productForm.images || []).filter((_, i) => i !== idx);
                            setProductForm({ ...productForm, images: updated });
                          }}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 mb-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm({ ...productForm, images: [...(productForm.images || []), ''] });
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      + Add Image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Family *</label>
                    <select value={productForm.family} onChange={(e) => setProductForm({ ...productForm, family: e.target.value, subfamilyId: '', categoryId: '', subcategoryId: '' })} className={inputCls} required>
                      <option value="">Select Family</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Subfamily *</label>
                    <select value={productForm.subfamilyId} onChange={(e) => setProductForm({ ...productForm, subfamilyId: e.target.value, categoryId: '', subcategoryId: '' })} className={inputCls} required disabled={!productForm.family}>
                      <option value="">Select Subfamily</option>
                      {subfamilies.filter(sf => sf.family === productForm.family).map(sf => <option key={sf.id} value={sf.id}>{sf.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Category *</label>
                    <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value, subcategoryId: '' })} className={inputCls} required disabled={!productForm.subfamilyId}>
                      <option value="">Select Category</option>
                      {categories.filter(c => c.subfamilyId === productForm.subfamilyId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Subcategory</label>
                    <select value={productForm.subcategoryId} onChange={(e) => setProductForm({ ...productForm, subcategoryId: e.target.value })} className={inputCls} disabled={!productForm.categoryId}>
                      <option value="">Select Subcategory (Optional)</option>
                      {categories.find(c => c.id === productForm.categoryId)?.subcategories?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Size Variants */}
                <div className="mb-5">
                  <label className={labelCls}>Size Variants *</label>
                  <div className="space-y-2">
                    {sizeVariants.map((variant, idx) => (
                        <div key={idx} className="flex gap-2 items-end">
                        <div className="w-20">
                          <label className={labelCls}>Size</label>
                          <input type="text" value={variant.size} onChange={(e) => handleSizeVariantChange(idx, 'size', e.target.value)} placeholder="Size (e.g., 8, 9, One Size)" className={inputCls} required />
                        </div>
                        <div className="w-32">
                          <label className={labelCls}>Quantity</label>
                          <input type="number" min="0" value={variant.quantity} onChange={(e) => handleSizeVariantChange(idx, 'quantity', e.target.value)} className={inputCls} placeholder="Qty" required />
                        </div>
                        {sizeVariants.length > 1 && (
                          <button type="button" onClick={() => handleRemoveSizeVariant(idx)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleAddSizeVariant} className="mt-2 flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition">
                    <Plus className="w-3.5 h-3.5" /> Add Size
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isLoading} className={primaryBtn}>
                    {isLoading ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={() => { setEditingProductId(null); setProductForm({ name: '', description: '', mrp: '', price: '', image: '', images: [], brand: '', family: '', subfamilyId: '', categoryId: '', subcategoryId: '' }); setSizeVariants([{ size: '', quantity: 0 }]); }} className={secondaryBtn}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex-1 min-w-[160px]">
                  <label className={labelCls}>Category</label>
                  <select value={selectedCategoryFilter} onChange={(e) => { setSelectedCategoryFilter(e.target.value); setSelectedSubcategoryFilter(''); setPage(1); }} className={inputCls}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className={labelCls}>Subcategory</label>
                  <select value={selectedSubcategoryFilter} onChange={(e) => { setSelectedSubcategoryFilter(e.target.value); setPage(1); }} className={inputCls} disabled={!selectedCategoryFilter}>
                    <option value="">All Subcategories</option>
                    {categories.find(c => c.id === selectedCategoryFilter)?.subcategories?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-black text-sm text-black uppercase tracking-wide">Products <span className="text-gray-400 font-normal">({total})</span></h2>
                </div>
                {isLoading ? (
                  <div className="p-12 text-center text-gray-400 text-sm">Loading products...</div>
                ) : products.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No products yet. Create your first product above.</p>
                  </div>
                ) : (
                  <div>
                    <div className="divide-y divide-gray-50">
                      {products.map(product => (
                        <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                          {/* Thumbnail */}
                          <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">👟</div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-sm text-gray-900 truncate">{product.name}</h3>
                              {isOutOfStock(product.sizeVariants) && (
                                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0">Out of Stock</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">{categories.find(c => c.id === product.categoryId)?.name || '—'}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm font-black text-black">₹{product.price.toFixed(0)}</span>
                              {product.mrp && product.mrp > product.price && (
                                <span className="text-xs text-gray-400 line-through">₹{product.mrp.toFixed(0)}</span>
                              )}
                              <span className="text-[10px] text-gray-400">{product.sizeVariants?.length || 0} sizes</span>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={() => handleEditProduct(product)} className={editBtn}>
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className={dangerBtn}>
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
                      <span className="text-gray-400">Showing {products.length} of {total}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-40 hover:border-gray-400 transition">← Prev</button>
                        <span className="text-xs text-gray-500">{page} / {pages}</span>
                        <button onClick={() => goToPage(page + 1)} disabled={page === pages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-40 hover:border-gray-400 transition">Next →</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subfamilies Tab */}
          {activeTab === 'subfamilies' && (
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h2 className="text-sm font-black text-black uppercase tracking-wide mb-5">
                  {editingSubfamilyId ? '✏️ Edit Subfamily' : '+ New Subfamily'}
                </h2>
                <form onSubmit={handleSubfamilySubmit} className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[180px]">
                    <label className={labelCls}>Name *</label>
                    <input type="text" value={subfamilyForm.name} onChange={(e) => setSubfamilyForm({ ...subfamilyForm, name: e.target.value })} placeholder="e.g., Footwear, Bags & Accessories" className={inputCls} required />
                  </div>
                  <div className="w-36">
                    <label className={labelCls}>Family *</label>
                    <select value={subfamilyForm.family} onChange={(e) => setSubfamilyForm({ ...subfamilyForm, family: e.target.value })} className={inputCls} required>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={subfamilyForm.isActive} onChange={(e) => setSubfamilyForm({ ...subfamilyForm, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-600">Active</span>
                  </label>
                  <div className="flex gap-2 pb-0.5">
                    <button type="submit" disabled={isLoading} className={primaryBtn}>{isLoading ? 'Saving...' : editingSubfamilyId ? 'Update' : 'Create'}</button>
                    {editingSubfamilyId && <button type="button" onClick={handleCancelSubfamilyEdit} className={secondaryBtn}>Cancel</button>}
                  </div>
                </form>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {['men', 'women'].map(gender => (
                  <div key={gender} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="font-black text-sm uppercase tracking-wide text-black capitalize">{gender}</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {subfamilies.filter(sf => sf.family === gender).map(sf => (
                        <div key={sf.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                          <div>
                            <span className="text-sm font-semibold text-gray-900">{sf.name}</span>
                            <span className={`ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${sf.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{sf.isActive ? 'Active' : 'Off'}</span>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => handleEditSubfamily(sf)} className={editBtn}><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteSubfamily(sf.id)} className={dangerBtn}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                      {subfamilies.filter(sf => sf.family === gender).length === 0 && (
                        <p className="px-5 py-4 text-xs text-gray-400 italic">No subfamilies yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* New Category */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-sm font-black text-black uppercase tracking-wide mb-4">+ New Category</h2>
                  <form onSubmit={handleCreateCategory} className="space-y-3">
                    <div>
                      <label className={labelCls}>Name *</label>
                      <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Subfamily *</label>
                      <select value={categoryForm.subfamilyId} onChange={(e) => setCategoryForm({ ...categoryForm, subfamilyId: e.target.value })} className={inputCls} required>
                        <option value="">Select Subfamily</option>
                        {subfamilies.map(sf => <option key={sf.id} value={sf.id}>{sf.name} ({sf.family})</option>)}
                      </select>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={categoryForm.isActive} onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })} className="w-4 h-4" />
                        <span className="text-sm text-gray-600">Active</span>
                      </label>
                      <button type="submit" disabled={isLoading} className={primaryBtn}>{isLoading ? 'Creating...' : 'Create'}</button>
                    </div>
                  </form>
                </div>
                {/* New Subcategory */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-sm font-black text-black uppercase tracking-wide mb-4">+ New Subcategory</h2>
                  <form onSubmit={handleCreateSubcategory} className="space-y-3">
                    <div>
                      <label className={labelCls}>Parent Category *</label>
                      <select value={subcategoryForm.categoryId} onChange={(e) => setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })} className={inputCls} required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Name *</label>
                      <input type="text" value={subcategoryForm.name} onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })} placeholder="Subcategory name" className={inputCls} required />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={subcategoryForm.isActive} onChange={(e) => setSubcategoryForm({ ...subcategoryForm, isActive: e.target.checked })} className="w-4 h-4" />
                        <span className="text-sm text-gray-600">Active</span>
                      </label>
                      <button type="submit" disabled={isLoading} className={primaryBtn}>{isLoading ? 'Creating...' : 'Create'}</button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Categories List */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-black text-sm text-black uppercase tracking-wide">All Categories <span className="text-gray-400 font-normal">({categories.length})</span></h3>
                </div>
                {categories.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-gray-400 italic">No categories yet</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {categories.map(cat => (
                      <div key={cat.id}>
                        <div
                          className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">{expandedCategory === cat.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                              <p className="text-[11px] text-gray-400">{cat.subcategories?.length || 0} subcategories {cat.subfamily ? `· ${cat.subfamily.name}` : ''}</p>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className={dangerBtn}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                        {expandedCategory === cat.id && (
                          <div className="bg-gray-50 px-10 py-3 space-y-2 border-t border-gray-100">
                            {cat.subcategories?.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No subcategories</p>
                            ) : cat.subcategories?.map((s: any) => (
                              <div key={s.id} className="flex items-center justify-between py-1">
                                <span className="text-sm text-gray-700">{s.name}</span>
                                <button onClick={() => handleDeleteSubcategory(s.id)} className={dangerBtn}><Trash2 className="w-3 h-3" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coupons Tab */}
          {activeTab === 'coupons' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Manage Coupons</h2>

              {/* Create/Edit Coupon Form */}
              <form onSubmit={handleCouponSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {editingCouponId ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., DAILY50"
                      className="w-full border rounded px-3 py-2 uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Discount Percentage *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={couponForm.percentage}
                      onChange={(e) => setCouponForm({ ...couponForm, percentage: e.target.value })}
                      placeholder="e.g., 50"
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Valid Until *</label>
                    <input
                      type="date"
                      value={couponForm.validUntil}
                      onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={couponForm.isHome}
                      onChange={(e) => setCouponForm({ ...couponForm, isHome: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-semibold">Show on Homepage Banner</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {isLoading ? 'Saving...' : editingCouponId ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                  {editingCouponId && (
                    <button
                      type="button"
                      onClick={handleCancelCouponEdit}
                      className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Coupons List */}
              <div className="bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold p-4 border-b">All Coupons</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Discount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valid Until</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Homepage</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {coupons.map((coupon) => {
                        const isExpired = new Date(coupon.validUntil) < new Date();
                        const isValid = coupon.isActive && !isExpired;
                        return (
                          <tr key={coupon.id} className={isValid ? '' : 'bg-gray-50'}>
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold text-blue-600">{coupon.code}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-green-600">{coupon.percentage}% OFF</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(coupon.validUntil).toLocaleDateString()}
                              {isExpired && <span className="ml-2 text-red-600 font-semibold">(Expired)</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                coupon.isHome
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {coupon.isHome ? '✓ Yes' : '✗ No'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)}
                                className={`px-3 py-1 rounded text-xs font-semibold ${
                                  coupon.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {coupon.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditCoupon(coupon)}
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="text-red-600 hover:underline text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {coupons.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No coupons found. Create your first coupon above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
