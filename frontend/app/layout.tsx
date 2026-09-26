import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MausamSetu | Har Panchayat Ka Mausam, Har Kisan Ke Naam',
  description: 'AI-Powered Weather Downscaling and Agro-Meteorological Advisory Platform for Indian Panchayats',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
