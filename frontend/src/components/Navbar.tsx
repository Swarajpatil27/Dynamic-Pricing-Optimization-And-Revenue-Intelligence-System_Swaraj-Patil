'use client';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div>
        <span className="text-sm font-semibold text-slate-500">
          Revenue Intelligence Platform
        </span>
      </div>

      {/* Single User Profile Avatar */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold ring-2 ring-blue-50">
          SP
        </div>
        <span className="text-sm font-semibold text-slate-800">Swaraj Patil</span>
      </div>
    </header>
  );
}