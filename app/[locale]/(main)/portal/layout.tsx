'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PortalSidebar } from '@/src/components/portal/PortalSidebar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { userId, loading, isAdmin, initialize } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading) {
      if (!userId) {
        router.replace('/login');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [loading, userId, isAdmin, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0256B4] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-grow bg-gray-50 dark:bg-gray-900/30">
      <div className="hidden md:block">
        <PortalSidebar />
      </div>
      <div className="min-h-[calc(100vh-80px)] flex-1 p-6 md:ml-64 lg:p-8">{children}</div>
    </div>
  );
}
