'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AnalyticsData {
  total_revenue: number;
  units_sold: number;
  avg_profit_margin: number;
  revenue_trend: { date: string; revenue: number }[];
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/products/analytics/summary');
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch real-time analytics data from backend.');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-slate-600">Loading live revenue analytics...</div>;
  if (error) return <div className="p-8 text-rose-600 font-semibold">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pricing & Revenue Analytics</h1>
        <p className="text-sm text-slate-500">Live aggregate metrics calculated directly from database</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              ${data?.total_revenue.toLocaleString() || '0'}
            </h2>
            <p className="text-xs text-emerald-600 font-medium mt-1">↗ Live Database Sync</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xl">
            $
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Units Sold</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              {data?.units_sold.toLocaleString() || '0'}
            </h2>
            <p className="text-xs text-blue-600 font-medium mt-1">↗ Real Catalog Count</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">
            🛒
          </div>
        </div>

        {/* Avg Profit Margin */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Profit Margin</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              {data?.avg_profit_margin}%
            </h2>
            <p className="text-xs text-amber-600 font-medium mt-1">↗ Calculated across catalog</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 font-bold text-xl">
            %
          </div>
        </div>
      </div>

      {/* Interactive 7-Day Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Trend (7-Day Overview)</h3>
        <div className="h-72 w-full">
          {data?.revenue_trend && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}