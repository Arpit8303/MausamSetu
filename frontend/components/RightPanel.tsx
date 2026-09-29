'use client';

import React from 'react';
import Link from 'next/link';
import { User, Edit3, Sun, Sunset, MapPin, CloudSun, Sparkles, X, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface RightPanelProps {
  user?: UserType;
  panchayatName?: string;
  districtName?: string;
  tempMax?: number;
  weatherCond?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function RightPanel({
  user = { id: 1, email: 'farmer@mausamsetu.in', full_name: 'Ramesh Kumar', role: 'farmer' },
  panchayatName = 'Amausi Panchayat',
  districtName = 'Lucknow, Uttar Pradesh',
  tempMax = 31.4,
  weatherCond = 'Partly Cloudy',
  isOpen,
  onClose
}: RightPanelProps) {
  // If drawer mode is controlled and currently closed, do not render
  if (isOpen === false) return null;

  const isDrawerMode = isOpen !== undefined;

  const handleLogout = () => {
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
        } catch (err) {}
      }
      window.location.href = '/login';
    }
  };

  const content = (
    <aside className={`bg-gradient-to-b from-[#075E63] via-[#064E3B] to-[#043327] text-white flex-shrink-0 flex flex-col justify-between relative overflow-hidden z-20 ${
      isDrawerMode
        ? 'w-full h-full min-h-full overflow-y-auto shadow-2xl'
        : 'w-full xl:w-[320px] 2xl:w-[350px] min-h-full h-auto self-stretch shadow-xl'
    }`}>
      
      {/* Background Starlight / Cloud Dots */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Close button for drawer mode */}
      {isDrawerMode && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-30"
          title="Close Profile Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="p-6 space-y-6 relative z-10">
        
        {/* Top Profile Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-4">
          
          {/* Avatar Ring */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-400 p-1 shadow-xl shadow-emerald-950/40">
              <div className="w-full h-full rounded-full bg-[#075E63] flex items-center justify-center text-white border-2 border-white">
                <User className="w-10 h-10 text-emerald-200" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#34B27B] border-2 border-white rounded-full" />
          </div>

          <div>
            <h3 className="font-extrabold text-lg tracking-tight text-white">{user.full_name}</h3>
            <p className="text-xs text-emerald-200 font-medium">Progressive Farmer • Lucknow</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="px-4 py-1.5 rounded-full bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>Edit Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-red-300" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sunrise / Sunset Pill Card (Matching Reference's Work Start/End) */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-300" />
            <div>
              <span className="text-[10px] uppercase text-emerald-200 font-semibold block">Sunrise</span>
              <span className="font-bold text-white font-mono">06:12 am</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <Sunset className="w-4 h-4 text-orange-300" />
            <div>
              <span className="text-[10px] uppercase text-emerald-200 font-semibold block">Sunset</span>
              <span className="font-bold text-white font-mono">06:45 pm</span>
            </div>
          </div>
        </div>

        {/* Big Location Title (Matching Reference's Sukabumi City) */}
        <div className="pt-2 text-center space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
            {panchayatName}
          </h2>
          <p className="text-xs text-emerald-200 font-medium flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#34B27B]" /> {districtName} • GMT+5:30
          </p>
        </div>

        {/* Forecast Quick Pill Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CloudSun className="w-8 h-8 text-amber-300" />
            <div>
              <span className="text-xs font-bold text-white block">{weatherCond}</span>
              <span className="text-[10px] text-emerald-200">1km Downscaled Grid</span>
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono">{tempMax}°C</span>
        </div>

      </div>

      {/* Illustrated Indian Agricultural Landscape Vector Graphic (Extending to Bottom Edge) */}
      <div className="relative w-full h-56 mt-auto overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none" fill="none">
          
          {/* Sun & Sky Glow */}
          <circle cx="200" cy="180" r="120" fill="#34B27B" fillOpacity="0.15" />
          <circle cx="320" cy="40" r="25" fill="#F59E0B" fillOpacity="0.2" />

          {/* Distant Hills / Horizon */}
          <path d="M0 160 Q 100 120, 200 150 T 400 130 V 220 H 0 Z" fill="#064E3B" opacity="0.6" />
          <path d="M0 175 Q 150 140, 300 170 T 400 160 V 220 H 0 Z" fill="#075E63" opacity="0.8" />

          {/* Green Agricultural Fields */}
          <path d="M0 190 Q 200 170, 400 185 V 220 H 0 Z" fill="#34B27B" opacity="0.9" />
          <path d="M0 205 Q 180 190, 400 200 V 220 H 0 Z" fill="#10B981" />

          {/* Crop Furrows & River Curve */}
          <path d="M220 220 C 210 190, 260 170, 300 160" stroke="#0284C7" strokeWidth="6" opacity="0.7" fill="none" />
          <path d="M0 200 Q 100 195, 200 210" stroke="#D8F18B" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" fill="none" />
          <path d="M0 210 Q 120 205, 240 218" stroke="#D8F18B" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" fill="none" />

          {/* Farmhouses & Trees */}
          {/* Tree 1 */}
          <circle cx="50" cy="160" r="14" fill="#064E3B" />
          <rect x="48" y="170" width="4" height="12" fill="#043327" />

          {/* Tree 2 */}
          <circle cx="80" cy="155" r="18" fill="#10B981" />
          <rect x="78" y="168" width="4" height="15" fill="#043327" />

          {/* Village House */}
          <polygon points="130,165 145,150 160,165" fill="#F59E0B" />
          <rect x="133" y="165" width="24" height="15" fill="#FFF" />
          <rect x="142" y="172" width="6" height="8" fill="#064E3B" />

          {/* Wind Turbine Accent */}
          <line x1="340" y1="120" x2="340" y2="160" stroke="#FFF" strokeWidth="2" opacity="0.7" />
          <circle cx="340" cy="120" r="3" fill="#FFF" />
          <line x1="330" y1="115" x2="350" y2="125" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />
          <line x1="340" y1="108" x2="340" y2="132" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />

        </svg>
      </div>

    </aside>
  );

  if (isDrawerMode) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        />

        {/* Slide-over Drawer */}
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] max-w-full z-50 shadow-2xl animate-in slide-in-from-right duration-300">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
