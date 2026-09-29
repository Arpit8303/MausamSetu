'use client';

import React from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#EAF4EC] flex flex-col md:flex-row font-sans selection:bg-[#34B27B] selection:text-white relative">
      {/* 1. Global Fixed Left Sidebar */}
      <Sidebar />

      {/* 2. Main Central Workspace */}
      <main className="flex-1 min-w-0 bg-white p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
