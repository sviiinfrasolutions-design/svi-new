import ClientProviders from '@/src/components/ClientProviders';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
