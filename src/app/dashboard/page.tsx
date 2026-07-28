'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, ShoppingCart, ArrowUpRight } from 'lucide-react';

const mockSalesData = [
  { date: 'Jul 21', revenue: 12400, units: 320 },
  { date: 'Jul 22', revenue: 14200, units: 380 },
  { date: 'Jul 23', revenue: 11800, units: 290 },
  { date: 'Jul 24', revenue: 16500, units: 410 },
  { date: 'Jul 25', revenue: 18900, units: 470 },
  { date: 'Jul 26', revenue: 21000, units: 530 },
  { date: 'Jul 27', revenue: 19400, units: 490 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Pricing & Revenue Analytics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">$114,200</p>
          <span className="text-xs text-emerald-600 flex items-center mt-1">
            <ArrowUpRight className="w-4 h-4 mr-1" /> +12.5% vs last week
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Units Sold</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><ShoppingCart className="w-5 h-5" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">2,890</p>
          <span className="text-xs text-indigo-600 flex items-center mt-1">
            <ArrowUpRight className="w-4 h-4 mr-1" /> +8.2% vs last week
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Avg Profit Margin</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">24.8%</p>
          <span className="text-xs text-amber-600 flex items-center mt-1">
            <ArrowUpRight className="w-4 h-4 mr-1" /> +2.1% optimization boost
          </span>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Trend (7-Day Overview)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockSalesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="#e0e7ff" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}