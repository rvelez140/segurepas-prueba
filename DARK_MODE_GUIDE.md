# Guía de Modo Oscuro - SecurePas

## Resumen

Se ha implementado un sistema completo de modo oscuro/claro en **todos los aplicativos** del proyecto SecurePas con las siguientes características:

✅ **Cambio automático por hora del día**
✅ **Detección de preferencia del sistema operativo**
✅ **Control manual del usuario**
✅ **Persistencia de preferencias**
✅ **Soporte multiplataforma** (Web, Mobile, Desktop)

---

## Características Implementadas

### 🌐 Aplicación Web

**Ubicación:** `/apps/web`

#### Archivos modificados:
- `src/contexts/ThemeContext.tsx` - Context mejorado con 3 modos
- `src/components/settings/ThemeToggle.tsx` - Componente con menú de configuración
- `src/styles/themeToggle.module.css` - Estilos actualizados

#### Funcionalidades:
1. **Modo Manual** 👆
   - El usuario elige manualmente entre claro/oscuro
   - Se guarda en `localStorage` con clave `theme`
   - Toggle rápido con botón Sol/Luna

2. **Modo Automático** 🕐
   - Cambia automáticamente según la hora del día
   - **6:00 AM - 6:00 PM** → Modo claro
   - **6:00 PM - 6:00 AM** → Modo oscuro
   - Se actualiza cada minuto

3. **Modo Sistema** 📱
   - Sigue la preferencia del sistema operativo
   - Detecta cambios en tiempo real usando `matchMedia`
   - Compatible con Electron (desktop)

#### Uso:
```typescript
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, themePreference, toggleTheme, setThemePreference } = useTheme();

  // theme: "light" | "dark"
  // themePreference: "manual" | "auto" | "system"

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={toggleTheme}>Cambiar tema</button>
      <button onClick={() => setThemePreference('auto')}>Modo automático</button>
    </div>
  );
}
```

---

### 📱 Aplicación Móvil

**Ubicación:** `/apps/mobile`

#### Archivos creados/modificados:
- `src/contexts/ThemeContext.tsx` - Context para React Native (NUEVO)
- `src/components/settings/ThemeToggle.tsx` - Componente nativo (NUEVO)
- `App.tsx` - Envuelto con `ThemeProvider`

#### Funcionalidades:
1. **Modo Manual** 👆
   - Control manual del tema
   - Persistencia con `AsyncStorage`

2. **Modo Automático** 🕐
   - Cambio automático por hora (6AM-6PM)
   - Actualización cada minuto

3. **Modo Sistema** 📱
   - Usa `Appearance` de React Native
   - Detecta cambios del sistema en tiempo real
   - Compatible con iOS y Android

#### Uso:
```typescript
import { useTheme } from './contexts/ThemeContext';
import { View, Text } from 'react-native';

function MyScreen() {
  const { theme, colors, setThemePreference } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hola mundo</Text>
    </View>
  );
}
```

#### Colores disponibles:
```typescript
interface ColorScheme {
  background: string;      // Fondo principal
  surface: string;         // Superficies (cards, modales)
  primary: string;         // Color primario
  primaryHover: string;    // Hover del primario
  text: string;            // Texto principal
  textSecondary: string;   // Texto secundario
  border: string;          // Bordes
  error: string;           // Errores
  success: string;         // Éxitos
  warning: string;         // Advertencias
  card: string;            // Cards
  shadow: string;          // Sombras
}
```

---

### 🖥️ Aplicación Desktop

**Ubicación:** `/apps/desktop`

#### Archivos modificados:
- `src/main.ts` - Manejadores IPC para tema del sistema
- `src/preload.ts` - APIs expuestas al renderer

#### Funcionalidades:
- Detecta el tema del sistema usando `nativeTheme` de Electron
- Comunica cambios del sistema a la aplicación web vía IPC
- Sincronización en tiempo real con el sistema operativo

#### APIs de Electron expuestas:
```typescript
// Obtener tema del sistema
window.electronAPI.getSystemTheme() // Promise<'light' | 'dark'>

// Obtener fuente del tema
window.electronAPI.getThemeSource() // Promise<'system' | 'light' | 'dark'>

// Establecer fuente del tema
window.electronAPI.setThemeSource('system') // Promise<'system' | 'light' | 'dark'>

// Escuchar cambios del tema
const unsubscribe = window.electronAPI.onThemeChanged((theme) => {
  console.log('Nuevo tema:', theme.shouldUseDarkColors ? 'dark' : 'light');
});

// Cancelar suscripción
unsubscribe();
```

---

## Persistencia de Datos

### Web App
- **Preferencia de tema:** `localStorage.getItem('themePreference')`
- **Tema manual:** `localStorage.getItem('theme')`

