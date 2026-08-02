'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  sku?: string;
  name: string;
  category: string;
  current_price: number;
  cost_price?: number;
  optimal_price?: number;
  stock_level: number;
  demand_trend: string;
  competitor_price?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating a new product
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    current_price: '',
    cost_price: '',
    stock_level: '',
    demand_trend: 'Increasing',
    competitor_price: '',
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/products');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch products from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Create Product submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        current_price: parseFloat(formData.current_price) || 0.0,
        cost_price: parseFloat(formData.cost_price) || 0.0,
        stock_level: parseInt(formData.stock_level, 10) || 0,
        demand_trend: formData.demand_trend,
        competitor_price: parseFloat(formData.competitor_price) || 0.0,
      };

      const res = await fetch('http://localhost:8000/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create product');

      setIsModalOpen(false);
      setFormData({
        name: '',
        category: 'Electronics',
        current_price: '',
        cost_price: '',
        stock_level: '',
        demand_trend: 'Increasing',
        competitor_price: '',
      });
      fetchProducts();
    } catch (err: any) {
      alert(`Error adding product: ${err.message}`);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  return (
    <div className="p-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog & Pricing</h1>
          <p className="text-sm text-slate-500">Manage products and inspect pricing dynamics</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Add Product
        </button>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading products from database...</div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      ) : products.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          No products found. Click "+ Add Product" to add your first item.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Current Price</th>
                <th className="px-6 py-4">AI Optimal Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Demand Trend</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((item, index) => {
                const sku = item.sku || `SKU-${item.id + 1000}`;
                const price = item.current_price || 0;
                const optimalPrice = item.optimal_price || price * 1.05;

                return (
                  <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-500">{sku}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">${Number(price).toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">${Number(optimalPrice).toFixed(2)}</td>
                    <td className="px-6 py-4">{item.stock_level ?? 0} units</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.demand_trend === 'Increasing'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.demand_trend === 'Decreasing'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.demand_trend || 'Stable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="text-rose-600 hover:text-rose-800 font-medium text-xs px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add New Product</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Smart Watch"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Demand Trend</label>
                  <select
                    value={formData.demand_trend}
                    onChange={(e) => setFormData({ ...formData, demand_trend: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Increasing">Increasing</option>
                    <option value="Stable">Stable</option>
                    <option value="Decreasing">Decreasing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Stock Level</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_level}
                    onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}