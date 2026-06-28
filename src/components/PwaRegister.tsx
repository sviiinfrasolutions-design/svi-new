'use client';

import { useEffect, useState } from 'react';

type SwState = 'idle' | 'installing' | 'update-ready';

export default function PwaRegister() {
  const [state, setState] = useState<SwState>('idle');
  const [swWaiting, setSwWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');

        // Check if update already waiting
        if (reg.waiting) {
          setSwWaiting(reg.waiting);
          setState('update-ready');
        }

        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          setState('installing');

          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setSwWaiting(installing);
              setState('update-ready');
            }
          });
        });
      } catch {
        // SW not supported or registration failed — silently degrade
      }
    };

    register();
  }, []);

  const handleUpdate = () => {
    if (!swWaiting) return;
    swWaiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  if (state !== 'update-ready') return null;

  return (
    <div className="animate-in slide-in-from-bottom-2 fixed right-4 bottom-4 z-50" role="alert">
      <div className="flex max-w-sm items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-white shadow-xl">
        <svg
          className="h-5 w-5 shrink-0 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <p className="text-sm font-medium">New version available</p>
        <button
          onClick={handleUpdate}
          className="ml-auto shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Update
        </button>
        <button
          onClick={() => setState('idle')}
          className="shrink-0 text-gray-400 hover:text-white"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
