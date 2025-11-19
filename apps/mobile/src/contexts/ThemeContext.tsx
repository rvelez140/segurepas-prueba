import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2196F3',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#DDDDDD',
    notification: '#FF6B6B',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#64B5F6',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    notification: '#FF6B6B',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    info: '#42A5F5',
  },
};

interface ThemeContextData {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  themeMode: 'light' | 'dark' | 'auto';
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const THEME_MODE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'auto'>('auto');
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto')) {
        setThemeModeState(savedMode as 'light' | 'dark' | 'auto');
      }
    } catch (error) {
      console.error('Error al cargar preferencia de tema:', error);
    }
  };

  const updateTheme = () => {
    let isDarkMode = false;

    if (themeMode === 'auto') {
      isDarkMode = systemColorScheme === 'dark';
    } else {
      isDarkMode = themeMode === 'dark';
    }

    setTheme(isDarkMode ? darkTheme : lightTheme);
  };

  const setThemeMode = async (mode: 'light' | 'dark' | 'auto') => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error al guardar preferencia de tema:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = theme.dark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme.dark,
        toggleTheme,
        setThemeMode,
        themeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};
