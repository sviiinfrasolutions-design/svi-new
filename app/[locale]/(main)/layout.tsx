import ClientProviders from '@/src/components/ClientProviders';
import Breadcrumbs from '@/src/components/ui/Breadcrumbs';
import { FloatingContact } from '@/src/components/layout/FloatingContact';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <Breadcrumbs />
      {children}
      <FloatingContact />
    </ClientProviders>
  );
}
