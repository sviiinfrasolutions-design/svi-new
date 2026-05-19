'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';

interface AdminSessionContext {
  token: string | null;
  userId: string | null;
  loading: boolean;
}

const AdminSessionContext = createContext<AdminSessionContext>({
  token: null,
  userId: null,
  loading: true,
});

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token || null);
      setUserId(session?.user?.id || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token || null);
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AdminSessionContext.Provider value={{ token, userId, loading }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}
