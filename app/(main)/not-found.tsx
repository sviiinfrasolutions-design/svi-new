import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-brand-bg flex min-h-screen items-center justify-center py-20 pt-24 dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <span className="text-brand-gold/20 font-serif text-9xl font-bold">404</span>
          </div>
          <h1 className="text-brand-navy mb-6 font-serif text-3xl md:text-5xl dark:text-gray-100">
            Page Not Found
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            The page you are looking for does not exist or has been moved.
          </p>
          <p className="text-brand-gold mb-12 font-serif text-xl italic">
            "Where Dreams Take Address" — but not this one.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-brand-gold border-brand-gold flex items-center gap-2 border px-8 py-4 text-xs font-bold tracking-widest uppercase shadow-xl transition-colors"
            >
              <Home size={16} />
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="text-brand-navy hover:text-brand-gold border-brand-navy flex items-center gap-2 border px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors dark:border-gray-200 dark:text-gray-200"
            >
              <ArrowLeft size={16} />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
