"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  Search,
  X,
  Database,
} from "lucide-react";
import {
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
  stock_level?: number;
  stock?: number;
}

export default function RevenueOptimizationPage() {
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [priceDelta, setPriceDelta] = useState<number>(5);
  const [strategyMode, setStrategyMode] = useState<string>("balanced");
  const [loading, setLoading] = useState<boolean>(false);

  // Search state — dynamic directly from SQLite DB
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [simData, setSimData] = useState<any>(null);

  // Fetch all products directly from SQLite database (requesting limit=200 to load all 100)
  const fetchDbProducts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/products?limit=200");
      if (res.ok) {
        const data = await res.json();
        // Handle either array response or { products: [...] }
        const productList: Product[] = Array.isArray(data)
          ? data
          : data.products || [];

        if (productList.length > 0) {
          setCatalog(productList);
          // Auto-select the first product from your database if none selected
          if (!productName) {
            const first = productList[0];
            const sPrice = Number(first.selling_price ?? first.current_price ?? 0);
            const cPrice = Number(first.cost_price ?? sPrice * 0.7);

            setProductName(first.name);
            setSearchQuery(first.name);
            setSellingPrice(sPrice);
            setCostPrice(cPrice);
            runSimulation(first.name, sPrice, cPrice, 5, "balanced");
          }
        }
      }
    } catch (err) {
      console.error("Failed to load products from database:", err);
    }
  };

  useEffect(() => {
    fetchDbProducts();
  }, []);

  // Real-time search across ALL 100 products by name or category
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (prod) =>
        prod.name?.toLowerCase().includes(q) ||
        prod.category?.toLowerCase().includes(q)
    );
  }, [catalog, searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (prod: Product) => {
    const sPrice = Number(prod.selling_price ?? prod.current_price ?? 0);
    const cPrice = Number(prod.cost_price ?? sPrice * 0.7);

    setProductName(prod.name);
    setSearchQuery(prod.name);
    setSellingPrice(sPrice);
    setCostPrice(cPrice);
    setIsDropdownOpen(false);
    runSimulation(prod.name, sPrice, cPrice, priceDelta, strategyMode);
  };

  const runSimulation = async (
    name = productName,
    sPrice = sellingPrice,
    cPrice = costPrice,
    delta = priceDelta,
    mode = strategyMode
  ) => {
    if (!name || sPrice <= 0) return;
    setLoading(true);
    try {
      const q = new URLSearchParams({
        product_name: name,
        current_price: sPrice.toString(),
        cost_price: cPrice.toString(),
        price_adjustment_pct: delta.toString(),
        strategy: mode,
      });
      const res = await fetch(
        `http://localhost:8000/api/v1/revenue-optimization/simulate?${q.toString()}`
      );
      if (res.ok) {
        const json = await res.json();
        setSimData(json);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Dynamic mathematical simulation if backend simulator route is pending
    const simPrice = Number((sPrice * (1 + delta / 100)).toFixed(2));
    const unitMargin = Number((simPrice - cPrice).toFixed(2));
    const marginPct = Number(((unitMargin / simPrice) * 100).toFixed(1));
    const baseUnits = 45;
    const simUnits = Math.max(5, Math.round(baseUnits * (1 - (delta / 100) * 1.35)));
    const simRev = Number((simUnits * simPrice * 30).toFixed(2));
    const simProf = Math.round(simUnits * unitMargin * 30);
    const baseRev = baseUnits * sPrice * 30;
    const baseProf = baseUnits * (sPrice - cPrice) * 30;

    const curve = [-20, -15, -10, -5, 0, 5, 10, 15, 20, 25].map((step) => {
      const p = sPrice * (1 + step / 100);
      const u = Math.max(5, Math.round(baseUnits * (1 - (step / 100) * 1.35)));
      return {
        adjustment: `${step >= 0 ? "+" : ""}${step}%`,
        projected_revenue: Math.round(u * p * 30),
        projected_profit: Math.round(u * (p - cPrice) * 30),
      };
    });

    const strategies = [
      {
        name: "Market Penetration",
        suggested_price: Number((sPrice * 0.93).toFixed(2)),
        expected_volume_change: "+22%",
        margin_pct: Number((((sPrice * 0.93 - cPrice) / (sPrice * 0.93)) * 100).toFixed(1)),
        objective: "Max Volume & Market Share",
      },
      {
        name: "Profit Maximization (AI Recommended)",
        suggested_price: Number((sPrice * 1.05).toFixed(2)),
        expected_volume_change: "+5%",
        margin_pct: Number((((sPrice * 1.05 - cPrice) / (sPrice * 1.05)) * 100).toFixed(1)),
        objective: "Optimal Revenue & Net Margin",
      },
      {
        name: "Premium Skimming",
        suggested_price: Number((sPrice * 1.15).toFixed(2)),
        expected_volume_change: "-18%",
        margin_pct: Number((((sPrice * 1.15 - cPrice) / (sPrice * 1.15)) * 100).toFixed(1)),
        objective: "High Margin per Unit",
      },
    ];

    setSimData({
      simulation: {
        simulated_price: simPrice,
        unit_margin: unitMargin,
        margin_pct: marginPct,
        daily_volume: simUnits,
        simulated_revenue_30d: simRev,
        simulated_profit_30d: simProf,
        revenue_delta: Number((simRev - baseRev).toFixed(1)),
        profit_delta: simProf - baseProf,
      },
      simulation_curve: curve,
      strategies: strategies,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (productName) {
      runSimulation();
    }
  }, [priceDelta, strategyMode]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Revenue Optimization & Margin Simulator
          </h1>
        </div>
        <button
          onClick={() => runSimulation()}
          disabled={loading}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Simulating..." : "Run Optimization"}
        </button>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Autocomplete Search directly querying 100 SQLite Database items */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                SEARCH PRODUCTS
              </label>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                placeholder={`Search across ${catalog.length || 100} products...`}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-8 pr-7 py-2 text-xs border rounded-xl border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

            {/* Dropdown showing results from the 100 SQLite products */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
                {filteredCatalog.length > 0 ? (
                  filteredCatalog.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className="p-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-xs transition"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold block text-slate-900 truncate">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{prod.category}</span>
                      </div>
                      <span className="font-bold text-slate-900 whitespace-nowrap">
                        ${Number(prod.selling_price ?? prod.current_price ?? 0).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 font-medium">
                    No database product matches "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              BASE PRICE ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              UNIT COST ($COGS$)
            </label>
            <input
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              OPTIMIZATION OBJECTIVE
            </label>
            <select
              value={strategyMode}
              onChange={(e) => setStrategyMode(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="balanced">Balanced (Revenue & Profit)</option>
              <option value="aggressive_volume">Aggressive Volume Growth</option>
              <option value="premium_margin">Premium Margin Skimming</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PRICE ELASTICITY ADJUSTMENT SLIDER
            </span>
            <span className={`text-xs font-extrabold ${priceDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {priceDelta > 0 ? `+${priceDelta}%` : `${priceDelta}%`} (${simData?.simulation?.simulated_price || sellingPrice})
            </span>
          </div>
          <input
            type="range"
            min={-20}
            max={25}
            step={1}
            value={priceDelta}
            onChange={(e) => setPriceDelta(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* KPI Cards */}
      {simData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PROJECTED 30D REVENUE</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              ${simData.simulation.simulated_revenue_30d.toLocaleString()}
            </div>
            <span className={`text-[11px] font-semibold mt-1 block ${simData.simulation.revenue_delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {simData.simulation.revenue_delta >= 0 ? "+" : ""}${simData.simulation.revenue_delta.toLocaleString()} Delta
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PROJECTED 30D PROFIT</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              ${simData.simulation.simulated_profit_30d.toLocaleString()}
            </div>
            <span className={`text-[11px] font-semibold mt-1 block ${simData.simulation.profit_delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {simData.simulation.profit_delta >= 0 ? "+" : ""}${simData.simulation.profit_delta.toLocaleString()} Delta
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GROSS MARGIN %</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {simData.simulation.margin_pct}%
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Unit Profit: ${simData.simulation.unit_margin}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EST. DAILY VOLUME</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {simData.simulation.daily_volume} Units/day
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Elasticity Adjusted</span>
          </div>
        </div>
      )}

      {/* Simulation Line Chart */}
      {simData?.simulation_curve && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SIMULATION CURVE
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Projected Revenue vs. Profit Trajectory
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simData.simulation_curve}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="adjustment" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="projected_profit" stroke="#10b981" strokeWidth={2.5} name="30D Net Profit ($)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="projected_revenue" stroke="#2563eb" strokeWidth={2.5} name="30D Revenue ($)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pricing Strategy Recommendations Table */}
      {simData?.strategies && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Pricing Strategy Recommendations
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Algorithmically generated price points tailored to specific business objectives.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">STRATEGY</th>
                  <th className="px-6 py-3.5">SUGGESTED PRICE</th>
                  <th className="px-6 py-3.5">EXPECTED VOLUME</th>
                  <th className="px-6 py-3.5">GROSS MARGIN</th>
                  <th className="px-6 py-3.5 text-right">PRIMARY OBJECTIVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {simData.strategies.map((st: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                      {st.name.includes("AI") && <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                      {st.name}
                    </td>
                    <td className="px-6 py-3.5 font-extrabold text-slate-900">${st.suggested_price}</td>
                    <td className="px-6 py-3.5 text-slate-600">{st.expected_volume_change}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{st.margin_pct}%</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {st.objective}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}