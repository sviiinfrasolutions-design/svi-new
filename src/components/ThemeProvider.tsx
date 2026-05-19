'use client';

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme | ((prev: Theme) => Theme)) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const THEME_STORAGE_KEY = 'svi-theme-v1';

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = THEME_STORAGE_KEY,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const setTheme = useMemo(
    () => (newTheme: Theme | ((prev: Theme) => Theme)) => {
      const resolved = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
      localStorage.setItem(storageKey, resolved);
      setThemeState(resolved);
    },
    [theme, storageKey]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
