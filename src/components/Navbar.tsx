'use client';

import { Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-800">Revenue Intelligence Platform</h2>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
            PM
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-700">Pricing Manager</p>
            <p className="text-xs text-slate-500">manager@pricepilot.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
}