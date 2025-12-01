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
  platform: process.platform
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
