'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Products & Pricing', href: '/dashboard/products' },
    { name: 'Price Prediction', href: '/dashboard/pricing-prediction' },
    { name: 'Demand Forecast', href: '/dashboard/demand-forecast' },
    { name: 'Competitors', href: '/dashboard/competitors' },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-4 border-r border-slate-800">
      {/* Brand Logo Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            P
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            PricePilot AI
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}