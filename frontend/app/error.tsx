'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Something went wrong!</h2>
        <p className="text-xs text-slate-500">{error.message || "An error occurred while loading this view."}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
