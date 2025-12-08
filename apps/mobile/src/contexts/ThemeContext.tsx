import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";
type ThemePreference = "manual" | "auto" | "system";

interface ThemeContextProps {
  theme: Theme;
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => void;
  colors: ColorScheme;
}

interface ColorScheme {
  background: string;
  surface: string;
  primary: string;
  primaryHover: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  card: string;
  shadow: string;
}

const lightColors: ColorScheme = {
  background: "#f9fafb",
  surface: "#ffffff",
  primary: "#0787f6",
  primaryHover: "#005fa3",
  text: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
  card: "#ffffff",
  shadow: "rgba(0, 0, 0, 0.1)",
};

const darkColors: ColorScheme = {
  background: "#2b2b2b",
  surface: "#1e1e1e",
  primary: "#0ea5e9",
  primaryHover: "#0284c7",
  text: "#f9fafb",
  textSecondary: "#94a3b8",
  border: "#3d3d3d",
  error: "#f87171",
  success: "#4ade80",
  warning: "#fbbf24",
  card: "#3d3d3d",
  shadow: "rgba(0, 0, 0, 0.5)",
};

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  themePreference: "system",
  toggleTheme: () => {},
  setThemePreference: () => {},
  colors: lightColors,
});

// Función para validar temas
const isTheme = (value: string | null): value is Theme => {
  return value === "light" || value === "dark";
};

// Función para validar preferencias
const isThemePreference = (value: string | null): value is ThemePreference => {
  return value === "manual" || value === "auto" || value === "system";
};

// Obtener tema del sistema operativo
const getSystemTheme = (): Theme => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === "dark" ? "dark" : "light";
};

// Obtener tema según la hora del día (6 AM - 6 PM = light, resto = dark)
const getAutoThemeByTime = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const [theme, setTheme] = useState<Theme>(getSystemTheme());
  const [isReady, setIsReady] = useState(false);

  // Cargar preferencias guardadas
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem("themePreference");
        const preference = isThemePreference(savedPreference) ? savedPreference : "system";
        setThemePreferenceState(preference);

        let initialTheme: Theme;
        switch (preference) {
          case "system":
            initialTheme = getSystemTheme();
            break;
          case "auto":
            initialTheme = getAutoThemeByTime();
            break;
          case "manual":
            const savedTheme = await AsyncStorage.getItem("theme");
            initialTheme = isTheme(savedTheme) ? savedTheme : "light";
            break;
          default:
            initialTheme = getSystemTheme();
        }

        setTheme(initialTheme);
        setIsReady(true);
      } catch (error) {
        console.error("Error loading theme preferences:", error);
        setIsReady(true);
      }
    };

    loadPreferences();
  }, []);

  // Guardar tema manual
  useEffect(() => {
    if (!isReady) return;

    if (themePreference === "manual") {
      AsyncStorage.setItem("theme", theme).catch(console.error);
    }
  }, [theme, themePreference, isReady]);

  // Manejar cambios en la preferencia del sistema
  useEffect(() => {
    if (themePreference !== "system") return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === "dark" ? "dark" : "light");
    });

    return () => subscription.remove();
  }, [themePreference]);

  // Manejar cambios automáticos por hora
  useEffect(() => {
    if (themePreference !== "auto") return;

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
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    // Al hacer toggle manual, cambiar a modo manual
    if (themePreference !== "manual") {
      setThemePreferenceState("manual");
      AsyncStorage.setItem("themePreference", "manual").catch(console.error);
    }
  };

  const setThemePreference = async (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    try {
      await AsyncStorage.setItem("themePreference", preference);

      // Aplicar el tema correspondiente según la nueva preferencia
      switch (preference) {
        case "system":
          setTheme(getSystemTheme());
          break;
        case "auto":
          setTheme(getAutoThemeByTime());
          break;
        case "manual":
          // Mantener el tema actual
          break;
      }
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  if (!isReady) {
    return null; // O un componente de carga
  }

  return (
    <ThemeContext.Provider value={{ theme, themePreference, toggleTheme, setThemePreference, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
