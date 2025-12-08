import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import * as path from 'path';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;

// Determinar si estamos en desarrollo
const isDevelopment = process.env.NODE_ENV !== 'production';

// URL de la aplicación web (ajusta según tu configuración)
const WEB_APP_URL = isDevelopment ? 'http://localhost:3000' : 'http://localhost:3000'; // Cambia esto a tu URL de producción

function createWindow(): void {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'SecurePass - Control de Acceso',
    backgroundColor: '#ffffff',
    show: false, // No mostrar hasta que esté lista
  });

  // Cargar la aplicación web
  if (isDevelopment) {
    // En desarrollo, cargar desde el servidor de desarrollo
    mainWindow.loadURL(WEB_APP_URL);
    // Abrir DevTools en desarrollo
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar desde archivos locales o URL remota
    mainWindow.loadURL(WEB_APP_URL);
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Abrir enlaces externos en el navegador predeterminado
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Evento cuando se cierra la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Crear menú de aplicación
  createApplicationMenu();

  // Verificar actualizaciones (solo en producción)
  if (!isDevelopment) {
    checkForUpdates();
  }
}

function createApplicationMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'delete', label: 'Eliminar' },
        { type: 'separator' },
        { role: 'selectAll', label: 'Seleccionar todo' },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'resetZoom', label: 'Zoom normal' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' },
      ],
    },
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Cerrar' },
      ],
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de SecurePass',
          click: () => {
            showAboutDialog();
          },
        },
        { type: 'separator' },
        {
          label: 'Documentación',
          click: async () => {
            await shell.openExternal('https://github.com/tzeik/secure-pass');
          },
        },
      ],
    },
  ];

  // En desarrollo, agregar menú de herramientas
  if (isDevelopment) {
    template.push({
      label: 'Desarrollo',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar recarga' },
        { role: 'toggleDevTools', label: 'Herramientas de desarrollo' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAboutDialog(): void {
  const { dialog } = require('electron');
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'Acerca de SecurePass',
    message: 'SecurePass Desktop',
    detail: `Versión: ${app.getVersion()}\n\nSistema de Control de Acceso para Residencias\n\n© 2025 SecurePass Team`,
    buttons: ['OK'],
  });
}

function checkForUpdates(): void {
  // Configurar auto-updater
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    const { dialog } = require('electron');
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Actualización disponible',
      message: 'Hay una nueva versión disponible. Se descargará en segundo plano.',
      buttons: ['OK'],
    });
  });

  autoUpdater.on('update-downloaded', () => {
    const { dialog } = require('electron');
    dialog
      .showMessageBox(mainWindow!, {
        type: 'info',
        title: 'Actualización lista',
        message: 'La actualización se ha descargado. Se instalará al reiniciar la aplicación.',
        buttons: ['Reiniciar ahora', 'Más tarde'],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });
}

// Este método se llamará cuando Electron haya terminado la inicialización
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS es común recrear una ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar comunicación IPC (Inter-Process Communication)
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('platform-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
  };
});
