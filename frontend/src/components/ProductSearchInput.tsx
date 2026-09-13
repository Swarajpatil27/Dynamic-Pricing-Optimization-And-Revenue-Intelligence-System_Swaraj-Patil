"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Package, X, Loader2, AlertCircle } from "lucide-react";

export interface ProductItem {
  id: number | string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  current_price?: number;
  competitor_price?: number;
  stock_level?: number;
  image_url?: string;
}

interface ProductSearchInputProps {
  value: string;
  onSelectProduct: (product: ProductItem) => void;
  placeholder?: string;
  className?: string;
}

export default function ProductSearchInput({
  value,
  onSelectProduct,
  placeholder = "Search real catalog products...",
  className = "",
}: ProductSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [results, setResults] = useState<ProductItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // Query backend search API on user input
  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      // Fetch initial live products when input is empty
      fetchInitialCatalog();
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/products/search?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Live search request failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchInitialCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/products?limit=10");
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (product: ProductItem) => {
    setSearchTerm(product.name);
    setIsOpen(false);
    onSelectProduct(product);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          onFocus={() => {
            setIsOpen(true);
            if (results.length === 0) fetchInitialCatalog();
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-9 pr-8 py-2 text-sm border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-900"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 absolute right-3 top-3 text-slate-400 animate-spin" />
        ) : searchTerm ? (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              fetchInitialCatalog();
            }}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl max-h-72 overflow-y-auto z-50 divide-y divide-slate-100">
          {loading && results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Querying live catalog...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" /> No matching live catalog items found
            </div>
          ) : (
            results.map((prod) => {
              const price = Number(prod.selling_price || prod.current_price || 0);
              const cost = Number(prod.cost_price || 0);

              return (
                <div
                  key={prod.id}
                  onClick={() => handleSelect(prod)}
                  className="p-3 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition">
                        {prod.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-medium">
                          {prod.category}
                        </span>
                        <span>Stock: {prod.stock_level ?? 0} units</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">${price.toFixed(2)}</div>
                    <div className="text-[11px] text-slate-500">Cost: ${cost.toFixed(2)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}