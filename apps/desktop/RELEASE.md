# Guía para Publicar Releases

Esta guía explica cómo publicar versiones oficiales de la aplicación desktop de SecurePass.

## Preparación antes del Release

1. **Actualizar versión** en `apps/desktop/package.json`:
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **Probar la compilación**:
   ```bash
   cd apps/desktop
   npm run dist
   ```

3. **Verificar instaladores** en `apps/desktop/release/`:
   - Windows: `.exe` (NSIS y portable)
   - Linux: `.AppImage`, `.deb`, `.rpm`

## Crear un Release en GitHub

### Opción 1: Interfaz Web de GitHub

1. Ve a la página del repositorio en GitHub
2. Click en "Releases" → "Draft a new release"
3. **Tag version**: `v1.0.0` (sigue versionado semántico)
4. **Release title**: `SecurePass Desktop v1.0.0`
5. **Descripción**: Agrega notas del release (ver template abajo)
6. **Subir archivos**: Arrastra los instaladores desde `apps/desktop/release/`:
   - `SecurePass-Setup-1.0.0.exe` (Instalador Windows NSIS)
   - `SecurePass-1.0.0-portable.exe` (Windows Portable)
   - `SecurePass-1.0.0.AppImage` (Linux Universal)
   - `securepass-desktop_1.0.0_amd64.deb` (Linux Debian/Ubuntu)
   - `securepass-desktop-1.0.0.x86_64.rpm` (Linux Fedora/RHEL)
7. Click en "Publish release"

### Opción 2: Línea de Comandos (gh CLI)

```bash
# Compilar instaladores
cd apps/desktop
npm run dist

# Crear release y subir archivos
gh release create v1.0.0 \
  --title "SecurePass Desktop v1.0.0" \
  --notes-file RELEASE_NOTES.md \
  release/*.exe \
  release/*.AppImage \
  release/*.deb \
  release/*.rpm
```

## Template de Notas de Release

```markdown
# SecurePass Desktop v1.0.0

## 🎉 Novedades

- Nueva aplicación desktop para Windows y Linux
- Integración completa con la aplicación web
- Sistema de actualizaciones automáticas
- Menús nativos en español

## 🔧 Mejoras

- Rendimiento optimizado
- Mejor gestión de memoria
- Interfaz más responsiva

## 🐛 Correcciones

- Arreglado problema de conexión intermitente
- Solucionado error al escanear códigos QR

## 📥 Descargas

### Windows
- **SecurePass-Setup-1.0.0.exe** - Instalador completo (recomendado)
- **SecurePass-1.0.0-portable.exe** - Versión portable (no requiere instalación)

### Linux
- **SecurePass-1.0.0.AppImage** - Universal para todas las distribuciones
- **securepass-desktop_1.0.0_amd64.deb** - Para Ubuntu/Debian
- **securepass-desktop-1.0.0.x86_64.rpm** - Para Fedora/RHEL/CentOS

## 📋 Requisitos

**Windows:** Windows 10 o superior (64-bit)
**Linux:** Kernel 3.10+, entorno de escritorio

## 🔗 Enlaces Útiles

- [Documentación](../apps/desktop/README.md)
- [Reportar un problema](../../issues)
- [Changelog completo](../../compare/v0.9.0...v1.0.0)

---

**Checksums (SHA256):**
```
[Aquí irían los checksums de cada archivo para verificación]
```
```

## Versionado Semántico

Seguir el formato `MAJOR.MINOR.PATCH`:

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de bugs compatibles con versiones anteriores

Ejemplos:
- `1.0.0` - Primera versión estable
- `1.1.0` - Nueva característica
- `1.1.1` - Corrección de bug
- `2.0.0` - Cambio mayor incompatible

## Generar Checksums

Para agregar checksums de seguridad a tus releases:

### Windows (PowerShell)
```powershell
Get-FileHash *.exe, *.AppImage, *.deb, *.rpm | Format-List
```

### Linux/macOS
```bash
sha256sum release/*.{exe,AppImage,deb,rpm} > checksums.txt
```

## Actualización Automática

Las aplicaciones desktop buscarán actualizaciones automáticamente desde los releases de GitHub. Asegúrate de:

1. El tag del release sea formato `vX.Y.Z`
2. Los archivos estén correctamente nombrados
3. El repositorio sea público o tengas configurado el token de acceso

## Publicar Pre-releases

Para versiones beta o candidatas a release:

```bash
gh release create v1.1.0-beta.1 \
  --title "SecurePass Desktop v1.1.0 Beta 1" \
  --prerelease \
  --notes "Versión beta para pruebas. No usar en producción." \
  release/*.exe release/*.AppImage release/*.deb release/*.rpm
```

## Checklist antes de Publicar

- [ ] Versión actualizada en `package.json`
- [ ] Código compilado sin errores
- [ ] Todas las pruebas pasan
- [ ] Instaladores probados en sistemas objetivo
- [ ] Notas de release preparadas
- [ ] Checksums generados
- [ ] Tag creado con formato `vX.Y.Z`
- [ ] Release publicado en GitHub
- [ ] Anunciado a usuarios (si aplica)

## Rollback de un Release

Si necesitas revertir un release:

```bash
# Eliminar release (mantiene el tag)
gh release delete v1.0.0

# Eliminar tag también
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

Luego publica un nuevo release con la versión corregida.

## Soporte de Versiones Antiguas

- **Última versión**: Soporte completo
- **Versión anterior**: Correcciones de seguridad
- **Versiones más antiguas**: Sin soporte

Se recomienda a los usuarios mantener actualizada la aplicación para recibir las últimas características y correcciones de seguridad.
