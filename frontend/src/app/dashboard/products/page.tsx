'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number | string;
  sku: string;
  name: string;
  category: string;
  current_price: number;
  cost_price: number;
  optimal_price: number;
  stock_level: number;
  demand_trend: string;
  competitor_price: number;
  image_url: string;
  source: string;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    sku: 'SKU-1001',
    name: 'iPhone 15 Pro',
    category: 'Electronics',
    current_price: 999.99,
    cost_price: 680.0,
    optimal_price: 959.99,
    stock_level: 45,
    demand_trend: 'Increasing',
    competitor_price: 1020.0,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop',
    source: 'Database',
  },
  {
    id: 2,
    sku: 'SKU-1002',
    name: 'MacBook Air M3',
    category: 'Electronics',
    current_price: 1099.0,
    cost_price: 750.0,
    optimal_price: 1055.0,
    stock_level: 30,
    demand_trend: 'Increasing',
    competitor_price: 1120.0,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop',
    source: 'Database',
  },
  {
    id: 3,
    sku: 'SKU-1003',
    name: 'Apple iPhone Charger',
    category: 'Electronics',
    current_price: 19.99,
    cost_price: 13.59,
    optimal_price: 19.57,
    stock_level: 31,
    demand_trend: 'Increasing',
    competitor_price: 20.39,
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop',
    source: 'Database',
  },
  {
    id: 4,
    sku: 'SKU-1004',
    name: 'Sony WH-1000XM5',
    category: 'Electronics',
    current_price: 398.0,
    cost_price: 240.0,
    optimal_price: 382.08,
    stock_level: 60,
    demand_trend: 'Stable',
    competitor_price: 410.0,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
    source: 'Database',
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    current_price: '',
    cost_price: '',
    stock_level: '',
    competitor_price: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [category, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const url = `http://localhost:8000/api/v1/products${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Backend unreachable, using local fallback products.');
      let filtered = FALLBACK_PRODUCTS;
      if (category !== 'All') {
        filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      if (searchQuery.trim()) {
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        current_price: parseFloat(formData.current_price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock_level: parseInt(formData.stock_level, 10) || 0,
        competitor_price: parseFloat(formData.competitor_price) || 0,
        demand_trend: 'Increasing',
      };

      if (editingProduct && typeof editingProduct.id === 'number') {
        // Backend DB Update
        await fetch(`http://localhost:8000/api/v1/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (editingProduct) {
        // Local / API Item Edit in UI State
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingProduct.id
              ? {
                  ...item,
                  name: formData.name,
                  category: formData.category,
                  current_price: payload.current_price,
                  cost_price: payload.cost_price,
                  optimal_price: Math.round(payload.current_price * 0.96 * 100) / 100,
                  competitor_price: payload.competitor_price,
                  stock_level: payload.stock_level,
                }
              : item
          )
        );
      } else {
        // Create New Product
        await fetch('http://localhost:8000/api/v1/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Electronics',
        current_price: '',
        cost_price: '',
        stock_level: '',
        competitor_price: '',
      });
      fetchProducts();
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    // Optimistically remove from state immediately
    setProducts((prev) => prev.filter((p) => p.id !== id));

    if (typeof id === 'number') {
      try {
        await fetch(`http://localhost:8000/api/v1/products/${id}`, {
          method: 'DELETE',
        });
      } catch (err: any) {
        console.error(`Delete Error: ${err.message}`);
      }
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      current_price: p.current_price?.toString() || '0',
      cost_price: p.cost_price?.toString() || (p.current_price * 0.68).toFixed(2),
      stock_level: p.stock_level?.toString() || '50',
      competitor_price: p.competitor_price?.toString() || (p.current_price * 1.05).toFixed(2),
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products & Pricing Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage catalog items, monitor live competitor rates, and review optimal price benchmarks
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              category: 'Electronics',
              current_price: '',
              cost_price: '',
              stock_level: '',
              competitor_price: '',
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          + Add Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Electronics', 'Apparel', 'Fragrances', 'Beauty', 'Furniture'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search products by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm font-semibold">
          Loading catalog telemetry...
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm font-medium">
          No products matched your search filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.sku}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Our Price
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        ${Number(item.current_price).toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                        Optimal Price
                      </span>
                      <span className="text-base font-extrabold text-emerald-600">
                        ${Number(item.optimal_price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                    <span>Benchmark: ${Number(item.competitor_price).toFixed(2)}</span>
                    <span>Stock: {item.stock_level}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <span
                  className={`block text-center text-[11px] font-bold py-1 rounded-md ${
                    item.demand_trend === 'Increasing'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.demand_trend === 'Decreasing'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.demand_trend} Demand
                </span>

                {/* Edit & Delete Controls for EVERY product */}
                <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Edit
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Mechanical Keyboard"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fragrances">Fragrances</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="35.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.current_price}
                    onChange={(e) =>
                      setFormData({ ...formData, current_price: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="59.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Competitor ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.competitor_price}
                    onChange={(e) =>
                      setFormData({ ...formData, competitor_price: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="64.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_level}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_level: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}