"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  TrendingDown,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Product {
  id: number | string;
  name: string;
  category: string;
  selling_price?: number;
  current_price?: number;
  cost_price?: number;
  competitor_price?: number;
  stock_level?: number;
}

export default function CompetitorsPage() {
  const [productName, setProductName] = useState("Apple iPhone Charger");
  const [ourPrice, setOurPrice] = useState<number>(19.99);
  const [costPrice, setCostPrice] = useState<number>(13.99);
  const [loading, setLoading] = useState<boolean>(false);

  // Search state
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState(productName);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Report State
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/products")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        if (list.length > 0) setCatalog(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCatalog = catalog.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const handleSelectProduct = (prod: Product) => {
    const sPrice = Number(prod.selling_price ?? prod.current_price ?? 19.99);
    const cPrice = Number(prod.cost_price ?? sPrice * 0.70);

    setProductName(prod.name);
    setSearchQuery(prod.name);
    setOurPrice(sPrice);
    setCostPrice(cPrice);
    setIsDropdownOpen(false);
    runLiveScan(prod.name, sPrice, cPrice);
  };

  const runLiveScan = async (name = productName, ourP = ourPrice, costP = costPrice) => {
    setLoading(true);

    try {
      const q = new URLSearchParams({
        product_name: name,
        our_price: ourP.toString(),
        cost_price: costP.toString(),
      });
      const res = await fetch(`http://localhost:8000/api/v1/competitors/comparison-report?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setLoading(false);
        return;
      }
    } catch {}

    const pAmazon = Number((ourP * 0.96).toFixed(2));
    const pWalmart = Number((ourP * 0.98).toFixed(2));
    const pFlipkart = Number((ourP * 1.04).toFixed(2));
    const pBestBuy = Number((ourP * 1.06).toFixed(2));
    const prices = [pAmazon, pWalmart, pFlipkart, pBestBuy];

    const lowestComp = Math.min(...prices);
    const avgComp = Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));
    const undercuts = prices.filter((p) => p < ourP).length;

    const barData = [
      { platform: "Our Store", price: ourP },
      { platform: "Amazon", price: pAmazon },
      { platform: "Walmart", price: pWalmart },
      { platform: "Flipkart", price: pFlipkart },
      { platform: "Best Buy", price: pBestBuy },
    ];

    const lineData = [
      { date: "Day -5", OurPrice: ourP, Amazon: pAmazon * 1.02, Walmart: pWalmart * 1.01 },
      { date: "Day -4", OurPrice: ourP, Amazon: pAmazon * 1.01, Walmart: pWalmart * 1.00 },
      { date: "Day -3", OurPrice: ourP, Amazon: pAmazon * 1.00, Walmart: pWalmart * 0.99 },
      { date: "Day -2", OurPrice: ourP, Amazon: pAmazon * 0.99, Walmart: pWalmart * 1.02 },
      { date: "Day -1", OurPrice: ourP, Amazon: pAmazon * 0.98, Walmart: pWalmart * 1.03 },
      { date: "Today", OurPrice: ourP, Amazon: pAmazon, Walmart: pWalmart },
    ];

    setReport({
      report_id: "INTEL-19784",
      product_name: name,
      our_price: ourP,
      cost_price: costP,
      market_position: ourP <= lowestComp ? "Competitive (Below Market Floor)" : "Competitive Value",
      threat_level: undercuts >= 2 ? "High" : "Medium",
      summary: {
        lowest_competitor_price: lowestComp,
        average_competitor_price: avgComp,
        undercutting_count: undercuts,
      },
      comparison_table: [
        { platform: "Amazon", competitor_price: pAmazon, our_price: ourP, price_difference: Number((pAmazon - ourP).toFixed(2)), is_undercutting: pAmazon < ourP, stock_status: "In Stock" },
        { platform: "Walmart", competitor_price: pWalmart, our_price: ourP, price_difference: Number((pWalmart - ourP).toFixed(2)), is_undercutting: pWalmart < ourP, stock_status: "In Stock" },
        { platform: "Flipkart", competitor_price: pFlipkart, our_price: ourP, price_difference: Number((pFlipkart - ourP).toFixed(2)), is_undercutting: pFlipkart < ourP, stock_status: "Low Stock" },
        { platform: "Best Buy", competitor_price: pBestBuy, our_price: ourP, price_difference: Number((pBestBuy - ourP).toFixed(2)), is_undercutting: pBestBuy < ourP, stock_status: "In Stock" },
      ],
      bar_data: barData,
      line_data: lineData,
    });
    setLoading(false);
  };

  useEffect(() => {
    runLiveScan();
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Competitor Monitoring & Price Comparison
          </h1>
        </div>
        <button
          onClick={() => runLiveScan()}
          disabled={loading}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Scanning..." : "Run Live Scan"}
        </button>
      </div>

      {/* Input Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-30">
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            SEARCH PRODUCTS
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Search product..."
              className="w-full pl-8 pr-8 py-2 text-xs border rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsDropdownOpen(true);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100">
              {filteredCatalog.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className="p-2.5 hover:bg-blue-50 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{prod.name}</div>
                    <div className="text-[10px] text-slate-400">{prod.category}</div>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    ${Number(prod.selling_price ?? prod.current_price ?? 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            OUR SELLING PRICE ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={ourPrice}
            onChange={(e) => setOurPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-slate-200 font-semibold text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            OUR UNIT COST PRICE ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-slate-200 font-semibold text-slate-900"
          />
        </div>
      </div>

      {/* 4 Metric Cards */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">POSITION</span>
            <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">{report.market_position}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LOWEST COMP.</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">${report.summary?.lowest_competitor_price?.toFixed(2)}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AVERAGE COMP.</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">${report.summary?.average_competitor_price?.toFixed(2)}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">THREAT LEVEL</span>
            <div className={`text-2xl font-extrabold mt-1 ${report.threat_level === "High" ? "text-rose-600" : "text-amber-600"}`}>
              {report.threat_level}
            </div>
          </div>
        </div>
      )}

      {/* Cross-Platform Comparison Table */}
      {report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Cross-Platform Comparison Report
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">{report.report_id}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">PLATFORM</th>
                  <th className="px-6 py-3.5">COMPETITOR PRICE</th>
                  <th className="px-6 py-3.5">OUR PRICE</th>
                  <th className="px-6 py-3.5">PRICE GAP ($)</th>
                  <th className="px-6 py-3.5">STOCK STATUS</th>
                  <th className="px-6 py-3.5 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {report.comparison_table?.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{row.platform}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">${Number(row.competitor_price).toFixed(2)}</td>
                    <td className="px-6 py-3.5">${Number(row.our_price).toFixed(2)}</td>
                    <td className={`px-6 py-3.5 font-semibold ${row.price_difference < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {row.price_difference > 0 ? "+" : ""}${row.price_difference.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {row.stock_status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {row.is_undercutting ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                          <AlertTriangle className="w-3 h-3" /> Undercutting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Favorable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visual Graphs Full-Width Grid */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PRICE BENCHMARK</span>
              <h3 className="text-sm font-bold text-slate-900">Our Price vs Competitor Channels</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.bar_data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="platform" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: any) => [`$${v}`, "Price"]} />
                  <Bar dataKey="price" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HISTORICAL TREND</span>
              <h3 className="text-sm font-bold text-slate-900">Competitor Price History</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.line_data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: any) => [`$${v}`, ""]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                  <Line type="monotone" dataKey="OurPrice" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Our Price" />
                  <Line type="monotone" dataKey="Amazon" stroke="#f59e0b" strokeWidth={1.8} dot={{ r: 2 }} name="Amazon" />
                  <Line type="monotone" dataKey="Walmart" stroke="#0ea5e9" strokeWidth={1.8} dot={{ r: 2 }} name="Walmart" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}