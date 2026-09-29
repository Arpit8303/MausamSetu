'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { CloudSun, LogIn, Lock, Mail, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('farmer@mausamsetu.in');
  const [password, setPassword] = useState('Farmer@123');
  const [role, setRole] = useState<'farmer' | 'officer' | 'admin'>('farmer');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear stale user session when explicitly visiting login page
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

      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirect');
      if (redirectPath === '/dashboard/officer') {
        setRole('officer');
        setEmail('officer@mausamsetu.in');
        setPassword('Officer@123');
      } else if (redirectPath === '/admin') {
        setRole('admin');
        setEmail('admin@mausamsetu.in');
        setPassword('Admin@123');
      }
    }
  }, []);

  const handleQuickFill = (selectedRole: 'farmer' | 'officer' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'farmer') {
      setEmail('farmer@mausamsetu.in');
      setPassword('Farmer@123');
    } else if (selectedRole === 'officer') {
      setEmail('officer@mausamsetu.in');
      setPassword('Officer@123');
    } else {
      setEmail('admin@mausamsetu.in');
      setPassword('Admin@123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Persist authenticated user session
    const userSession = {
      email,
      role,
      token: 'demo-jwt-token',
      logged_at: new Date().toISOString()
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('mausamsetu_user', JSON.stringify(userSession));
    }

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const redirectUrl = params?.get('redirect');

    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (role === 'farmer') {
      router.push('/dashboard/farmer');
    } else if (role === 'officer') {
      router.push('/dashboard/officer');
    } else {
      router.push('/admin');
    }
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
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back to MausamSetu</h2>
            <p className="text-xs text-slate-500 mt-1">Select your portal role and log in to continue</p>
          </div>

          {/* Role Quick Selector */}
          <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => handleQuickFill('farmer')}
              className={`py-2 rounded-lg transition-all ${role === 'farmer' ? 'bg-emerald-500 text-white shadow' : 'hover:text-slate-900'}`}
            >
              Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('officer')}
              className={`py-2 rounded-lg transition-all ${role === 'officer' ? 'bg-emerald-500 text-white shadow' : 'hover:text-slate-900'}`}
            >
              Officer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className={`py-2 rounded-lg transition-all ${role === 'admin' ? 'bg-emerald-500 text-white shadow' : 'hover:text-slate-900'}`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to {role.toUpperCase()} Portal</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-emerald-600 font-bold hover:underline">
              Register Here
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
