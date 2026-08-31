import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/* ============================================================================
   TEMA CLARO / OSCURO
   ----------------------------------------------------------------------------
   La preferencia se guarda por dispositivo. "Automático" sigue la
   configuración del sistema operativo.
   ========================================================================== */

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'appcaa:v1:theme';

interface ThemeContextValue {
  preference: ThemePreference;
  /** Tema realmente aplicado tras resolver "system". */
  resolved: 'light' | 'dark';
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? 'system',
  );
  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    preference === 'system' ? systemTheme() : preference,
  );

  useEffect(() => {
    const apply = () => {
      const next = preference === 'system' ? systemTheme() : preference;
      setResolved(next);
      document.documentElement.dataset.theme = next;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', next === 'dark' ? '#080d0a' : '#ffffff');
    };

    apply();

    // Si la preferencia es "automático", seguir los cambios del sistema en vivo.
    if (preference !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, next);
    setPreferenceState(next);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  return context;
}
