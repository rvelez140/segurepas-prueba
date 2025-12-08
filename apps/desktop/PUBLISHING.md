# 🚀 Cómo Publicar un Release de SecurePass Desktop

Esta guía te mostrará cómo publicar una nueva versión de la aplicación desktop.

## 📝 Método Rápido (Automático con GitHub Actions)

El proceso está **automatizado** mediante GitHub Actions. Solo necesitas crear un tag:

### Paso 1: Actualizar la Versión

Edita `apps/desktop/package.json` y actualiza el número de versión:

```json
{
  "version": "1.0.0" // Cambia a tu nueva versión
}
```

### Paso 2: Commit y Push

```bash
git add apps/desktop/package.json
git commit -m "Bump version to 1.0.0"
git push
```

### Paso 3: Crear y Publicar el Tag

```bash
# Crear tag localmente
git tag v1.0.0

# Enviar tag a GitHub (esto activa GitHub Actions automáticamente)
git push origin v1.0.0
```

### Paso 4: Esperar a GitHub Actions

1. Ve a la pestaña **Actions** en GitHub
2. Verás el workflow "Build and Release Desktop App" ejecutándose
3. Espera a que termine (puede tardar 10-15 minutos)
4. GitHub Actions compilará los instaladores para Windows y Linux
5. Creará automáticamente un Release con todos los archivos

### Paso 5: Editar Notas del Release (Opcional)

1. Ve a la pestaña **Releases** en GitHub
2. Encontrarás tu nuevo release publicado
3. Click en "Edit release"
4. Agrega o edita las notas del release según necesites
5. Guarda los cambios

**¡Listo!** Tu release está publicado y disponible para descargar.

---

## 🛠️ Método Manual (Sin GitHub Actions)

Si prefieres compilar y publicar manualmente:

### Paso 1: Preparar el Entorno

```bash
cd apps/desktop
npm install
```

### Paso 2: Actualizar Versión

Edita `package.json` y cambia la versión.

### Paso 3: Compilar Instaladores

**En Windows:**

```bash
npm run dist:win
```

**En Linux:**

```bash
npm run dist:linux
```

O ambos (si tienes ambos sistemas):

```bash
npm run dist
```

### Paso 4: Verificar Instaladores

Los instaladores estarán en `apps/desktop/release/`:

```
release/
├── SecurePass-Setup-1.0.0.exe          # Instalador Windows
├── SecurePass-1.0.0-portable.exe       # Windows portable
├── SecurePass-1.0.0.AppImage           # Linux AppImage
├── securepass-desktop_1.0.0_amd64.deb  # Debian/Ubuntu
└── securepass-desktop-1.0.0.x86_64.rpm # Fedora/RHEL
```

### Paso 5: Probar Instaladores

Prueba al menos un instalador de cada plataforma antes de publicar.

### Paso 6: Crear Release en GitHub

#### Opción A: Interfaz Web

1. Ve a tu repositorio en GitHub
2. Click en **Releases** → **Draft a new release**
3. Tag: `v1.0.0`
4. Title: `SecurePass Desktop v1.0.0`
5. Descripción: Agrega las notas del release
6. Arrastra todos los archivos desde `release/`
7. Click en **Publish release**

#### Opción B: GitHub CLI

```bash
# Crear tag
git tag v1.0.0
git push origin v1.0.0

# Publicar release
gh release create v1.0.0 \
  --title "SecurePass Desktop v1.0.0" \
  --notes "Nueva versión con mejoras y correcciones" \
  apps/desktop/release/*.exe \
  apps/desktop/release/*.AppImage \
  apps/desktop/release/*.deb \
  apps/desktop/release/*.rpm
```

---

## 📋 Template de Notas de Release

Copia y edita este template para tus releases:

```markdown
## 🎉 Novedades

- [ Lista las nuevas características ]

## 🔧 Mejoras

- [ Mejoras de rendimiento o UX ]

## 🐛 Correcciones

- [ Bugs corregidos ]

## 📥 Instalación

**Windows:**

- Descarga `SecurePass-Setup-X.X.X.exe` para instalación completa
- O `SecurePass-X.X.X-portable.exe` para versión portable

**Linux:**

- **Ubuntu/Debian:** `sudo dpkg -i securepass-desktop_X.X.X_amd64.deb`
- **Fedora/RHEL:** `sudo rpm -i securepass-desktop-X.X.X.x86_64.rpm`
- **Universal:** `chmod +x SecurePass-X.X.X.AppImage && ./SecurePass-X.X.X.AppImage`

## 🔗 Cambios Completos

Ver todos los commits: https://github.com/user/repo/compare/vX.X.X...vX.X.X
```

---

## 🔢 Versionado Semántico

Usa el formato `MAJOR.MINOR.PATCH`:

- **1.0.0** → Primera versión estable
- **1.1.0** → Nueva característica
- **1.1.1** → Corrección de bug
- **2.0.0** → Cambio incompatible con versiones anteriores

---

## ✅ Checklist Pre-Release

Antes de publicar, verifica:

- [ ] Versión actualizada en `package.json`
- [ ] Todos los tests pasan
- [ ] La aplicación compila sin errores
- [ ] Instaladores probados en Windows y Linux
- [ ] Notas de release preparadas
- [ ] Tag creado con formato `vX.Y.Z`
- [ ] Documentación actualizada si hay cambios importantes

---

## 🐛 Solución de Problemas

### El workflow de GitHub Actions falla

1. Revisa los logs en la pestaña Actions
2. Verifica que `package.json` tenga todas las dependencias
3. Asegúrate de que el repositorio tenga permisos de escritura para GITHUB_TOKEN

### Los instaladores no se generan

1. Verifica que tengas las dependencias del sistema:
   - **Linux:** `rpm` para generar RPM
   - **Windows:** Ejecutar en Windows nativo (no WSL)

2. Limpia caché y reinstala:
   ```bash
   rm -rf node_modules dist release
   npm install
   npm run dist
   ```

### El auto-updater no funciona

1. Verifica que el tag sea formato `vX.Y.Z`
2. Los releases deben ser públicos
3. Revisa la configuración en `src/main.ts`

---

## 🔄 Actualizar un Release

Si necesitas modificar un release ya publicado:

```bash
# Eliminar el release (mantiene el tag)
gh release delete v1.0.0

# Volver a crear con archivos actualizados
gh release create v1.0.0 \
  --title "SecurePass Desktop v1.0.0" \
  --notes "..." \
  apps/desktop/release/*
```

---

## 📞 Soporte

Si tienes problemas publicando un release:

- Revisa [RELEASE.md](RELEASE.md) para más detalles
- Abre un issue en GitHub
- Consulta la documentación de [electron-builder](https://www.electron.build/)
