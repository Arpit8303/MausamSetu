import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">404 - Page Not Found</h2>
        <p className="text-xs text-slate-500">The page or location you requested could not be found.</p>
        <Link
          href="/dashboard/farmer"
          className="inline-block px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
