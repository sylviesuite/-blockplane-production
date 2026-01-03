import { Link } from "wouter";

export default function MaterialDetailPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-semibold text-slate-900 mb-4">Material Detail</h1>
        <p className="text-sm text-slate-600 mb-6">
          This placeholder keeps the routing tree intact while the real detail page is being hooked up.
        </p>
        <Link
          href="/materials"
          className="text-sm font-semibold text-emerald-600 hover:underline"
        >
          Back to materials list
        </Link>
      </div>
    </div>
  );
}

