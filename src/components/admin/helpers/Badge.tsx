'use client';

import { Shield, Users } from 'lucide-react';

export function Badge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase ${
        role === 'admin'
          ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20 border'
          : 'border border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
      }`}
    >
      {role === 'admin' ? (
        <Shield className="text-brand-gold h-3 w-3" />
      ) : (
        <Users className="h-3 w-3 text-gray-400 dark:text-gray-500" />
      )}
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  );
}
