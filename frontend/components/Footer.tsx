import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { translations, Language } from '../lib/i18n';

export default function Footer({ lang = 'en' }: { lang?: Language }) {
  const t = translations[lang];

  return (
    <footer className="bg-[#F9F9F6] border-t border-slate-200/80 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Bottom Callout Banner matching reference image */}
        <div className="bg-[#F3F4EE] border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3DE] text-[#2D6A4F] flex items-center justify-center flex-shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#111827]">
                Together, let's build a greener and more prosperous tomorrow.
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                AI weather downscaling precision for every Gram Panchayat in India.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <Sprout className="w-4 h-4 text-[#2D6A4F]" /> Sustainable Downscaling
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" /> 94% Accuracy
            </span>
            <Link
              href="/dashboard/farmer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#162E21] hover:bg-[#1E392A] text-white font-bold transition-all shadow hover:scale-105"
            >
              <span>Join MausamSetu</span>
              <Sprout className="w-4 h-4 text-[#22C55E]" />
            </Link>
          </div>
        </div>

        {/* 4 Column Standard Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-block">
              <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60 inline-flex items-center justify-center">
                <img src="/logo.png" alt="MausamSetu Logo" className="h-10 w-auto object-contain" />
              </div>
            </Link>
            <p className="text-xs font-medium text-[#2D6A4F]">“{t.tagline}”</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              High-resolution weather intelligence platform: Converting coarse Block forecasts into 1km Gram Panchayat predictions.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-3">Platform</h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/dashboard/farmer" className="hover:text-[#2D6A4F]">Farmer Portal</Link></li>
              <li><Link href="/dashboard/officer" className="hover:text-[#2D6A4F]">Officer Intelligence Center</Link></li>
              <li><Link href="/advisories" className="hover:text-[#2D6A4F]">Crop Advisory Engine</Link></li>
              <li><Link href="/admin" className="hover:text-[#2D6A4F]">Admin Operations</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-3">Attribution</h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>India Meteorological Department (IMD)</li>
              <li>NASA POWER Agroclimatology API</li>
              <li>SRTM DEM Topography Elevation</li>
              <li>Data.gov.in Open Data</li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 MausamSetu Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Indian Farmers.
          </p>
        </div>

      </div>
    </footer>
  );
}
