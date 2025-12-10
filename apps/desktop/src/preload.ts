import { contextBridge, ipcRenderer } from 'electron';

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Información de la aplicación
  getAppVersion: () => ipcRenderer.invoke('app-version'),

  // Información de la plataforma
  getPlatformInfo: () => ipcRenderer.invoke('platform-info'),

  // Identificar que es la versión desktop
  isDesktop: true,

  // Plataforma actual
  platform: process.platform,

  // APIs de tema
  getSystemTheme: () => ipcRenderer.invoke('get-system-theme'),
  getThemeSource: () => ipcRenderer.invoke('get-theme-source'),
  setThemeSource: (source: 'system' | 'light' | 'dark') =>
    ipcRenderer.invoke('set-theme-source', source),
  onThemeChanged: (
    callback: (theme: { shouldUseDarkColors: boolean; themeSource: string }) => void
  ) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      theme: { shouldUseDarkColors: boolean; themeSource: string }
    ) => callback(theme);
    ipcRenderer.on('theme-changed', subscription);
    return () => ipcRenderer.removeListener('theme-changed', subscription);
  },
});

// Tipos para TypeScript (opcional, para el lado del renderer)
export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getPlatformInfo: () => Promise<{
    platform: string;
    arch: string;
    version: string;
  }>;
  isDesktop: boolean;
  platform: string;
  getSystemTheme: () => Promise<'light' | 'dark'>;
  getThemeSource: () => Promise<'system' | 'light' | 'dark'>;
  setThemeSource: (source: 'system' | 'light' | 'dark') => Promise<'system' | 'light' | 'dark'>;
  onThemeChanged: (
    callback: (theme: { shouldUseDarkColors: boolean; themeSource: string }) => void
  ) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
