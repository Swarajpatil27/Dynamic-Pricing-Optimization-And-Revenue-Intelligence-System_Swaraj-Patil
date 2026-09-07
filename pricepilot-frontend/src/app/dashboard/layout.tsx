"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  LineChart,
  Users,
  Sliders,
  BarChart3,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products & Pricing", href: "/dashboard/products", icon: Package },
  { name: "Price Prediction", href: "/dashboard/pricing-prediction", icon: TrendingUp },
  { name: "Demand Forecast", href: "/dashboard/demand-forecast", icon: LineChart },
  { name: "Competitors", href: "/dashboard/competitors", icon: Users },
  { name: "Revenue Optimization", href: "/dashboard/revenue-optimization", icon: Sliders },
  { name: "Pricing Analytics", href: "/dashboard/profitability", icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1527] text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
            P
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block leading-tight">
              PricePilot AI
            </span>
            <span className="text-[9px] text-slate-400 font-medium tracking-wide block uppercase">
              INTELLIGENCE CONSOLE
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile with Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090f1d] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
              SP
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                Swaraj Patil
              </span>
              <span className="text-[9px] text-slate-400 block truncate">
                Admin
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#f8fafc] p-6 lg:p-8">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}