'use client';

import { STATUS_MAP } from './types';

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${config.color}`}
    >
      {config.label}
    </span>
  );
}
