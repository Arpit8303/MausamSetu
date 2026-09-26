'use client';

import React from 'react';

export default function HeroWeatherOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      
      {/* 1. SUNLIGHT RAYS & GOLDEN GLOW (Top Left Sky) */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] rounded-full opacity-20 animate-sun-rays"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 75%)',
          filter: 'blur(30px)',
        }}
      />

      {/* 2. DISTANT RAIN STREAKS (Top Right Dark Cloud Region Only) */}
      <div className="absolute top-[3%] right-[8%] w-[280px] h-[180px] opacity-25 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 280 180" fill="none">
          <g className="animate-rain-fall" style={{ animationDelay: '0s' }}>
            <line x1="20" y1="0" x2="10" y2="40" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="80" y1="10" x2="70" y2="50" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.2" strokeDasharray="3 6" />
            <line x1="140" y1="5" x2="130" y2="45" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="5 7" />
            <line x1="210" y1="20" x2="200" y2="60" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="4 9" />
          </g>
          <g className="animate-rain-fall" style={{ animationDelay: '0.8s' }}>
            <line x1="50" y1="0" x2="40" y2="40" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" strokeDasharray="3 7" />
            <line x1="110" y1="15" x2="100" y2="55" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.1" strokeDasharray="4 8" />
            <line x1="180" y1="0" x2="170" y2="40" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="5 6" />
            <line x1="250" y1="10" x2="240" y2="50" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" strokeDasharray="3 8" />
          </g>
        </svg>
      </div>

      {/* 3. SLOW-MOVING TRANSPARENT CLOUD LAYERS (Top Sky Region - Drifting Right to Left) */}
      
      {/* Cloud Layer 1: Highest & Slowest (Duration ~85s, Opacity 0.18) */}
      <div className="absolute top-0 left-0 w-[200%] h-[45%] animate-cloud-slow opacity-20">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 2400 300" fill="none">
          {/* Cloud Path 1A */}
          <path 
            d="M100 120 Q 250 40 400 120 T 700 120 T 1000 100 T 1300 130 T 1600 110 T 1900 140 T 2200 110 Z" 
            fill="url(#cloudGrad1)" 
            filter="blur(16px)"
          />
          {/* Cloud Path 1B (Seamless Duplicate for Loop) */}
          <path 
            d="M1300 120 Q 1450 40 1600 120 T 1900 120 T 2200 100 T 2500 130 T 2800 110 Z" 
            fill="url(#cloudGrad1)" 
            filter="blur(16px)"
          />
          <defs>
            <linearGradient id="cloudGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#E2E8F0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Cloud Layer 2: Mid Elevation & Moderate Drift (Duration ~65s, Opacity 0.24) */}
      <div className="absolute top-[4%] left-0 w-[200%] h-[40%] animate-cloud-mid opacity-25">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 2400 280" fill="none">
          <path 
            d="M200 140 Q 380 60 560 140 T 920 130 T 1280 150 T 1640 120 T 2000 150 Z" 
            fill="url(#cloudGrad2)" 
            filter="blur(12px)"
          />
          <path 
            d="M1400 140 Q 1580 60 1760 140 T 2120 130 T 2480 150 Z" 
            fill="url(#cloudGrad2)" 
            filter="blur(12px)"
          />
          <defs>
            <linearGradient id="cloudGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="80%" stopColor="#F1F5F9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Cloud Layer 3: Lower Wispy Clouds (Duration ~48s, Opacity 0.20) */}
      <div className="absolute top-[12%] left-0 w-[200%] h-[35%] animate-cloud-fast opacity-20">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 2400 240" fill="none">
          <path 
            d="M50 110 Q 200 70 350 110 T 650 100 T 950 120 T 1250 110 T 1550 130 T 1850 100 Z" 
            fill="url(#cloudGrad3)" 
            filter="blur(10px)"
          />
          <path 
            d="M1250 110 Q 1400 70 1550 110 T 1850 100 T 2150 120 Z" 
            fill="url(#cloudGrad3)" 
            filter="blur(10px)"
          />
          <defs>
            <linearGradient id="cloudGrad3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. SUBTLE MOVING MIST/FOG LAYER OVER HILLS (Horizon Band ~35%-55%) */}
      <div className="absolute top-[35%] left-0 w-[110%] h-[25%] animate-mist">
        <div 
          className="w-full h-full"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.18) 40%, rgba(255, 255, 255, 0.28) 60%, transparent 100%)',
            filter: 'blur(20px)',
          }}
        />
      </div>

    </div>
  );
}
