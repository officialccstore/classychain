'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { Package, Tag, LayoutGrid, Ticket, ChevronDown, ChevronRight, Pencil, Trash2, Plus, AlertCircle, CheckCircle, X, ShoppingBag, BarChart2, TrendingUp, Users, IndianRupee, Settings, LogOut, UserPlus, Pencil as PencilIcon, Eye, EyeOff, Flame, Video, Clock, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

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
  isVisible: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'subfamilies' | 'coupons' | 'orders' | 'settings' | 'homepage' | 'reels' | 'deals'>('dashboard');
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
    tags: '',
    colors: '',
    material: '',
    features: '',
    specifications: '',
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

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [savingTrackingId, setSavingTrackingId] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Settings state
  const [adminName, setAdminName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [newAdminForm, setNewAdminForm] = useState({ email: '', name: '', password: '', confirmPassword: '' });
  const [newAdminLoading, setNewAdminLoading] = useState(false);
  const [newAdminSuccess, setNewAdminSuccess] = useState('');
  const [newAdminError, setNewAdminError] = useState('');

  // Homepage state
  const [homepageFeaturedIds, setHomepageFeaturedIds] = useState<string[]>([]);
  const [homepageHeroIds, setHomepageHeroIds] = useState<string[]>([]);
  const [allProductsForHomepage, setAllProductsForHomepage] = useState<Product[]>([]);
  const [homepageSaving, setHomepageSaving] = useState<'featured' | 'hero' | null>(null);
  const [homepageSaveMsg, setHomepageSaveMsg] = useState('');
  const [homepageSearch, setHomepageSearch] = useState('');
  const [homepageProductsError, setHomepageProductsError] = useState('');

  // Reels state
  interface Reel { id: string; url: string; title: string; page: 'home' | 'about' | 'both' }
  const [reels, setReels] = useState<Reel[]>([]);
  const [reelsSaving, setReelsSaving] = useState(false);
  const [reelsSaveMsg, setReelsSaveMsg] = useState('');
  const [newReel, setNewReel] = useState<{ url: string; title: string; page: 'home' | 'about' | 'both' }>({ url: '', title: '', page: 'both' });

  // Deal of the Day state
  interface DealSizeVariant { size: string; quantity: number }
  interface DealProductItem { id: string; name: string; description: string; category: string; sizeVariants: DealSizeVariant[]; image: string; images?: string[]; price?: number; isActive: boolean }
  const DEAL_CATEGORIES = ['Formal Shoes', 'Loafers', 'Boots', 'Sneakers', 'Casual', 'Slippers & Sandals', 'Peshawari & Mules'];
  const [dealItems, setDealItems] = useState<DealProductItem[]>([]);
  const [dealStartDate, setDealStartDate] = useState('');
  const [dealEndDate, setDealEndDate] = useState('');
  const [dealSaving, setDealSaving] = useState(false);
  const [dealSaveMsg, setDealSaveMsg] = useState('');
  const [dealForm, setDealForm] = useState({ name: '', description: '', category: 'Formal Shoes', sizeVariants: [] as DealSizeVariant[], image: '', image2: '', image3: '', price: '' });
  const [dealSizeInput, setDealSizeInput] = useState('');
  const [dealQtyInput, setDealQtyInput] = useState('1');
  const [dealFormSaving, setDealFormSaving] = useState(false);
  const [dealFormError, setDealFormError] = useState('');
  const [deletingDealItem, setDeletingDealItem] = useState<string | null>(null);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealFormKey, setDealFormKey] = useState(0);

  // Load admin name on mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) setAdminName(JSON.parse(userData).name || '');
    } catch {}
  }, []);

  // Fetch data
  useEffect(() => {
    fetchCategories();
    fetchSubfamilies();
    if (activeTab === 'coupons') fetchCoupons();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'dashboard') fetchAnalytics();
    if (activeTab === 'homepage') fetchHomepageConfig();
    if (activeTab === 'reels') fetchReels();
    if (activeTab === 'deals') fetchDeal();
    if (activeTab === 'settings') {
      try {
        const userData = localStorage.getItem('user');
        if (userData) setAdminName(JSON.parse(userData).name || '');
      } catch {}
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
  }, [activeTab, page, selectedCategoryFilter, selectedSubcategoryFilter]);

  const fetchHomepageConfig = async () => {
    const token = localStorage.getItem('token');

    // Load products independently so a config failure doesn't block the picker
    setHomepageProductsError('');
    try {
      const prodRes = await fetch('/api/products?limit=200');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const prods = Array.isArray(prodData.products) ? prodData.products : Array.isArray(prodData) ? prodData : [];
        setAllProductsForHomepage(prods);
        if (prods.length === 0) setHomepageProductsError('No products found in the database.');
      } else {
        setHomepageProductsError(`Failed to load products (${prodRes.status}). Check server logs.`);
      }
    } catch (err) {
      setHomepageProductsError('Network error loading products. Is the server running?');
    }

    // Load saved config separately
    try {
      const cfgRes = await fetch('/api/admin/homepage', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.featuredIds) setHomepageFeaturedIds(cfg.featuredIds);
        if (cfg.heroIds) setHomepageHeroIds(cfg.heroIds);
      } else {
        console.error('Homepage config API returned', cfgRes.status);
      }
    } catch (err) {
      console.error('Failed to load homepage config:', err);
    }
  };

  const fetchReels = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/reels', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.ok) { const d = await res.json(); setReels(d.reels || []); }
    } catch {}
  };

  const saveReels = async (updated: any[]) => {
    setReelsSaving(true); setReelsSaveMsg('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/reels', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ reels: updated }) });
      if (!res.ok) throw new Error();
      setReelsSaveMsg('Reels saved!');
    } catch { setReelsSaveMsg('Save failed.'); }
    finally { setReelsSaving(false); setTimeout(() => setReelsSaveMsg(''), 3000); }
  };

  const fetchDeal = async () => {
    const token = localStorage.getItem('token');
    try {
      const [dealRes, itemsRes] = await Promise.all([
        fetch('/api/admin/deal', { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch('/api/admin/deal-products', { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      ]);
      if (dealRes.ok) {
        const d = await dealRes.json();
        if (d.deal) {
          setDealStartDate(d.deal.startDate ? d.deal.startDate.slice(0, 16) : '');
          setDealEndDate(d.deal.endDate ? d.deal.endDate.slice(0, 16) : '');
        }
      }
      if (itemsRes.ok) {
        const items = await itemsRes.json();
        setDealItems(Array.isArray(items) ? items : []);
      }
    } catch {}
  };

  const addDealSize = () => {
    const s = dealSizeInput.trim();
    const q = parseInt(dealQtyInput, 10);
    if (!s || isNaN(q) || q < 1) return;
    if (dealForm.sizeVariants.some(sv => sv.size === s)) return;
    setDealForm(f => ({ ...f, sizeVariants: [...f.sizeVariants, { size: s, quantity: q }] }));
    setDealSizeInput(''); setDealQtyInput('1');
  };

  const resetDealForm = () => {
    setDealForm({ name: '', description: '', category: 'Formal Shoes', sizeVariants: [], image: '', image2: '', image3: '', price: '' });
    setDealSizeInput(''); setDealQtyInput('1');
    setDealFormError('');
    setEditingDealId(null);
    setDealFormKey(k => k + 1);
  };

  const startEditDealItem = (item: DealProductItem) => {
    setDealForm({
      name: item.name,
      description: item.description,
      category: item.category,
      sizeVariants: item.sizeVariants,
      image: item.image,
      image2: item.images?.[0] || '',
      image3: item.images?.[1] || '',
      price: item.price ? String(item.price) : '',
    });
    setEditingDealId(item.id);
    setDealFormKey(k => k + 1);
    setDealFormError('');
    document.getElementById('deal-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveDealItem = async () => {
    if (!dealForm.name.trim() || !dealForm.image || dealForm.sizeVariants.length === 0) {
      setDealFormError('Name, image, and at least one size are required'); return;
    }
    setDealFormSaving(true); setDealFormError('');
    const token = localStorage.getItem('token');
    try {
      const extraImages = [dealForm.image2, dealForm.image3].filter(Boolean);
      const payload = { name: dealForm.name, description: dealForm.description, category: dealForm.category, sizeVariants: dealForm.sizeVariants, image: dealForm.image, images: extraImages, price: Number(dealForm.price) || 0 };

      if (editingDealId) {
        const res = await fetch(`/api/admin/deal-products/${editingDealId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setDealItems(prev => prev.map(d => d.id === editingDealId ? updated : d));
      } else {
        const res = await fetch('/api/admin/deal-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setDealItems(prev => [created, ...prev]);
      }
      resetDealForm();
    } catch { setDealFormError('Failed to save product'); }
    finally { setDealFormSaving(false); }
  };

  const deleteDealItem = async (id: string) => {
    setDeletingDealItem(id);
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/admin/deal-products/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setDealItems(prev => prev.filter(d => d.id !== id));
      if (editingDealId === id) resetDealForm();
    } catch {} finally { setDeletingDealItem(null); }
  };

  const toggleDealItem = async (id: string, isActive: boolean) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/admin/deal-products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ isActive }),
      });
      setDealItems(prev => prev.map(d => d.id === id ? { ...d, isActive } : d));
    } catch {}
  };

  const saveDeal = async () => {
    if (!dealStartDate || !dealEndDate) { setDealSaveMsg('Set start and end dates.'); return; }
    setDealSaving(true); setDealSaveMsg('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/deal', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ deal: { startDate: new Date(dealStartDate).toISOString(), endDate: new Date(dealEndDate).toISOString() } }) });
      if (!res.ok) throw new Error();
      setDealSaveMsg('Deal window saved!');
    } catch { setDealSaveMsg('Save failed.'); }
    finally { setDealSaving(false); setTimeout(() => setDealSaveMsg(''), 3000); }
  };

  const clearDeal = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/admin/deal', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ deal: null }) });
      setDealStartDate(''); setDealEndDate(''); setDealSaveMsg('Deal cleared.');
      setTimeout(() => setDealSaveMsg(''), 3000);
    } catch {}
  };

  const saveHomepage = async (type: 'featured' | 'hero', ids: string[]) => {
    setHomepageSaving(type);
    setHomepageSaveMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ type, productIds: ids }),
      });
      if (!res.ok) throw new Error('Failed');
      setHomepageSaveMsg(`${type === 'featured' ? 'Featured products' : 'Hero images'} saved!`);
      setTimeout(() => setHomepageSaveMsg(''), 3000);
    } catch {
      setHomepageSaveMsg('Save failed. Please try again.');
    } finally {
      setHomepageSaving(null);
    }
  };

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

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/analytics', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleChangeName = async () => {
    if (!adminName.trim()) return;
    setNameLoading(true);
    setNameSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: adminName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update name');
      // Update localStorage
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          localStorage.setItem('user', JSON.stringify({ ...parsed, name: data.name }));
        }
      } catch {}
      setNameSuccess('Name updated successfully!');
      setTimeout(() => setNameSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating name');
    } finally {
      setNameLoading(false);
    }
  };

  const handleCreateAdminUser = async () => {
    setNewAdminError('');
    setNewAdminSuccess('');
    const { email, name, password, confirmPassword } = newAdminForm;
    if (!email || !name || !password || !confirmPassword) {
      setNewAdminError('All fields are required'); return;
    }
    if (password !== confirmPassword) {
      setNewAdminError('Passwords do not match'); return;
    }
    if (password.length < 6) {
      setNewAdminError('Password must be at least 6 characters'); return;
    }
    setNewAdminLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      setNewAdminSuccess(`Admin user "${data.name}" created successfully!`);
      setNewAdminForm({ email: '', name: '', password: '', confirmPassword: '' });
      setTimeout(() => setNewAdminSuccess(''), 4000);
    } catch (err) {
      setNewAdminError(err instanceof Error ? err.message : 'Error creating admin user');
    } finally {
      setNewAdminLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSaveTrackingId = async (orderId: string) => {
    const trackingId = trackingInputs[orderId] ?? '';
    setSavingTrackingId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ trackingId }),
      });
      if (!res.ok) throw new Error('Failed to save tracking ID');
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving tracking ID');
    } finally {
      setSavingTrackingId(null);
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
        tags: productForm.tags ? productForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        colors: productForm.colors ? productForm.colors.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
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
      setProductForm({ name: '', description: '', mrp: '', price: '', image: '', images: [], brand: '', family: '', subfamilyId: '', categoryId: '', subcategoryId: '', tags: '', colors: '', material: '', features: '', specifications: '' });
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
      tags: (product as any).tags?.join(', ') || '',
      colors: (product as any).colors?.join(', ') || '',
      material: (product as any).material || '',
      features: (product as any).features || '',
      specifications: (product as any).specifications || '',
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

  const handleToggleVisibility = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ isVisible: !product.isVisible }),
      });
      if (!res.ok) throw new Error('Failed to update visibility');
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isVisible: !product.isVisible } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating visibility');
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
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { id: 'subfamilies', label: 'Subfamilies', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <Tag className="w-4 h-4" /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'homepage', label: 'Homepage', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'reels', label: 'Reels', icon: <Video className="w-4 h-4" /> },
    { id: 'deals', label: 'Deals', icon: <Flame className="w-4 h-4" /> },
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
              {activeTab === 'dashboard' ? 'Analytics & Sales' :
               activeTab === 'products' ? 'Manage Products' :
               activeTab === 'subfamilies' ? 'Manage Subfamilies' :
               activeTab === 'categories' ? 'Manage Categories' :
               activeTab === 'orders' ? 'Manage Orders' :
               activeTab === 'settings' ? 'Settings' :
               activeTab === 'homepage' ? 'Manage Homepage' :
               activeTab === 'reels' ? 'Manage Reels' :
               activeTab === 'deals' ? 'Deal of the Day' : 'Manage Coupons'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                Loading...
              </div>
            )}
            {adminName && (
              <p className="hidden sm:block text-sm font-black text-black">
                Hi, {adminName} Sir
              </p>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-8 py-7">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {analyticsLoading || !analytics ? (
                <div className="flex items-center justify-center h-64">
                  <span className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-8">

                  {/* ── Overview Cards ── */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[
                      { label: 'Total Revenue', value: `₹${analytics.overview.totalRevenue.toLocaleString('en-IN')}`, icon: <IndianRupee className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
                      { label: 'Total Orders', value: analytics.overview.totalOrders, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
                      { label: 'Avg Order Value', value: `₹${analytics.overview.avgOrderValue.toLocaleString('en-IN')}`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
                      { label: 'Customers (ordered)', value: analytics.overview.uniqueCustomers, icon: <Users className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
                      { label: 'Total Users', value: analytics.overview.totalUsers, icon: <Users className="w-5 h-5" />, color: 'bg-pink-50 text-pink-600' },
                      { label: 'Total Products', value: analytics.overview.totalProducts, icon: <Package className="w-5 h-5" />, color: 'bg-gray-50 text-gray-600' },
                    ].map((card) => (
                      <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                          {card.icon}
                        </div>
                        <p className="text-2xl font-black text-gray-900">{card.value}</p>
                        <p className="text-xs text-gray-400 font-medium mt-1">{card.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Daily Revenue – last 30 days ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-black text-black uppercase tracking-wide text-sm">Daily Revenue</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={analytics.dailySales} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                        <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* ── Daily Orders ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="mb-6">
                      <h3 className="font-black text-black uppercase tracking-wide text-sm">Daily Orders</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.dailySales} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(v: any) => [v, 'Orders']} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                        <Bar dataKey="orders" fill="#000" radius={[4, 4, 0, 0]} maxBarSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* ── Monthly Revenue + Orders ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="mb-6">
                        <h3 className="font-black text-black uppercase tracking-wide text-sm">Monthly Revenue</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Last 12 months</p>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={analytics.monthlySales} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                          <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                          <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="mb-6">
                        <h3 className="font-black text-black uppercase tracking-wide text-sm">Monthly Orders</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Last 12 months</p>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={analytics.monthlySales} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(v: any) => [v, 'Orders']} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                          <Line type="monotone" dataKey="orders" stroke="#000" strokeWidth={2} dot={{ r: 3, fill: '#000' }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── Status Distribution + Top Products ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-black text-black uppercase tracking-wide text-sm mb-6">Order Status Breakdown</h3>
                      {analytics.statusDistribution.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
                      ) : (() => {
                        const PIE_COLORS = ['#3b82f6', '#f59e0b', '#a855f7', '#22c55e', '#6b7280'];
                        const total = analytics.statusDistribution.reduce((s: number, d: any) => s + d.count, 0);
                        return (
                          <div className="flex flex-col gap-4">
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={analytics.statusDistribution}
                                  dataKey="count"
                                  nameKey="status"
                                  cx="50%" cy="50%"
                                  innerRadius={55}
                                  outerRadius={85}
                                  paddingAngle={3}
                                >
                                  {analytics.statusDistribution.map((_: any, i: number) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(v: any, _: any, props: any) => [`${v} orders (${((v / total) * 100).toFixed(0)}%)`, props.payload.status]}
                                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-2">
                              {analytics.statusDistribution.map((d: any, i: number) => (
                                <div key={d.status} className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span className="text-xs font-semibold text-gray-700 truncate">{d.status}</span>
                                  <span className="text-xs text-gray-400 ml-auto">{d.count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-black text-black uppercase tracking-wide text-sm mb-6">Top 5 Products by Revenue</h3>
                      {analytics.topProducts.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
                      ) : (
                        <div className="space-y-3">
                          {analytics.topProducts.map((p: any, i: number) => {
                            const maxRev = analytics.topProducts[0].revenue;
                            const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                            return (
                              <div key={i}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="font-semibold text-gray-800 truncate max-w-[60%]">{p.name}</span>
                                  <span className="font-black text-gray-900">₹{p.revenue.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs text-gray-400 w-14 text-right">{p.unitsSold} units</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Recent Orders ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-black uppercase tracking-wide text-sm">Recent Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-gray-400 hover:text-black transition">View All →</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                            <th className="pb-3 text-left">Order ID</th>
                            <th className="pb-3 text-left">Customer</th>
                            <th className="pb-3 text-left">Items</th>
                            <th className="pb-3 text-left">Amount</th>
                            <th className="pb-3 text-left">Status</th>
                            <th className="pb-3 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {analytics.recentOrders.map((o: any) => {
                            const statusColor: Record<string, string> = { accepted: 'bg-blue-100 text-blue-700', packaging: 'bg-amber-100 text-amber-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', pending: 'bg-gray-100 text-gray-600' };
                            return (
                              <tr key={o.id}>
                                <td className="py-3 font-mono text-xs text-gray-500">#{o.id.slice(-8).toUpperCase()}</td>
                                <td className="py-3 text-gray-800 font-semibold text-xs">{o.customerName || '—'}</td>
                                <td className="py-3 text-gray-700">{o.itemCount} item{o.itemCount !== 1 ? 's' : ''}</td>
                                <td className="py-3 font-black text-gray-900">₹{o.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status?.toUpperCase()}</span></td>
                                <td className="py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                              </tr>
                            );
                          })}
                          {analytics.recentOrders.length === 0 && (
                            <tr><td colSpan={6} className="py-8 text-center text-gray-400">No orders yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Tags / Keywords <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input type="text" value={productForm.tags} onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })} className={inputCls} placeholder="e.g., Office Wear, TPR Sole, Leather" />
                  </div>
                  <div>
                    <label className={labelCls}>Available Colors <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input type="text" value={productForm.colors} onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })} className={inputCls} placeholder="e.g., Black, Brown, Tan" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className={labelCls}>Material</label>
                  <input type="text" value={productForm.material} onChange={(e) => setProductForm({ ...productForm, material: e.target.value })} className={inputCls} placeholder="e.g., Premium Leather, Faux Leather, Mesh" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Features</label>
                    <textarea value={productForm.features} onChange={(e) => setProductForm({ ...productForm, features: e.target.value })} className={inputCls} rows={3} placeholder="e.g., Non-slip sole, Padded insole, Breathable..." />
                  </div>
                  <div>
                    <label className={labelCls}>Specifications</label>
                    <textarea value={productForm.specifications} onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })} className={inputCls} rows={3} placeholder="e.g., Sole: TPR, Upper: Leather, Occasion: Formal..." />
                  </div>
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
                    <button type="button" onClick={() => { setEditingProductId(null); setProductForm({ name: '', description: '', mrp: '', price: '', image: '', images: [], brand: '', family: '', subfamilyId: '', categoryId: '', subcategoryId: '', tags: '', colors: '', material: '', features: '', specifications: '' }); setSizeVariants([{ size: '', quantity: 0 }]); }} className={secondaryBtn}>
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
                        <div key={product.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition ${!product.isVisible ? 'opacity-50' : ''}`}>
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
                              {!product.isVisible && (
                                <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0">Hidden</span>
                              )}
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
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleToggleVisibility(product)}
                              title={product.isVisible ? 'Hide product' : 'Show product'}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${product.isVisible ? 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black' : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                            >
                              {product.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              {product.isVisible ? 'Hide' : 'Show'}
                            </button>
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Used</th>
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
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                                {coupon.usageCount ?? 0}×
                              </span>
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
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
                <button onClick={fetchOrders} className="text-sm font-semibold text-gray-600 hover:text-black transition">↻ Refresh</button>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      accepted: 'bg-blue-100 text-blue-700',
                      packaging: 'bg-amber-100 text-amber-700',
                      shipped: 'bg-purple-100 text-purple-700',
                      delivered: 'bg-green-100 text-green-700',
                      pending: 'bg-gray-100 text-gray-600',
                      cancelled: 'bg-red-100 text-red-700',
                      return_requested: 'bg-orange-100 text-orange-700',
                    };
                    const paymentStatusColors: Record<string, string> = {
                      razorpay: 'bg-indigo-100 text-indigo-700',
                      cod: 'bg-yellow-100 text-yellow-700',
                    };
                    const isExpanded = expandedOrderId === order.id;
                    const productTypes = [...new Set(order.items?.map((i: any) => i.product?.name || 'Product'))].slice(0, 2).join(', ');

                    return (
                      <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        {/* Compact Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center text-sm">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                              <p className="font-mono text-xs font-bold text-gray-800">#{order.id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Customer</p>
                              <p className="font-semibold text-gray-900 truncate">{order.user?.name || 'Guest'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order Status</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                {order.status?.toUpperCase().replace('_', ' ')}
                              </span>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Product</p>
                              <p className="text-gray-700 text-xs truncate">{productTypes || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Payment</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${paymentStatusColors[order.paymentMethod] || 'bg-gray-100 text-gray-600'}`}>
                                {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-black border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition whitespace-nowrap"
                          >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 px-5 py-5 space-y-5 bg-gray-50">
                            {/* Customer Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="bg-white rounded-xl border border-gray-100 p-4">
                                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Customer Details</p>
                                <div className="space-y-1.5 text-sm">
                                  <p><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-900">{order.user?.name || '—'}</span></p>
                                  <p><span className="text-gray-500">Phone:</span> <span className="font-semibold text-gray-900">{order.user?.phone || '—'}</span></p>
                                  <p><span className="text-gray-500">Email:</span> <span className="font-semibold text-gray-900">{order.user?.email || '—'}</span></p>
                                  <p><span className="text-gray-500">Address:</span> <span className="font-semibold text-gray-900 whitespace-pre-line">{order.shippingAddress || [order.user?.address, order.user?.city, order.user?.state, order.user?.zipCode, order.user?.country].filter(Boolean).join(', ') || '—'}</span></p>
                                </div>
                              </div>
                              <div className="bg-white rounded-xl border border-gray-100 p-4">
                                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Order Details</p>
                                <div className="space-y-1.5 text-sm">
                                  <p><span className="text-gray-500">Order ID:</span> <span className="font-mono font-bold">#{order.id}</span></p>
                                  <p><span className="text-gray-500">Date:</span> <span className="font-semibold">{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></p>
                                  <p><span className="text-gray-500">Total:</span> <span className="font-black text-black">₹{order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
                                  <p><span className="text-gray-500">Payment Method:</span> <span className="font-semibold">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}</span></p>
                                  <p><span className="text-gray-500">Payment Status:</span> <span className={`font-bold ${order.paymentMethod === 'cod' ? 'text-yellow-600' : 'text-green-600'}`}>{order.paymentMethod === 'cod' ? 'Pending (COD)' : 'Paid'}</span></p>
                                  {order.paymentId && order.paymentId !== 'COD' && (
                                    <p><span className="text-gray-500">Payment ID:</span> <span className="font-mono text-xs">{order.paymentId}</span></p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Products */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Products Ordered</p>
                              <div className="space-y-3">
                                {order.items?.map((item: any) => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    {item.product?.image && (
                                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900 text-sm">{item.product?.name || 'Product'}</p>
                                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                                        {item.size && <span>Size: <strong>{item.size}</strong></span>}
                                        {item.color && <span>Colour: <strong>{item.color}</strong></span>}
                                        <span>Qty: <strong>{item.quantity}</strong></span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-black text-sm text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                      <p className="text-xs text-gray-400">₹{item.price.toLocaleString('en-IN')} each</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status + Tracking */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Update Order</p>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex items-center gap-2 flex-1">
                                  <label className="text-sm text-gray-600 whitespace-nowrap">Status:</label>
                                  <select
                                    value={order.status}
                                    disabled={updatingOrderId === order.id}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-black transition disabled:opacity-50"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="packaging">Packaging</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                  {updatingOrderId === order.id && (
                                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  <label className="text-sm text-gray-600 whitespace-nowrap">Tracking ID:</label>
                                  <input
                                    type="text"
                                    value={trackingInputs[order.id] ?? order.trackingId ?? ''}
                                    onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                    placeholder="Enter tracking ID"
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition"
                                  />
                                  <button
                                    onClick={() => handleSaveTrackingId(order.id)}
                                    disabled={savingTrackingId === order.id}
                                    className="px-3 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-amber-400 hover:text-black transition disabled:opacity-50"
                                  >
                                    {savingTrackingId === order.id ? '...' : 'Save'}
                                  </button>
                                </div>
                              </div>
                              {order.trackingId && (
                                <p className="text-xs text-green-600 mt-2 font-medium">Current Tracking ID: <span className="font-mono font-bold">{order.trackingId}</span></p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">

              {/* Change Name */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <PencilIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-black text-sm uppercase tracking-wide">Change Display Name</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Update your admin profile name</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChangeName()}
                    placeholder="Your name"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition"
                  />
                  <button
                    onClick={handleChangeName}
                    disabled={nameLoading || !adminName.trim()}
                    className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-amber-400 hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {nameLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : 'Save'}
                  </button>
                </div>
                {nameSuccess && (
                  <div className="flex items-center gap-2 mt-3 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> {nameSuccess}
                  </div>
                )}
              </div>

              {/* Create New Admin */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-black text-sm uppercase tracking-wide">Create Admin User</h3>
                    <p className="text-xs text-gray-400 mt-0.5">New user will have full admin access</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newAdminForm.name}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition"
                  />
                  <input
                    type="email"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition"
                  />
                  <input
                    type="password"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    placeholder="Password (min 6 characters)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition"
                  />
                  <input
                    type="password"
                    value={newAdminForm.confirmPassword}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition ${
                      newAdminForm.confirmPassword && newAdminForm.password !== newAdminForm.confirmPassword
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-black'
                    }`}
                  />
                  {newAdminForm.confirmPassword && newAdminForm.password !== newAdminForm.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                  )}
                  {newAdminError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {newAdminError}
                    </div>
                  )}
                  {newAdminSuccess && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" /> {newAdminSuccess}
                    </div>
                  )}
                  <button
                    onClick={handleCreateAdminUser}
                    disabled={newAdminLoading}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-400 hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {newAdminLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Create Admin</>
                    )}
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-black text-sm uppercase tracking-wide">Sign Out</h3>
                    <p className="text-xs text-gray-400 mt-0.5">End your current admin session</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

            </div>
          )}

          {/* ═══════════════ HOMEPAGE TAB ═══════════════ */}
          {activeTab === 'homepage' && (
            <div className="space-y-10">
              {homepageSaveMsg && (
                <div className={`px-5 py-3 rounded-lg text-sm font-semibold ${homepageSaveMsg.includes('failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {homepageSaveMsg}
                </div>
              )}

              {/* ── Search bar for product picker ── */}
              <input
                type="text"
                placeholder="Search products by name or brand…"
                value={homepageSearch}
                onChange={e => setHomepageSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />

              {/* ── Featured Products (New Arrivals) ── */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">New Arrivals — Featured Products</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Select exactly 4 products to show in the New Arrivals section on the homepage.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${homepageFeaturedIds.length === 4 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {homepageFeaturedIds.length}/4 selected
                    </span>
                    <button
                      onClick={() => saveHomepage('featured', homepageFeaturedIds)}
                      disabled={homepageSaving === 'featured' || homepageFeaturedIds.length === 0}
                      className="px-5 py-2 bg-black text-white text-sm font-black uppercase tracking-wider rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                    >
                      {homepageSaving === 'featured' ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>

                {homepageProductsError && allProductsForHomepage.length === 0 ? (
                  <p className="text-red-500 text-sm py-6 text-center">{homepageProductsError}</p>
                ) : allProductsForHomepage.length === 0 ? (
                  <p className="text-gray-400 text-sm py-6 text-center">Loading products…</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-5">
                    {allProductsForHomepage.filter(p => !homepageSearch || p.name.toLowerCase().includes(homepageSearch.toLowerCase()) || (p.brand || '').toLowerCase().includes(homepageSearch.toLowerCase())).map(product => {
                      const selected = homepageFeaturedIds.includes(product.id);
                      return (
                        <button
                          type="button"
                          key={product.id}
                          onClick={() => {
                            if (selected) {
                              setHomepageFeaturedIds(ids => ids.filter(id => id !== product.id));
                            } else {
                              setHomepageFeaturedIds(ids => {
                                const without = ids.filter(id => id !== product.id);
                                return without.length >= 4 ? [...without.slice(1), product.id] : [...without, product.id];
                              });
                            }
                          }}
                          className={`relative rounded-xl border-2 overflow-hidden text-left transition-all ${selected ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                        >
                          {selected && (
                            <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-amber-400" />
                            </div>
                          )}
                          <div className="aspect-square bg-gray-50 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-2xl">CC</div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{product.brand}</p>
                            <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{product.name}</p>
                            <p className="text-xs font-black text-black mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Hero Slider Images ── */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Hero Slider — Shoe Images</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Select exactly 3 products whose images will be shown in the homepage hero slider.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${homepageHeroIds.length === 3 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {homepageHeroIds.length}/3 selected
                    </span>
                    <button
                      onClick={() => saveHomepage('hero', homepageHeroIds)}
                      disabled={homepageSaving === 'hero' || homepageHeroIds.length === 0}
                      className="px-5 py-2 bg-black text-white text-sm font-black uppercase tracking-wider rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                    >
                      {homepageSaving === 'hero' ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>

                {homepageProductsError && allProductsForHomepage.length === 0 ? (
                  <p className="text-red-500 text-sm py-6 text-center">{homepageProductsError}</p>
                ) : allProductsForHomepage.length === 0 ? (
                  <p className="text-gray-400 text-sm py-6 text-center">Loading products…</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-5">
                    {allProductsForHomepage.filter(p => !homepageSearch || p.name.toLowerCase().includes(homepageSearch.toLowerCase()) || (p.brand || '').toLowerCase().includes(homepageSearch.toLowerCase())).map(product => {
                      const selected = homepageHeroIds.includes(product.id);
                      return (
                        <button
                          type="button"
                          key={product.id}
                          onClick={() => {
                            if (selected) {
                              setHomepageHeroIds(ids => ids.filter(id => id !== product.id));
                            } else {
                              setHomepageHeroIds(ids => {
                                const without = ids.filter(id => id !== product.id);
                                return without.length >= 3 ? [...without.slice(1), product.id] : [...without, product.id];
                              });
                            }
                          }}
                          className={`relative rounded-xl border-2 overflow-hidden text-left transition-all ${selected ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                        >
                          {selected && (
                            <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-amber-400" />
                            </div>
                          )}
                          <div className="aspect-square bg-gray-50 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-2xl">CC</div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{product.brand}</p>
                            <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{product.name}</p>
                            <p className="text-xs font-black text-black mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        {/* ── Reels Tab ── */}
        {activeTab === 'reels' && (
          <div className="p-6 sm:p-8 max-w-3xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-black text-black">Add Reel</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${reels.length >= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{reels.length}/3</span>
              </div>
              <p className="text-xs text-gray-400 mb-5">{reels.length >= 3 ? 'Maximum 3 reels reached. Remove one to add another.' : 'Paste an Instagram or YouTube Reel URL'}</p>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Reel URL</label>
                  <input value={newReel.url} onChange={e => setNewReel(r => ({ ...r, url: e.target.value }))} placeholder="https://www.instagram.com/reel/..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Title (optional)</label>
                  <input value={newReel.title} onChange={e => setNewReel(r => ({ ...r, title: e.target.value }))} placeholder="e.g. New arrivals drop" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Show On</label>
                  <select value={newReel.page} onChange={e => setNewReel(r => ({ ...r, page: e.target.value as 'home' | 'about' | 'both' }))} className={inputCls}>
                    <option value="both">Homepage &amp; About Us</option>
                    <option value="home">Homepage only</option>
                    <option value="about">About Us only</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (!newReel.url.trim() || reels.length >= 3) return;
                    const updated = [...reels, { id: Date.now().toString(), url: newReel.url.trim(), title: newReel.title.trim(), page: newReel.page }];
                    setReels(updated);
                    saveReels(updated);
                    setNewReel({ url: '', title: '', page: 'both' });
                  }}
                  disabled={reels.length >= 3}
                  className={primaryBtn}
                >
                  <Plus className="w-4 h-4" /> Add Reel
                </button>
              </div>
            </div>

            {reelsSaveMsg && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold ${reelsSaveMsg.includes('failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{reelsSaveMsg}</div>
            )}

            {reels.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">All Reels</h3>
                <div className="space-y-3">
                  {reels.map(reel => (
                    <div key={reel.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Video className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {reel.title && <p className="text-sm font-bold text-gray-900 truncate">{reel.title}</p>}
                        <p className="text-xs text-gray-400 truncate">{reel.url}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {reel.page === 'both' ? 'Home & About' : reel.page === 'home' ? 'Homepage' : 'About Us'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const updated = reels.filter(r => r.id !== reel.id);
                          setReels(updated);
                          saveReels(updated);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {reels.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No reels added yet</p>
              </div>
            )}
          </div>
        )}

        {/* ── Deals Tab ── */}
        {activeTab === 'deals' && (
          <div className="p-6 sm:p-8 max-w-4xl space-y-6">
            {dealSaveMsg && (
              <div className={`px-4 py-3 rounded-lg text-sm font-semibold ${dealSaveMsg.includes('failed') || dealSaveMsg.includes('Set') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{dealSaveMsg}</div>
            )}

            {/* Add / Edit Deal Product Form */}
            <div id="deal-product-form" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-black text-black">{editingDealId ? 'Edit Deal Product' : 'Add Deal Product'}</h2>
                {editingDealId && (
                  <button onClick={resetDealForm} className="text-xs font-bold text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition">
                    Cancel Edit
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-5">These products are exclusive to Deal of the Day — separate from the main catalogue</p>
              {dealFormError && <p className="text-xs text-red-600 font-semibold mb-3">{dealFormError}</p>}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Product Name *</label>
                    <input value={dealForm.name} onChange={e => setDealForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Derby Oxford" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Category *</label>
                    <select value={dealForm.category} onChange={e => setDealForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                      {DEAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Price (₹) *</label>
                    <input type="number" min={0} value={dealForm.price} onChange={e => setDealForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 1299" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={dealForm.description} onChange={e => setDealForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of the product…" rows={2} className={inputCls + ' resize-none'} />
                </div>
                <div>
                  <label className={labelCls}>Sizes &amp; Quantity (UK) *</label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-black transition flex-1">
                      <span className="px-2.5 py-2 bg-gray-50 border-r border-gray-200 text-xs font-semibold text-gray-500 select-none whitespace-nowrap">UK</span>
                      <input
                        value={dealSizeInput}
                        onChange={e => setDealSizeInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addDealSize()}
                        placeholder="e.g. 8, 8.5, 10"
                        className="flex-1 px-2.5 py-2 text-sm outline-none bg-white"
                      />
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={dealQtyInput}
                      onChange={e => setDealQtyInput(e.target.value)}
                      placeholder="Qty"
                      className="w-20 border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-black transition"
                    />
                    <button type="button" onClick={addDealSize} className="px-3 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition whitespace-nowrap">
                      + Add
                    </button>
                  </div>
                  {dealForm.sizeVariants.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dealForm.sizeVariants.map(sv => (
                        <div key={sv.size} className="flex items-center gap-1 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          UK {sv.size} × {sv.quantity}
                          <button type="button" onClick={() => setDealForm(f => ({ ...f, sizeVariants: f.sizeVariants.filter(s => s.size !== sv.size) }))} className="ml-1 hover:text-gray-300 transition">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Main Image *</label>
                    <ImageUpload key={`deal-img-main-${dealFormKey}`} label="" currentImage={dealForm.image} onUploadComplete={url => setDealForm(f => ({ ...f, image: url }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Image 2 (optional)</label>
                    <ImageUpload key={`deal-img-2-${dealFormKey}`} label="" currentImage={dealForm.image2} onUploadComplete={url => setDealForm(f => ({ ...f, image2: url }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Image 3 (optional)</label>
                    <ImageUpload key={`deal-img-3-${dealFormKey}`} label="" currentImage={dealForm.image3} onUploadComplete={url => setDealForm(f => ({ ...f, image3: url }))} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={saveDealItem} disabled={dealFormSaving} className={primaryBtn}>
                    {dealFormSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editingDealId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingDealId ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Deal Products List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-black mb-1">Deal Products ({dealItems.length})</h2>
              <p className="text-xs text-gray-400 mb-4">Toggle active/inactive to control what users see during the deal window</p>
              {dealItems.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No deal products yet — add one above</p>
              ) : (
                <div className="space-y-3">
                  {dealItems.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${item.isActive ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                      {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}{item.price ? ` · ₹${item.price.toLocaleString('en-IN')}` : ''}</p>
                        {item.images && item.images.length > 0 && <p className="text-[10px] text-gray-400 mb-1">{item.images.length + 1} images</p>}
                        <div className="flex flex-wrap gap-1">
                          {(item.sizeVariants || []).map(sv => <span key={sv.size} className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600">UK {sv.size} ×{sv.quantity}</span>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleDealItem(item.id, !item.isActive)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${item.isActive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => startEditDealItem(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDealItem(item.id)}
                          disabled={deletingDealItem === item.id}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                        >
                          {deletingDealItem === item.id ? <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <X className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deal Window */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-black mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Deal Window</h2>
              <p className="text-xs text-gray-400 mb-5">The deal banner and products are only visible between these times</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date &amp; Time</label>
                  <input type="datetime-local" value={dealStartDate} onChange={e => setDealStartDate(e.target.value)} className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1">Default: 9:00 AM</p>
                </div>
                <div>
                  <label className={labelCls}>End Date &amp; Time</label>
                  <input type="datetime-local" value={dealEndDate} onChange={e => setDealEndDate(e.target.value)} className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1">Default: 9:00 PM</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                {dealStartDate && (
                  <button onClick={clearDeal} className={secondaryBtn}>
                    <X className="w-4 h-4" /> Clear Window
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!dealStartDate) { const t = new Date(); t.setHours(9, 0, 0, 0); setDealStartDate(t.toISOString().slice(0, 16)); }
                    if (!dealEndDate) { const t = new Date(); t.setHours(21, 0, 0, 0); setDealEndDate(t.toISOString().slice(0, 16)); }
                    saveDeal();
                  }}
                  disabled={dealSaving}
                  className={primaryBtn}
                >
                  {dealSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Flame className="w-4 h-4" />}
                  Save Window
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </main>
    </div>
  );
}
