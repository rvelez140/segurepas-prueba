import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMyEnabledFeatures } from "../api/featureToggle.api";

interface FeatureToggleContextProps {
  enabledFeatures: string[];
  isFeatureEnabled: (featureKey: string) => boolean;
  refreshFeatures: () => Promise<void>;
  loading: boolean;
}

const FeatureToggleContext = createContext<FeatureToggleContextProps>({
  enabledFeatures: [],
  isFeatureEnabled: () => false,
  refreshFeatures: async () => {},
  loading: true,
});

export const FeatureToggleProvider = ({ children }: { children: ReactNode }) => {
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFeatures = async () => {
    try {
      setLoading(true);
      const response = await getMyEnabledFeatures();
      setEnabledFeatures(response.features);
    } catch (error) {
      console.error("Error cargando features habilitadas:", error);
      setEnabledFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar features al montar el componente
    refreshFeatures();
  }, []);

  const isFeatureEnabled = (featureKey: string): boolean => {
    return enabledFeatures.includes(featureKey);
  };

  return (
    <FeatureToggleContext.Provider
      value={{ enabledFeatures, isFeatureEnabled, refreshFeatures, loading }}
    >
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggle = () => useContext(FeatureToggleContext);
