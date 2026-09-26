'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, Languages, LogIn } from 'lucide-react';
import { translations, Language } from '../lib/i18n';

interface NavbarProps {
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
  transparent?: boolean;
}

export default function Navbar({ lang = 'en', onLanguageChange, transparent = false }: NavbarProps) {
  const pathname = usePathname();
  const [currentLang, setCurrentLang] = useState<Language>(lang);
  const t = translations[currentLang];

  const handleLangToggle = () => {
    const nextLang = currentLang === 'en' ? 'hi' : 'en';
    setCurrentLang(nextLang);
    if (onLanguageChange) onLanguageChange(nextLang);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Weather AI', href: '/dashboard/farmer' },
    { name: 'Advisories', href: '/advisories' },
    { name: 'Officer Portal', href: '/dashboard/officer' },
    { name: 'Admin Ops', href: '/admin' },
  ];

  const isHomepage = pathname === '/';
  const isTransparent = transparent || isHomepage;

  return (
    <header className={`w-full z-50 transition-all ${
      isTransparent
        ? 'absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent border-none text-white'
        : 'sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`p-1.5 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform ${
              isTransparent ? 'bg-white/90 shadow-md backdrop-blur-md' : 'bg-white shadow-sm border border-slate-200/60'
            }`}>
              <img src="/logo.png" alt="MausamSetu Logo" className="h-9 sm:h-11 w-auto object-contain" />
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full hidden sm:inline-block ${
              isTransparent ? 'bg-white/20 text-emerald-300 backdrop-blur-md border border-white/20' : 'bg-[#EAF3DE] text-[#2D6A4F]'
            }`}>
              1km PRECISION
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 transition-colors ${
                    isTransparent
                      ? (isActive ? 'text-emerald-300 font-extrabold drop-shadow' : 'text-white/90 hover:text-white drop-shadow')
                      : (isActive ? 'text-[#162E21] font-bold' : 'text-slate-600 hover:text-[#162E21]')
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${isTransparent ? 'bg-emerald-400' : 'bg-[#2D6A4F]'}`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLangToggle}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                isTransparent
                  ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Languages className={`w-4 h-4 ${isTransparent ? 'text-emerald-300' : 'text-[#2D6A4F]'}`} />
              <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            <Link
              href="/dashboard/farmer"
              className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 shadow-xl transition-all hover:scale-105"
            >
              <span>Get Started</span>
              <Sprout className="w-4 h-4 text-slate-950" />
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
