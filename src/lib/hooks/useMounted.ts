'use client';

import { useEffect, useState } from 'react';

/**
 * Returns `true` once the component has mounted on the client (after hydration).
 * Useful for deferring rendering of components that rely on browser-only APIs
 * (e.g. recharts ResponsiveContainer, window measurements) during SSR.
 *
 * @example
 * ```tsx
 * const mounted = useMounted();
 * if (!mounted) return <div className="h-[300px]" />;
 * return <ClientOnlyComponent />;
 * ```
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
