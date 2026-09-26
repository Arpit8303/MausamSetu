'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { CloudSun, UserPlus, Lock, Mail, User, Phone, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'farmer' | 'agricultural_officer'>('farmer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'farmer') router.push('/dashboard/farmer');
    else router.push('/dashboard/officer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          
          <div className="text-center mb-6">
            <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm inline-flex items-center justify-center mx-auto mb-3">
              <img src="/logo.png" alt="MausamSetu Logo" className="h-12 w-auto object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Create MausamSetu Account</h2>
            <p className="text-xs text-slate-500 mt-1">Get hyper-local downscaled weather & crop advisories</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select User Role</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="farmer">Farmer (किसान)</option>
                <option value="agricultural_officer">Agricultural Officer (कृषि अधिकारी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Ramesh Kumar"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="ramesh@gmail.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Panchayat Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option>Amausi Panchayat, Lucknow (अमौसी)</option>
                  <option>Chillawan Panchayat, Lucknow (चिल्लावां)</option>
                  <option>Piparsand Panchayat, Lucknow (पीपरसंड)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="text-emerald-600 font-bold hover:underline">
              Log In
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
