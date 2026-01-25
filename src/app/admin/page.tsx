'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';

interface SizeVariant {
  id: string;
  size: string;
  quantity: number;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  subcategories?: Subcategory[];
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

  const handleSizeVariantChange = (index: number, field: 'size' | 'quantity', value: string | number) => {
    const updated = [...sizeVariants];
    if (field === 'size') {
      updated[index].size = value as string;
    } else {
      updated[index].quantity = parseInt(value as string) || 0;
    }
    setSizeVariants(updated);
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-2 px-4 font-semibold ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('subfamilies')}
              className={`pb-2 px-4 font-semibold ${activeTab === 'subfamilies' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            >
              Subfamilies
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-2 px-4 font-semibold ${activeTab === 'categories' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`pb-2 px-4 font-semibold ${activeTab === 'coupons' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            >
              Coupons
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {editingProductId ? 'Edit Product' : 'Create New Product'}
              </h2>

              <form onSubmit={handleProductSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Brand *</label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., Nike, Adidas"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">MRP (Maximum Retail Price) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.mrp}
                      onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., 5999"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Offer Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., 4999"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
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

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Family *</label>
                    <select
                      value={productForm.family}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          family: e.target.value,
                          subfamilyId: '',
                          categoryId: '',
                          subcategoryId: '',
                        })
                      }
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Select Family</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Subfamily *</label>
                    <select
                      value={productForm.subfamilyId}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          subfamilyId: e.target.value,
                          categoryId: '',
                          subcategoryId: '',
                        })
                      }
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={!productForm.family}
                    >
                      <option value="">Select Subfamily</option>
                      {subfamilies
                        .filter((sf) => sf.family === productForm.family)
                        .map((subfamily) => (
                          <option key={subfamily.id} value={subfamily.id}>
                            {subfamily.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Category *</label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          categoryId: e.target.value,
                          subcategoryId: '',
                        })
                      }
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={!productForm.subfamilyId}
                    >
                      <option value="">Select Category</option>
                      {categories
                        .filter((cat) => cat.subfamilyId === productForm.subfamilyId)
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Subcategory</label>
                    <select
                      value={productForm.subcategoryId}
                      onChange={(e) => setProductForm({ ...productForm, subcategoryId: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      disabled={!productForm.categoryId}
                    >
                      <option value="">Select Subcategory (Optional)</option>
                      {categories
                        .find((c) => c.id === productForm.categoryId)
                        ?.subcategories?.map((subcat) => (
                          <option key={subcat.id} value={subcat.id}>
                            {subcat.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Size Variants */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Size Variants *</h3>
                  <div className="space-y-2">
                    {sizeVariants.map((variant, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Size</label>
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) => handleSizeVariantChange(idx, 'size', e.target.value)}
                            placeholder="e.g., 8, 9, 10, One Size"
                            className="w-full border rounded px-3 py-2"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="0"
                            value={variant.quantity}
                            onChange={(e) => handleSizeVariantChange(idx, 'quantity', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        {sizeVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSizeVariant(idx)}
                            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSizeVariant}
                    className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    + Add Size
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
                  </button>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm({
                          name: '',
                          description: '',
                          mrp: '',
                          price: '',
                          image: '',
                          images: [],
                          brand: '',
                          categoryId: '',
                          subcategoryId: '',
                        });
                        setSizeVariants([{ size: '', quantity: 0 }]);
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Products List */}
              {/* Filters */}
              <div className="mb-4 flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-semibold mb-1">Filter by Category</label>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => {
                      setSelectedCategoryFilter(e.target.value);
                      setSelectedSubcategoryFilter('');
                      setPage(1);
                    }}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Filter by Subcategory</label>
                  <select
                    value={selectedSubcategoryFilter}
                    onChange={(e) => { setSelectedSubcategoryFilter(e.target.value); setPage(1); }}
                    className="w-full border rounded px-3 py-2"
                    disabled={!selectedCategoryFilter}
                  >
                    <option value="">All Subcategories</option>
                    {categories.find((c) => c.id === selectedCategoryFilter)?.subcategories?.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Per page</label>
                  <select
                    value={12}
                    onChange={() => {}}
                    className="border rounded px-3 py-2"
                    disabled
                  >
                    <option>12</option>
                  </select>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Products ({products.length})</h2>
              {isLoading ? (
                <p className="text-gray-600">Loading...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-600">No products yet</p>
              ) : (
                <div>
                  <div className="grid gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{product.name}</h3>
                              {isOutOfStock(product.sizeVariants) && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">OUT OF STOCK</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                            <div className="text-sm mb-2">
                              <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                              {product.image && (
                                <span className="ml-4 text-blue-600">
                                  <a href={product.image} target="_blank" rel="noopener noreferrer">View Image</a>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                              <div>Category: {categories.find((c) => c.id === product.categoryId)?.name || 'Unknown'}</div>
                              {product.subcategoryId && (
                                <div>
                                  Subcategory:{' '}
                                  {categories.find((c) => c.id === product.categoryId)?.subcategories?.find((s) => s.id === product.subcategoryId)?.name || 'Unknown'}
                                </div>
                              )}
                            </div>
                            <div className="text-sm">
                              <span className="font-semibold">Sizes:</span>
                              <div className="mt-1 space-y-1">
                                {product.sizeVariants?.map((sv) => (
                                  <div key={sv.id} className="text-xs text-gray-600">Size {sv.size}: {sv.quantity} in stock</div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditProduct(product)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">Edit</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Admin Pagination Controls */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">Showing {products.length} of {total} products</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                      <div className="px-3 py-1">Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{pages}</span></div>
                      <button onClick={() => goToPage(page + 1)} disabled={page === pages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subfamilies Tab */}
          {activeTab === 'subfamilies' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Manage Subfamilies</h2>

              {/* Create/Edit Subfamily Form */}
              <form onSubmit={handleSubfamilySubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {editingSubfamilyId ? 'Edit Subfamily' : 'Create New Subfamily'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={subfamilyForm.name}
                    onChange={(e) => setSubfamilyForm({ ...subfamilyForm, name: e.target.value })}
                    placeholder="Subfamily name (e.g., Footwear, Bags & Accessories)"
                    className="border rounded px-3 py-2"
                    required
                  />
                  <select
                    value={subfamilyForm.family}
                    onChange={(e) => setSubfamilyForm({ ...subfamilyForm, family: e.target.value })}
                    className="border rounded px-3 py-2"
                    required
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
                <div className="flex gap-2 items-center mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={subfamilyForm.isActive}
                      onChange={(e) => setSubfamilyForm({ ...subfamilyForm, isActive: e.target.checked })}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {isLoading ? 'Saving...' : editingSubfamilyId ? 'Update Subfamily' : 'Create Subfamily'}
                  </button>
                  {editingSubfamilyId && (
                    <button
                      type="button"
                      onClick={handleCancelSubfamilyEdit}
                      className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Subfamilies List */}
              <div className="bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold p-4 border-b">Subfamilies</h3>
                
                {/* Men's Subfamilies */}
                <div className="p-4 border-b bg-blue-50">
                  <h4 className="font-semibold text-lg mb-2">Men</h4>
                  <div className="space-y-2">
                    {subfamilies
                      .filter((sf) => sf.family === 'men')
                      .map((subfamily) => (
                        <div
                          key={subfamily.id}
                          className="bg-white p-4 rounded border flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">{subfamily.name}</span>
                            <span className={`ml-3 text-sm ${subfamily.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {subfamily.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="ml-3 text-sm text-gray-500">
                              ({subfamily.categories?.length || 0} categories)
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSubfamily(subfamily)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubfamily(subfamily.id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    {subfamilies.filter((sf) => sf.family === 'men').length === 0 && (
                      <p className="text-gray-500 text-sm">No subfamilies for Men</p>
                    )}
                  </div>
                </div>

                {/* Women's Subfamilies */}
                <div className="p-4 bg-pink-50">
                  <h4 className="font-semibold text-lg mb-2">Women</h4>
                  <div className="space-y-2">
                    {subfamilies
                      .filter((sf) => sf.family === 'women')
                      .map((subfamily) => (
                        <div
                          key={subfamily.id}
                          className="bg-white p-4 rounded border flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">{subfamily.name}</span>
                            <span className={`ml-3 text-sm ${subfamily.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {subfamily.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="ml-3 text-sm text-gray-500">
                              ({subfamily.categories?.length || 0} categories)
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSubfamily(subfamily)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubfamily(subfamily.id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    {subfamilies.filter((sf) => sf.family === 'women').length === 0 && (
                      <p className="text-gray-500 text-sm">No subfamilies for Women</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>

              {/* Create Category Form */}
              <form onSubmit={handleCreateCategory} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Category name"
                    className="border rounded px-3 py-2"
                    required
                  />
                  <select
                    value={categoryForm.subfamilyId}
                    onChange={(e) => setCategoryForm({ ...categoryForm, subfamilyId: e.target.value })}
                    className="border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Subfamily</option>
                    {subfamilies.map((subfamily) => (
                      <option key={subfamily.id} value={subfamily.id}>
                        {subfamily.name} ({subfamily.family})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={categoryForm.isActive}
                      onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 ml-auto"
                  >
                    {isLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>

              {/* Create Subcategory Form */}
              <form onSubmit={handleCreateSubcategory} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Create New Subcategory</h3>
                <div className="flex gap-2">
                  <select
                    value={subcategoryForm.categoryId}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })}
                    className="flex-1 border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                    placeholder="Subcategory name"
                    className="flex-1 border rounded px-3 py-2"
                    required
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={subcategoryForm.isActive}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, isActive: e.target.checked })}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>

              {/* Categories List */}
              <h3 className="text-xl font-bold mb-4">All Categories ({categories.length})</h3>
              {isLoading ? (
                <p className="text-gray-600">Loading...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-600">No categories yet</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="border rounded-lg overflow-hidden">
                      <div
                        className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          setExpandedCategory(expandedCategory === category.id ? null : category.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{expandedCategory === category.id ? '▼' : '▶'}</span>
                          <div>
                            <h4 className="font-semibold">{category.name}</h4>
                            <p className="text-xs text-gray-500">
                              {category.subcategories?.length || 0} subcategories
                              {category.subfamily && (
                                <span> • <span className="capitalize font-medium">{category.subfamily.name} ({category.subfamily.family})</span></span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>

                      {expandedCategory === category.id && (
                        <div className="bg-white p-4 border-t space-y-2">
                          {category.subcategories?.length === 0 ? (
                            <p className="text-sm text-gray-500">No subcategories</p>
                          ) : (
                            category.subcategories?.map((subcat) => (
                              <div
                                key={subcat.id}
                                className="flex justify-between items-center bg-gray-50 p-3 rounded"
                              >
                                <div>
                                  <p className="font-sm">{subcat.name}</p>
                                  <p className="text-xs text-gray-500">{subcat.categoryId}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteSubcategory(subcat.id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
      </div>
    </div>
  );
}
