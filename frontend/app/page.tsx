'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroWeatherOverlay from '../components/HeroWeatherOverlay';
import { Sprout, ArrowRight, ShieldCheck, CheckCircle2, CloudRain, Thermometer, Droplets, LineChart, Sparkles, Navigation } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#111827] font-sans selection:bg-[#2D6A4F] selection:text-white">
      
      {/* Transparent Header Over Hero Image */}
      <Navbar transparent={true} />

      {/* 1. Hero Section with Full Image Visibility */}
      <section className="relative min-h-[720px] lg:min-h-[800px] flex items-center justify-center overflow-hidden pt-24 pb-16">
        
        {/* Custom Hero Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all"
          style={{
            backgroundImage: `url('/hero-bg.jpg')`
          }}
        />

        {/* Minimal Light Overlay for Maximum Image Visibility & Rich Color Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-black/35" />

        {/* Realistic Weather Animations Layer (Clouds, Rays, Mist, Rain Streaks) */}
        <HeroWeatherOverlay />

        {/* Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Text & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Top Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-emerald-200 text-xs font-bold border border-white/30 backdrop-blur-md shadow-lg">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>Smart Weather Downscaling for Sustainable Farming</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                Empowering Farmers. <br />
                <span className="text-emerald-400 font-sans">Growing Tomorrow.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                MausamSetu transforms coarse 25km Block forecasts into 1km Gram Panchayat predictions. Delivering localized weather insights and crop advisories directly to Indian farmers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/dashboard/farmer"
                  className="px-8 py-4 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-extrabold text-sm shadow-2xl shadow-emerald-500/50 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>
                
                <Link
                  href="/advisories"
                  className="px-8 py-4 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-sm border border-white/30 backdrop-blur-md shadow-xl flex items-center gap-2 transition-all"
                >
                  <span>Explore Solutions</span>
                  <Sprout className="w-4 h-4 text-emerald-300" />
                </Link>
              </div>

            </div>

            {/* Hero Right Floating Glass Weather & AI Overlays */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-slate-950/70 backdrop-blur-md p-5 rounded-3xl border border-white/20 text-white shadow-2xl relative overflow-hidden group">
                {/* Mini Radar Pulse Ring Accent */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border border-emerald-500/20 pointer-events-none flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-emerald-400/40 animate-radar-pulse" />
                  <div className="absolute inset-1 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(34,197,94,0.35)_360deg)] animate-radar-sweep origin-center" />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-300">Panchayat Precision</span>
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <span className="text-2xl font-black block">1 km Grid</span>
                <span className="text-[11px] text-slate-300 mt-1 block">XGBoost & DEM Topography Model</span>
              </div>

              <div className="bg-slate-950/70 backdrop-blur-md p-5 rounded-3xl border border-white/20 text-white shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-300">Model Accuracy</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-2xl font-black block text-emerald-400">94%</span>
                <span className="text-[11px] text-slate-300 mt-1 block">MAE 0.42°C (Held-out Test)</span>
              </div>

              <div className="bg-slate-950/70 backdrop-blur-md p-5 rounded-3xl border border-white/20 text-white shadow-2xl sm:col-span-2 relative overflow-hidden">
                {/* Weather Radar Pulse Beacon Accent */}
                <div className="absolute right-4 top-4 w-4 h-4 flex items-center justify-center pointer-events-none">
                  <span className="absolute w-full h-full rounded-full bg-emerald-400/80 animate-ping" />
                  <span className="absolute w-8 h-8 rounded-full border border-emerald-400/50 animate-radar-pulse" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 animate-ping" />
                      <Navigation className="relative z-10 w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-xs font-bold text-white">Amausi GP, Sarojini Nagar</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-300 pr-5">31.4°C</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
                  <span>Rainfall: <strong>0.0 mm (15%)</strong></span>
                  <span>Humidity: <strong>68%</strong></span>
                  <span>Wind: <strong>12.4 km/h</strong></span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* 2. "Smart Solutions for Modern Farming" 4 Cards Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F] flex items-center justify-center gap-1.5 mb-2">
              <Sprout className="w-4 h-4" /> WHAT WE OFFER
            </span>
            <h2 className="text-3xl font-sans font-bold text-[#111827]">
              Smart Solutions for Modern Farming
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Everything you need to manage your farm efficiently and profitably with downscaled weather AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-[#FAFAF7] p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF3DE] text-[#2D6A4F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#111827] mb-2">Panchayat Downscaling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Transform coarse 25km forecasts into 1km Panchayat precision using elevation and physics modeling.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAFAF7] p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF3DE] text-[#2D6A4F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CloudRain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#111827] mb-2">Irrigation Control</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Smart rain & irrigation scheduling to save water and ensure optimal crop growth window.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAFAF7] p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF3DE] text-[#2D6A4F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#111827] mb-2">Fertilizer & Soil Care</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Know your soil condition and apply nutrients at the right weather-protected window.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FAFAF7] p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF3DE] text-[#2D6A4F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#111827] mb-2">Weather & Market Insights</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get real-time downscaled forecasts, rainfall anomaly indicators, and actionable market alerts.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Full-Width Dark Forest Green 4-Metric Banner */}
      <section className="py-12 bg-[#162E21] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            
            <div className="p-4">
              <span className="block text-3xl sm:text-4xl font-extrabold text-white">2.5 Lakh+</span>
              <span className="text-xs text-emerald-200 font-medium mt-1 block">Gram Panchayats Covered</span>
            </div>

            <div className="p-4">
              <span className="block text-3xl sm:text-4xl font-extrabold text-white">1.2M+</span>
              <span className="text-xs text-emerald-200 font-medium mt-1 block">Acres Monitored</span>
            </div>

            <div className="p-4">
              <span className="block text-3xl sm:text-4xl font-extrabold text-white">94%</span>
              <span className="text-xs text-emerald-200 font-medium mt-1 block">Downscaling Precision</span>
            </div>

            <div className="p-4">
              <span className="block text-3xl sm:text-4xl font-extrabold text-white">40%</span>
              <span className="text-xs text-emerald-200 font-medium mt-1 block">Water Saved via AI</span>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
