'use client';

import { useState } from 'react';
import { Product } from '@/types';

const initialProducts: Product[] = [
  { 
    id: '1', 
    name: 'Wireless Headphones Pro', 
    sku: 'HP-100', 
    category: 'Electronics', 
    currentPrice: 199.99, 
    optimalPrice: 219.99, 
    stock: 120, 
    demandTrend: 'Increasing' 
  },
  { 
    id: '2', 
    name: 'Ergonomic Office Chair', 
    sku: 'OC-200', 
    category: 'Furniture', 
    currentPrice: 299.99, 
    optimalPrice: 289.99, 
    stock: 45, 
    demandTrend: 'Stable' 
  },
  { 
    id: '3', 
    name: 'Smart Fitness Watch', 
    sku: 'SW-300', 
    category: 'Electronics', 
    currentPrice: 149.99, 
    optimalPrice: 169.99, 
    stock: 200, 
    demandTrend: 'Increasing' 
  },
];

export default function ProductsPage() {
  const [products] = useState<Product[]>(initialProducts);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Catalog & Pricing</h1>
          <p className="text-sm text-slate-500">Manage products and inspect pricing dynamics</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Current Price</th>
              <th className="p-4">AI Optimal Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Demand Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{product.name}</td>
                <td className="p-4 text-slate-500">{product.sku}</td>
                <td className="p-4 text-slate-600">{product.category}</td>
                <td className="p-4 font-semibold text-slate-900">${product.currentPrice.toFixed(2)}</td>
                <td className="p-4 font-semibold text-emerald-600">${product.optimalPrice.toFixed(2)}</td>
                <td className="p-4 text-slate-600">{product.stock}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.demandTrend === 'Increasing' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {product.demandTrend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}