### Mobile App
- **Preferencia de tema:** `AsyncStorage.getItem('themePreference')`
- **Tema manual:** `AsyncStorage.getItem('theme')`

---

## Flujo de Trabajo

### Cambio de Preferencia

1. **Usuario selecciona "Sistema"**
   - Se detecta el tema actual del OS
   - Se aplica inmediatamente
   - Se guarda preferencia: `"system"`
   - Se escuchan cambios futuros del OS

2. **Usuario selecciona "Automático"**
   - Se calcula tema según hora actual
   - Se aplica inmediatamente
   - Se guarda preferencia: `"auto"`
   - Se inicia intervalo de verificación cada 60 segundos

3. **Usuario selecciona "Manual"** o hace **toggle**
   - Se cambia al tema opuesto (si es toggle)
   - Se guarda el tema elegido
   - Se guarda preferencia: `"manual"`
   - No hay actualizaciones automáticas

---

## Variables CSS (Web)

### Modo Claro (`body.light`)
```css
--white: #fff
--text: #111827
--bg: #f9fafb
--bg-sidebar: #f3f4f6
--blue: #0787f6
--blue-hover: #005fa3
--green: #22c55e
--red: #ef4444
```

### Modo Oscuro (`body.dark`)
```css
--white: #1e1e1e
--text: #f9fafb
--bg: #2b2b2b
--bg-sidebar: #3d3d3d
--blue: #0ea5e9
--blue-hover: #0284c7
--green: #4ade80
--red: #f87171
--qrfilter: invert(88.2%)
```

---

## Testing

### Probar modo automático por hora

Para probar el cambio automático, puedes modificar temporalmente la función en `ThemeContext.tsx`:

```typescript
// Original (6AM-6PM)
const getAutoThemeByTime = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
};

// Para testing (usar minutos)
const getAutoThemeByTime = (): Theme => {
  const minute = new Date().getMinutes();
  return minute < 30 ? "light" : "dark"; // Cambia cada media hora
};
```

### Probar detección del sistema

**En Web:**
1. Abre DevTools → Console
2. Ejecuta: `window.matchMedia('(prefers-color-scheme: dark)').matches`
3. Cambia el tema del OS y verifica que se actualice

**En Mobile:**
1. Cambia el tema del dispositivo (iOS/Android)
2. La app debería actualizarse automáticamente

**En Desktop:**
1. Cambia el tema del sistema operativo
2. La app Electron debería sincronizar inmediatamente

---

## Componentes UI

### ThemeToggle (Web)
```tsx
import ThemeToggle from './components/settings/ThemeToggle';

<ThemeToggle />
```

Muestra:
- Botón de toggle rápido (Sol/Luna)
- Botón de configuración (⚙️)
- Menú desplegable con opciones:
  - 👆 Manual
  - 🕐 Automático (6AM-6PM)
  - 📱 Sistema

### ThemeToggle (Mobile)
```tsx
import ThemeToggle from './components/settings/ThemeToggle';

<ThemeToggle />
```

Muestra:
- Botones circulares para toggle y configuración
- Modal con opciones de preferencia
- Descripción de cada modo

---

## Consideraciones Técnicas

### Performance
- Los intervalos se limpian correctamente al desmontar
- Los listeners se remueven al cambiar de modo
- Persistencia asíncrona en mobile (AsyncStorage)

### Compatibilidad
- **Web:** Todos los navegadores modernos (que soporten CSS Variables)
- **Mobile:** iOS 13+ / Android 10+ (API Appearance)
- **Desktop:** Windows 10+, macOS 10.14+, Linux (con Electron)

### Seguridad
- Validación de tipos con TypeScript
- Sanitización de valores de localStorage
- Context isolation en Electron

---

## Troubleshooting

### El tema no se guarda
- Verificar permisos de localStorage/AsyncStorage
- Revisar la consola para errores

### El tema no cambia automáticamente
- Verificar que la preferencia sea "auto" o "system"
- Revisar que los listeners estén activos
- Comprobar permisos del navegador/dispositivo

### La app Desktop no detecta el tema del sistema
- Verificar que Electron esté inicializado correctamente
- Revisar que `nativeTheme` esté disponible
- Comprobar la comunicación IPC (DevTools → Console)

---

## Próximos Pasos

Posibles mejoras futuras:

1. **Personalización de horarios**
   - Permitir al usuario configurar horas de cambio automático

2. **Temas personalizados**
   - Agregar más variantes de color
   - Temas por industria/contexto

3. **Animaciones de transición**
   - Transición suave entre temas
   - Efectos visuales al cambiar

4. **Modo alto contraste**
   - Para accesibilidad
   - Cumplir con WCAG 2.1

---

## Autores

Implementado por Claude en diciembre 2025 🤖

Para soporte o preguntas, consultar la documentación del proyecto principal.
