import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemePreference = 'manual' | 'auto' | 'system';

interface ThemeContextProps {
  theme: Theme;
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  themePreference: 'manual',
  toggleTheme: () => {},
  setThemePreference: () => {},
});

// Función para validar temas
const isTheme = (value: string | null): value is Theme => {
  return value === 'light' || value === 'dark';
};

// Función para validar preferencias
const isThemePreference = (value: string | null): value is ThemePreference => {
  return value === 'manual' || value === 'auto' || value === 'system';
};

// Obtener tema del sistema operativo
const getSystemTheme = async (): Promise<Theme> => {
  if (typeof window === 'undefined') return 'light';

  // Si estamos en Electron, usar la API de Electron
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).electronAPI?.getSystemTheme) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const electronTheme = await (window as any).electronAPI.getSystemTheme();
      return electronTheme;
    } catch (error) {
      console.error('Error getting Electron theme:', error);
    }
  }

  // Fallback a la detección web estándar
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

// Obtener tema según la hora del día (6 AM - 6 PM = light, resto = dark)
const getAutoThemeByTime = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
};

// Obtener preferencia inicial
const getInitialPreference = (): ThemePreference => {
  if (typeof localStorage === 'undefined') return 'manual';
  const saved = localStorage.getItem('themePreference');
  return isThemePreference(saved) ? saved : 'manual';
};

// Obtener tema inicial basado en la preferencia (síncrono, para el navegador)
const getInitialThemeSync = (preference: ThemePreference): Theme => {
  if (typeof localStorage === 'undefined') return 'light';

  switch (preference) {
    case 'system':
      // Para system, usar la detección web estándar de forma síncrona
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      }
      return 'light';
    case 'auto':
      return getAutoThemeByTime();
    case 'manual':
      const savedTheme = localStorage.getItem('theme');
      return isTheme(savedTheme) ? savedTheme : 'light';
    default:
      return 'light';
  }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>(getInitialPreference);
  const [theme, setTheme] = useState<Theme>(() => getInitialThemeSync(themePreference));

  // Aplicar tema al DOM
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
    }
    if (themePreference === 'manual') {
      localStorage.setItem('theme', theme);
    }
  }, [theme, themePreference]);

  // Manejar cambios en la preferencia del sistema
  useEffect(() => {
    if (themePreference !== 'system') return;

    // Listener para Electron
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).electronAPI?.onThemeChanged) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsubscribe = (window as any).electronAPI.onThemeChanged(
        (themeInfo: { shouldUseDarkColors: boolean }) => {
          setTheme(themeInfo.shouldUseDarkColors ? 'dark' : 'light');
        }
      );
      return unsubscribe;
    }

    // Fallback a la detección web estándar
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  // Manejar cambios automáticos por hora
  useEffect(() => {
    if (themePreference !== 'auto') return;

    const updateThemeByTime = () => {
      setTheme(getAutoThemeByTime());
    };

    // Actualizar inmediatamente
    updateThemeByTime();

    // Revisar cada minuto
    const interval = setInterval(updateThemeByTime, 60000);
    return () => clearInterval(interval);
  }, [themePreference]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    // Al hacer toggle manual, cambiar a modo manual
    if (themePreference !== 'manual') {
      setThemePreferenceState('manual');
      localStorage.setItem('themePreference', 'manual');
    }
  };

  const setThemePreference = async (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    localStorage.setItem('themePreference', preference);

    // Aplicar el tema correspondiente según la nueva preferencia
    switch (preference) {
      case 'system':
        const systemTheme = await getSystemTheme();
        setTheme(systemTheme);
        break;
      case 'auto':
        setTheme(getAutoThemeByTime());
        break;
      case 'manual':
        // Mantener el tema actual
        break;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themePreference, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
