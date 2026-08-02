'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Products & Pricing', path: '/dashboard/products' },
    { name: 'Demand Forecast', path: '/dashboard/forecast' },
    { name: 'Competitors', path: '/dashboard/competitors' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-full flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2 pt-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
            P
          </div>
          <span className="text-lg font-bold tracking-wide">PricePilot AI</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 pb-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}