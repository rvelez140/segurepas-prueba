# SecurePass Desktop - Iconos

## Archivos de Iconos Requeridos

Para compilar la aplicacion de escritorio para todas las plataformas, necesitas los siguientes archivos de iconos:

### Windows
- `icon.ico` - Icono en formato ICO (256x256 px minimo)
  - Debe contener multiples resoluciones: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256

### macOS
- `icon.icns` - Icono en formato ICNS
  - Debe contener resoluciones: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
  - Incluir versiones @2x para Retina display

### Linux
- Carpeta `icons/` con archivos PNG en diferentes tamanios:
  - `icons/16x16.png`
  - `icons/32x32.png`
  - `icons/48x48.png`
  - `icons/64x64.png`
  - `icons/128x128.png`
  - `icons/256x256.png`
  - `icons/512x512.png`

## Como Generar los Iconos

### Opcion 1: Usando electron-icon-builder (Recomendado)

```bash
# Instalar la herramienta
npm install -g electron-icon-builder

# Desde una imagen PNG de 1024x1024
electron-icon-builder --input=./icon-source.png --output=./assets
```

### Opcion 2: Usando ImageMagick

```bash
# Windows ICO
convert icon-1024.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# macOS ICNS (requiere iconutil en macOS)
mkdir icon.iconset
sips -z 16 16 icon-1024.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon-1024.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon-1024.png --out icon.iconset/icon_32x32.png
sips -z 64 64 icon-1024.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon-1024.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon-1024.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon-1024.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon-1024.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon-1024.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon-1024.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o icon.icns

# Linux PNGs
for size in 16 32 48 64 128 256 512; do
  convert icon-1024.png -resize ${size}x${size} icons/${size}x${size}.png
done
```

### Opcion 3: Herramientas Online

- [CloudConvert](https://cloudconvert.com/png-to-icns) - Conversion PNG a ICNS/ICO
- [iConvert Icons](https://iconverticons.com/) - Generador de iconos multi-plataforma
- [App Icon Generator](https://appicon.co/) - Generador visual

## Requisitos del Icono Fuente

- Formato: PNG con transparencia
- Tamano: 1024x1024 pixeles (minimo)
- Sin bordes redondeados (electron-builder los aplica automaticamente para macOS)
- Fondo transparente recomendado

## Estructura Final

```
assets/
├── icon.ico              # Windows
├── icon.icns             # macOS
├── icon.png              # Linux (fallback)
├── icons/                # Linux (multiples tamanios)
│   ├── 16x16.png
│   ├── 32x32.png
│   ├── 48x48.png
│   ├── 64x64.png
│   ├── 128x128.png
│   ├── 256x256.png
│   └── 512x512.png
└── entitlements.mac.plist
```

## Verificacion

Para verificar que los iconos estan correctamente configurados:

```bash
# Verificar build sin generar instaladores
npm run pack

# Si no hay errores de iconos, los archivos estan correctos
```
