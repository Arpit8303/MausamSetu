'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CloudSun, LayoutDashboard, Map, CalendarDays, Sprout, Bell, History, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mausamsetu_user');
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      if ((window as any).supabase?.auth?.signOut) {
        try {
          (window as any).supabase.auth.signOut();
        } catch (err) {
          console.warn('Supabase signOut warning:', err);
        }
      }
    }
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/farmer', icon: LayoutDashboard },
    { name: 'Map Intelligence', href: '/dashboard/officer', icon: Map },
    { name: 'Advisories', href: '/advisories', icon: Sprout },
    { name: 'Panchayat Detail', href: '/panchayat/1', icon: CalendarDays },
    { name: 'Admin Operations', href: '/admin', icon: Bell },
    { name: 'Settings', href: '/dashboard/farmer', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex flex-col items-center justify-between w-20 h-screen sticky top-0 py-6 bg-white border-r border-slate-100 flex-shrink-0 z-30">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-1">
          <Link
            href="/"
            className="w-12 h-12 flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
            title="MausamSetu Home"
          >
            <img src="/logo.png" alt="MausamSetu Logo" className="w-full h-full object-contain" />
          </Link>
        </div>

        {/* Centered Navigation Icons */}
        <nav className="flex flex-col items-center gap-5 my-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative p-3 rounded-2xl transition-all group ${
                  isActive
                    ? 'bg-[#EAF4EC] text-[#064E3B] shadow-inner font-bold'
                    : 'text-[#82918E] hover:text-[#064E3B] hover:bg-slate-50'
                }`}
                title={item.name}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#34B27B] rounded-r-full" />
                )}
                
                {/* Tooltip */}
                <span className="absolute left-20 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Logout / Settings */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleLogout}
            className="p-3 text-[#82918E] hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around z-50 shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-semibold ${
                isActive ? 'text-[#064E3B] font-bold' : 'text-[#82918E]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
